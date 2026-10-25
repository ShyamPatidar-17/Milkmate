import express from "express";
const router = express.Router();
import Customer from "../Models/customer.js";
import addMilk from "../Models/addmilk.js";
import Settlement from "../Models/settlement.js";
import { isLoggedIn } from "../middleware/auth.js";

// Main dairy page
router.get("/dairy", isLoggedIn, (req, res) => {
    const user = req.session.user;
    res.render("dairy/front.ejs", { user });
});

// Show all customers under logged-in dairy with settlement balances
router.get("/allcustomers", isLoggedIn, async (req, res) => {
    try {
        const user = req.session.user;
        const dairyCode = user?.dairyCode;
        if (!dairyCode) {
            req.flash("error", "Please sign in with a dairy account to view customers.");
            return res.redirect("/login");
        }

        const allCustomer = await Customer.find({ codeD: dairyCode }).sort({ code: 1 });
        
        // Fetch all milk & settlements for this dairy to compute summary for directory table
        const allMilk = await addMilk.find({ dairyCode: dairyCode });
        const allSettlements = await Settlement.find({ dairyCode: dairyCode });

        // Map dues per customer code
        const grossMap = {};
        allMilk.forEach(e => {
            const c = Number(e.code);
            grossMap[c] = (grossMap[c] || 0) + (Number(e.amount) || 0);
        });

        const settledMap = {};
        allSettlements.forEach(s => {
            const c = Number(s.customerCode);
            settledMap[c] = (settledMap[c] || 0) + (Number(s.settledAmount) || 0);
        });

        // Enrich customer objects with settlement status
        const enrichedCustomers = allCustomer.map(cust => {
            const c = Number(cust.code);
            const gross = parseFloat((grossMap[c] || 0).toFixed(2));
            const settled = parseFloat((settledMap[c] || 0).toFixed(2));
            const pending = Math.max(0, parseFloat((gross - settled).toFixed(2)));
            return {
                ...cust,
                grossEarnings: gross,
                totalSettled: settled,
                netPending: pending,
                isCleared: (gross > 0 && pending === 0)
            };
        });

        res.render("dairy/index.ejs", { allCustomer: enrichedCustomers });
    } catch (err) {
        console.error("Error loading dairy customers:", err);
        req.flash("error", "Failed to retrieve customers.");
        res.redirect("/dairy");
    }
});

// Add customer form
router.get("/add", isLoggedIn, (req, res) => {
    const user = req.session.user;
    res.render("dairy/add.ejs", { user });
});

// Show individual customer profile with full settlement records & partial settlement controls
router.get("/:id", isLoggedIn, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            req.flash("error", "Customer not found");
            return res.redirect("/customers/allcustomers");
        }

        const milk = await addMilk.find({
            code: customer.code,
            dairyCode: customer.codeD
        });

        // Fetch settlement history for this customer
        const settlements = await Settlement.find({
            customerCode: customer.code,
            dairyCode: customer.codeD
        });

        // Sort settlements latest first
        if (settlements && settlements.length > 0) {
            settlements.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        const totalGross = milk ? milk.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0) : 0;
        const totalSettled = settlements ? settlements.reduce((sum, s) => sum + (Number(s.settledAmount) || 0), 0) : 0;
        const netPending = Math.max(0, parseFloat((totalGross - totalSettled).toFixed(2)));

        // Evaluate payment completion and sort records LATEST DATE FIRST
        if (milk && milk.length > 0) {
            // 1. Calculate FIFO payment coverage chronologically (oldest to newest)
            const chronological = [...milk].sort((a, b) => {
                const d = new Date(a.date).getTime() - new Date(b.date).getTime();
                if (d !== 0) return d;
                if ((a.shift === "Mor" || a.shift === "Morning") && (b.shift === "Eve" || b.shift === "Evening")) return -1;
                return 1;
            });

            let runningPaid = 0;
            chronological.forEach(entry => {
                runningPaid += (Number(entry.amount) || 0);
                entry.isPaymentCompleted = (netPending === 0 && totalGross > 0) || (runningPaid <= totalSettled + 0.05) || (entry.isPaid === true);
            });

            // 2. Sort LATEST DATE FIRST (newest records on top; Evening before Morning on same date)
            milk.sort((a, b) => {
                const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
                if (dateDiff !== 0) return dateDiff;
                if ((a.shift === "Eve" || a.shift === "Evening") && (b.shift === "Mor" || b.shift === "Morning")) return -1;
                if ((a.shift === "Mor" || a.shift === "Morning") && (b.shift === "Eve" || b.shift === "Evening")) return 1;
                return 0;
            });
        }

        res.render("dairy/show.ejs", {
            customer,
            milk: milk || [],
            settlements: settlements || [],
            totalGross: parseFloat(totalGross.toFixed(2)),
            totalSettled: parseFloat(totalSettled.toFixed(2)),
            netPending: parseFloat(netPending.toFixed(2))
        });
    } catch (err) {
        console.error("Error loading customer details:", err);
        req.flash("error", "Internal Server Error");
        res.redirect("/customers/allcustomers");
    }
});

// Add customer to DB
router.post("/", isLoggedIn, async (req, res) => {
    try {
        const newCustomer = req.body.customer;
        await Customer.insertOne(newCustomer);
        req.flash("success", "Customer enrolled successfully.");
        res.redirect("/customers/allcustomers");
    } catch (err) {
        console.error("Error adding customer:", err);
        req.flash("error", "Failed to add customer.");
        res.redirect("/customers/add");
    }
});

// Edit form
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
        req.flash("error", "Customer not found");
        return res.redirect("/customers/allcustomers");
    }
    res.render("dairy/edit.ejs", { customer });
});

// Update DB
router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        await Customer.findByIdAndUpdate(req.params.id, { ...req.body.customer });
        req.flash("success", "Customer updated successfully.");
        res.redirect("/customers/allcustomers");
    } catch (err) {
        console.error("Error updating customer:", err);
        req.flash("error", "Failed to update customer.");
        res.redirect("/customers/allcustomers");
    }
});

// Delete
router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        req.flash("success", "Customer deleted.");
        res.redirect("/customers/allcustomers");
    } catch (err) {
        console.error("Error deleting customer:", err);
        req.flash("error", "Failed to delete customer.");
        res.redirect("/customers/allcustomers");
    }
});

export default router;
