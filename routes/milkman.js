import express from "express";
const router = express.Router();
import Customer from "../Models/customer.js";
import addMilk from "../Models/addmilk.js";
import milkman from "../Models/milkman.js";
import MilkmanCustomer from "../Models/milkmancustomer.js";
import sellMilk from "../Models/sellmilk.js";
import { isLoggedIn } from "../middleware/auth.js";
import { db } from "../config/firebase.js";
import { doc, writeBatch } from "firebase/firestore";

// Main milkman page
router.get("/", isLoggedIn, (req, res) => {
    const user = req.session.user;
    res.render("milkman/front.ejs", { user });
});

// Show all route customers
router.get("/allcustomers", isLoggedIn, async (req, res) => {
    const user = req.session.user;
    const allCustomer = await MilkmanCustomer.find({ milkmanCode: user.milkmanCode });
    res.render("milkman/index.ejs", { allCustomer });
});

// Add customer form
router.get("/add", isLoggedIn, (req, res) => {
    const user = req.session.user;
    res.render("milkman/add.ejs", { user });
});

// Sell milk form
router.get("/sell", isLoggedIn, (req, res) => {
    const user = req.session.user;
    res.render("milk/sell.ejs", { user });
});

// API: Fetch live household customer details by code for side view
router.get("/api/customer/:code", isLoggedIn, async (req, res) => {
    try {
        const user = req.session.user;
        const code = Number(req.params.code);
        if (!code) {
            return res.status(400).json({ success: false, message: "Invalid customer code" });
        }

        const customer = await MilkmanCustomer.findOne({ code: code, milkmanCode: user.milkmanCode });
        if (!customer) {
            return res.json({ success: true, found: false });
        }

        // Fetch sales/delivery logs for this customer under this milkman
        const deliveryLogs = await sellMilk.find({ code: code, milkmanCode: user.milkmanCode });
        let totalLiters = 0;
        let totalAmount = 0;
        let lastEntry = null;

        if (deliveryLogs && deliveryLogs.length > 0) {
            deliveryLogs.sort((a, b) => {
                const dateDiff = new Date(a.date) - new Date(b.date);
                if (dateDiff !== 0) return dateDiff;
                if (a.shift === "Mor" && b.shift !== "Mor") return -1;
                if (a.shift !== "Mor" && b.shift === "Mor") return 1;
                return 0;
            });
            deliveryLogs.forEach(entry => {
                totalLiters += (Number(entry.liter) || 0);
                totalAmount += (Number(entry.amount) || 0);
            });
            lastEntry = deliveryLogs[deliveryLogs.length - 1];
        }

        return res.json({
            success: true,
            found: true,
            customer: {
                id: customer._id,
                code: customer.code,
                name: `${customer.first || ''} ${customer.last || ''}`.trim(),
                first: customer.first,
                last: customer.last,
                contact: customer.contact,
                address: customer.address || 'Household Delivery Address',
                milkmanCode: customer.milkmanCode,
                totalLiters: parseFloat(totalLiters.toFixed(2)),
                totalAmount: parseFloat(totalAmount.toFixed(2)),
                totalEntries: deliveryLogs ? deliveryLogs.length : 0,
                lastEntry: lastEntry ? {
                    date: lastEntry.date,
                    shift: lastEntry.shift,
                    liter: lastEntry.liter,
                    rate: lastEntry.rate,
                    amount: lastEntry.amount
                } : null
            }
        });
    } catch (err) {
        console.error("API milkman customer lookup error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Sell milk with automatic date, automatic shift, and Fat + SNF calculation
router.post("/sell", isLoggedIn, async (req, res) => {
    try {
        const details = req.body.milk;
        const now = new Date();
        const hours = now.getHours();

        // 1. Automatically set Date & Shift (Cannot be modified)
        details.date = now;
        details.shift = (hours >= 3 && hours < 13) ? "Mor" : "Eve";

        // 2. Calculate Rate using Fat and SNF
        const fat = parseFloat(details.fat) || 6.5;
        const snf = parseFloat(details.snf) || 8.5;
        const calculatedRate = parseFloat(((fat * 6.5) + (snf * 3.5)).toFixed(2));
        const liter = parseFloat(details.liter) || 0;
        const totalAmount = parseFloat((calculatedRate * liter).toFixed(2));

        details.fat = fat;
        details.snf = snf;
        details.rate = calculatedRate;
        details.liter = liter;
        details.amount = totalAmount;

        await sellMilk.insertOne(details);

        req.flash("success", `Delivery recorded: ${liter}L @ ₹${calculatedRate}/L (Fat: ${fat}%, SNF: ${snf}%). Total: ₹${totalAmount}`);
        res.redirect("/milkman");
    } catch (err) {
        console.error("Sell milk error:", err);
        req.flash("error", "Failed to record milk delivery.");
        res.redirect("/milkman/sell");
    }
});

// Settle customer payment (Marks records as paid using writeBatch)
router.post("/pay", isLoggedIn, async (req, res) => {
    try {
        const custCode = req.body.pay.code;
        const deliveries = await sellMilk.find({ code: custCode });
        if (deliveries && deliveries.length > 0) {
            const batch = writeBatch(db);
            for (const d of deliveries) {
                const docRef = doc(db, "sellmilk", d._id);
                batch.update(docRef, { isPaid: true });
            }
            await batch.commit();
        }
        req.flash("success", "Customer dues settled successfully! All records marked as Paid.");
        res.redirect("/milkman");
    } catch (err) {
        console.error("Pay customer error:", err);
        req.flash("error", "Failed to settle payment.");
        res.redirect("/milkman");
    }
});

// Show milkman sales details (Sorted latest date first)
router.get("/details", isLoggedIn, async (req, res) => {
    const user = req.session.user;
    const dairyDetails = await milkman.findOne({ milkmanCode: user.milkmanCode });
    const details = await sellMilk.find({ milkmanCode: user.milkmanCode });
    if (details && details.length > 0) {
        details.sort((a, b) => {
            const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateDiff !== 0) return dateDiff;
            if ((a.shift === "Eve" || a.shift === "Evening") && (b.shift === "Mor" || b.shift === "Morning")) return -1;
            if ((a.shift === "Mor" || a.shift === "Morning") && (b.shift === "Eve" || b.shift === "Evening")) return 1;
            return 0;
        });
        details.forEach(entry => {
            entry.isPaymentCompleted = (entry.isPaid === true);
        });
    }
    res.render("milkman/details.ejs", { details, total: 0, totalmilk: 0, dairyDetails });
});

// Delete all sales records for milkman
router.post("/delete", isLoggedIn, async (req, res) => {
    try {
        await sellMilk.deleteMany({ milkmanCode: req.body.dairy.code });
        req.flash("success", "All milk delivery records cleared successfully.");
        res.redirect("/milkman");
    } catch (err) {
        console.error("Delete milkman records error:", err);
        req.flash("error", "Failed to clear records.");
        res.redirect("/milkman");
    }
});

// Show individual customer
router.get("/:id", isLoggedIn, async (req, res) => {
    try {
        const customer = await MilkmanCustomer.findById(req.params.id);
        if (!customer) {
            req.flash("error", "Customer not found");
            return res.redirect("/milkman/allcustomers");
        }

        const milk = await sellMilk.find({ code: customer.code });
        if (milk && milk.length > 0) {
            // Sort LATEST DATE FIRST (newest records on top; Evening before Morning on same date)
            milk.sort((a, b) => {
                const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
                if (dateDiff !== 0) return dateDiff;
                if ((a.shift === "Eve" || a.shift === "Evening") && (b.shift === "Mor" || b.shift === "Morning")) return -1;
                if ((a.shift === "Mor" || a.shift === "Morning") && (b.shift === "Eve" || b.shift === "Evening")) return 1;
                return 0;
            });
            milk.forEach(entry => {
                entry.isPaymentCompleted = (entry.isPaid === true);
            });
        }

        res.render("milkman/show.ejs", {
            customer,
            milk,
            total: 0
        });
    } catch (err) {
        console.error("Error loading customer details:", err);
        req.flash("error", "Internal Server Error");
        res.redirect("/milkman/allcustomers");
    }
});

// Add customer to DB
router.post("/", isLoggedIn, async (req, res) => {
    try {
        const newCustomer = req.body.customer;
        await MilkmanCustomer.insertOne(newCustomer);
        req.flash("success", "New route customer registered successfully.");
        res.redirect("/milkman/allcustomers");
    } catch (err) {
        console.error("Add customer error:", err);
        req.flash("error", "Failed to register customer.");
        res.redirect("/milkman/add");
    }
});

// Edit form
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    const customer = await MilkmanCustomer.findById(req.params.id);
    if (!customer) {
        req.flash("error", "Customer not found");
        return res.redirect("/milkman/allcustomers");
    }
    res.render("milkman/edit.ejs", { customer });
});

// Update DB
router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        await MilkmanCustomer.findByIdAndUpdate(req.params.id, { ...req.body.customer });
        req.flash("success", "Customer updated successfully.");
        res.redirect("/milkman/allcustomers");
    } catch (err) {
        console.error("Update customer error:", err);
        req.flash("error", "Failed to update customer.");
        res.redirect("/milkman/allcustomers");
    }
});

// Delete customer
router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        await MilkmanCustomer.findByIdAndDelete(req.params.id);
        req.flash("success", "Customer removed successfully.");
        res.redirect("/milkman/allcustomers");
    } catch (err) {
        console.error("Delete customer error:", err);
        req.flash("error", "Failed to delete customer.");
        res.redirect("/milkman/allcustomers");
    }
});

export default router;
