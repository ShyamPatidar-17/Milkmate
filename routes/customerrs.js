import express from "express";
const router = express.Router();
import Customer from "../Models/customer.js";
import addMilk from "../Models/addmilk.js";
import customerrs from "../Models/customerr.js";
import Settlement from "../Models/settlement.js";
import { isLoggedIn } from "../middleware/auth.js";

// Main customer dashboard page
router.get("/", isLoggedIn, (req, res) => {
    const user = req.session.user;
    res.render("customer/front.ejs", { user });
});

// Show individual customer passbook & details
router.get("/details", isLoggedIn, async (req, res) => {
    try {
        const user = req.session.user;
        const dairyCode = user?.dairyCode || user?.codeD;
        const code = user?.code;

        if (!dairyCode || !code) {
            req.flash("error", "Please sign in with your customer account.");
            return res.redirect("/login");
        }

        const customer = await Customer.findOne({ codeD: dairyCode, code: code });
        const milks = await addMilk.find({ dairyCode: dairyCode, code: code });
        const settlements = await Settlement.find({ dairyCode: dairyCode, customerCode: code });
        if (settlements && settlements.length > 0) {
            settlements.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        const totalGross = milks ? milks.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0) : 0;
        const totalSettled = settlements ? settlements.reduce((sum, s) => sum + (Number(s.settledAmount) || 0), 0) : 0;
        const netPending = Math.max(0, parseFloat((totalGross - totalSettled).toFixed(2)));

        // Evaluate payment completion and sort passbook LATEST DATE FIRST
        if (milks && milks.length > 0) {
            // 1. Calculate FIFO payment coverage chronologically (oldest to newest)
            const chronological = [...milks].sort((a, b) => {
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
            milks.sort((a, b) => {
                const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
                if (dateDiff !== 0) return dateDiff;
                if ((a.shift === "Eve" || a.shift === "Evening") && (b.shift === "Mor" || b.shift === "Morning")) return -1;
                if ((a.shift === "Mor" || a.shift === "Morning") && (b.shift === "Eve" || b.shift === "Evening")) return 1;
                return 0;
            });
        }

        res.render("customer/show.ejs", { 
            customer: customer || user, 
            milks: milks || [], 
            settlements: settlements || [],
            totalGross: parseFloat(totalGross.toFixed(2)),
            totalSettled: parseFloat(totalSettled.toFixed(2)),
            netPending: parseFloat(netPending.toFixed(2)),
            total: totalGross 
        });
    } catch (err) {
        console.error("Error loading customer details:", err);
        req.flash("error", "Failed to retrieve passbook.");
        res.redirect("/customerrs");
    }
});

// Edit form
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            req.flash("error", "Customer not found");
            return res.redirect("/customerrs");
        }
        res.render("customer/edit.ejs", { customer });
    } catch (err) {
        console.error("Error fetching customer for edit:", err);
        req.flash("error", "Internal Server Error");
        res.redirect("/customerrs");
    }
});

// Update DB
router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        await Customer.findByIdAndUpdate(req.params.id, { ...req.body.customer });
        req.flash("success", "Profile updated successfully.");
        res.redirect("/customerrs");
    } catch (err) {
        console.error("Error updating profile:", err);
        req.flash("error", "Failed to update profile.");
        res.redirect("/customerrs");
    }
});

router.get("/product", (req, res) => res.redirect("/product/all"));

export default router;
