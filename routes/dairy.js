import express from "express";
const router = express.Router();
import addMilk from "../Models/addmilk.js";
import Dairy from "../Models/dairy.js";
import Customer from "../Models/customer.js";
import Settlement from "../Models/settlement.js";
import { isLoggedIn } from "../middleware/auth.js";
import sendSMS from "../utils/sendSMS.js";
import { db } from "../config/firebase.js";
import { doc, writeBatch } from "firebase/firestore";

// Dairy home page
router.get("/", isLoggedIn, (req, res) => {
  const user = req.session.user;
  res.render("dairy/front.ejs", { user });
});

// Add milk form
router.get("/add", isLoggedIn, (req, res) => {
  const user = req.session.user;
  res.render("milk/add.ejs", { user });
});

// Add milk with automatic date, automatic shift, and Fat + SNF rate calculation
router.post("/add", isLoggedIn, async (req, res) => {
  try {
    const details = req.body.milk;
    const now = new Date();
    const hours = now.getHours();

    // 1. Automatically set Date & Shift (Cannot be modified)
    details.date = now;
    details.shift = hours >= 3 && hours < 13 ? "Mor" : "Eve";

    // 2. Calculate Rate using Fat and SNF
    const fat = parseFloat(details.fat) || 6.5;
    const snf = parseFloat(details.snf) || 8.5;
    const calculatedRate = parseFloat((fat * 6.5 + snf * 3.5).toFixed(2));
    const liter = parseFloat(details.liter) || 0;
    const totalAmount = parseFloat((calculatedRate * liter).toFixed(2));

    details.fat = fat;
    details.snf = snf;
    details.rate = calculatedRate;
    details.liter = liter;
    details.amount = totalAmount;

    await addMilk.insertOne(details);

    req.flash(
      "success",
      `Milk recorded: ${liter}L @ ₹${calculatedRate}/L (Fat: ${fat}%, SNF: ${snf}%). Total: ₹${totalAmount}`,
    );
    res.redirect("/dairy");
  } catch (err) {
    console.error("Add milk error:", err);
    req.flash("error", "Failed to record milk entry.");
    res.redirect("/dairy/add");
  }
});

// API: Fetch live farmer details by customer code for side view
router.get("/api/farmer/:code", isLoggedIn, async (req, res) => {
  try {
    const user = req.session.user;
    const code = Number(req.params.code);
    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid customer code" });
    }

    const customer = await Customer.findOne({
      code: code,
      codeD: user.dairyCode,
    });
    if (!customer) {
      return res.json({ success: true, found: false });
    }

    // Fetch historical intake logs for this customer
    const milkLogs = await addMilk.find({
      code: code,
      dairyCode: user.dairyCode,
    });
    let totalLiters = 0;
    let totalAmount = 0;
    let lastEntry = null;
    
    if (milkLogs && milkLogs.length > 0) {
      milkLogs.sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date); // Newest dates first
        if (dateDiff !== 0) return dateDiff;
        if (a.shift === "Mor" && b.shift !== "Mor") return 1; // Inverted shift priority
        if (a.shift !== "Mor" && b.shift === "Mor") return -1;
        return 0;
      });
      milkLogs.forEach((entry) => {
        totalLiters += Number(entry.liter) || 0;
        totalAmount += Number(entry.amount) || 0;
      });
      lastEntry = milkLogs[milkLogs.length - 1];
    }
    // Fetch settlement logs for this customer
    const settlements = await Settlement.find({
      customerCode: code,
      dairyCode: user.dairyCode,
    });
    let totalSettled = 0;
    let lastSettlement = null;
    if (settlements && settlements.length > 0) {
      settlements.sort((a, b) => new Date(b.date) - new Date(a.date));
      totalSettled = settlements.reduce(
        (sum, s) => sum + (Number(s.settledAmount) || 0),
        0,
      );
      lastSettlement = settlements[0];
    }
    const netPending = Math.max(
      0,
      parseFloat((totalAmount - totalSettled).toFixed(2)),
    );

    return res.json({
      success: true,
      found: true,
      customer: {
        id: customer._id,
        code: customer.code,
        name: `${customer.first || ""} ${customer.last || ""}`.trim(),
        first: customer.first,
        last: customer.last,
        contact: customer.contact,
        address: customer.address || "Village / Farm Address",
        codeD: customer.codeD,
        totalLiters: parseFloat(totalLiters.toFixed(2)),
        totalGross: parseFloat(totalAmount.toFixed(2)),
        totalSettled: parseFloat(totalSettled.toFixed(2)),
        netPending: parseFloat(netPending.toFixed(2)),
        totalEntries: milkLogs ? milkLogs.length : 0,
        lastEntry: lastEntry
          ? {
              date: lastEntry.date,
              shift: lastEntry.shift,
              liter: lastEntry.liter,
              rate: lastEntry.rate,
              amount: lastEntry.amount,
            }
          : null,
        lastSettlement: lastSettlement
          ? {
              date: lastSettlement.date,
              amount: lastSettlement.settledAmount,
              type: lastSettlement.type,
              remaining: lastSettlement.remainingBalance,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("API farmer lookup error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Pay milk (settle complete or partial dues for a customer)
router.post("/pay", isLoggedIn, async (req, res) => {
  try {
    const user = req.session.user;
    const { code, customerId, amount, mode, notes, settlementOption } =
      req.body.pay;
    const custCode = Number(code);
    const settleAmount = parseFloat(amount);

    if (!custCode || !settleAmount || settleAmount <= 0) {
      req.flash(
        "error",
        "Please enter a valid settlement amount greater than ₹0.",
      );
      return res.redirect(
        customerId ? `/customers/${customerId}` : "/customers/allcustomers",
      );
    }

    // Fetch all milk entries to calculate gross dues
    const milkLogs = await addMilk.find({
      code: custCode,
      dairyCode: user.dairyCode,
    });
    const grossEarnings = milkLogs.reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0,
    );

    // Fetch existing settlements
    const pastSettlements = await Settlement.find({
      customerCode: custCode,
      dairyCode: user.dairyCode,
    });
    const alreadySettled = pastSettlements.reduce(
      (sum, s) => sum + (Number(s.settledAmount) || 0),
      0,
    );

    const currentPending = Math.max(
      0,
      parseFloat((grossEarnings - alreadySettled).toFixed(2)),
    );

    if (settleAmount > currentPending) {
      req.flash(
        "error",
        `Settlement amount (₹${settleAmount.toFixed(2)}) exceeds current pending dues (₹${currentPending.toFixed(2)}).`,
      );
      return res.redirect(
        customerId ? `/customers/${customerId}` : "/customers/allcustomers",
      );
    }

    const remainingAfter = Math.max(
      0,
      parseFloat((currentPending - settleAmount).toFixed(2)),
    );
    const actualType = remainingAfter === 0 ? "Full" : "Partial";

    // Record the settlement transaction
    await Settlement.create({
      dairyCode: user.dairyCode,
      customerCode: custCode,
      customerId: customerId || null,
      date: new Date(),
      settledAmount: settleAmount,
      type: actualType,
      previousPending: currentPending,
      remainingBalance: remainingAfter,
      paymentMode: mode || "Cash",
      notes:
        notes ||
        (actualType === "Full"
          ? "Full account balance cleared"
          : "Partial installment payout"),
      settledBy: user.fullName || user.dname || `Dairy #${user.dairyCode}`,
    });

    // Mark settled milk records persistently with isPaid: true using writeBatch
    milkLogs.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const totalCoveredNow = alreadySettled + settleAmount;
    let runningAccrued = 0;
    const batch = writeBatch(db);
    let updateCount = 0;

    for (const log of milkLogs) {
      runningAccrued += Number(log.amount) || 0;
      if (actualType === "Full" || runningAccrued <= totalCoveredNow + 0.05) {
        if (!log.isPaid) {
          const docRef = doc(db, "addmilk", log._id);
          batch.update(docRef, { isPaid: true });
          updateCount++;
        }
      }
    }
    if (updateCount > 0) {
      await batch.commit();
    }

    req.flash(
      "success",
      `✓ Payment of ₹${settleAmount.toFixed(2)} successfully recorded (${actualType} Settlement). Remaining balance: ₹${remainingAfter.toFixed(2)}`,
    );
    res.redirect(
      customerId ? `/customers/${customerId}` : "/customers/allcustomers",
    );
  } catch (err) {
    console.error("Pay milk settlement error:", err);
    req.flash("error", "Failed to process settlement transaction.");
    res.redirect("/customers/allcustomers");
  }
});

// Show dairy details (All-customer milk intake ledger)
router.get("/details", isLoggedIn, async (req, res) => {
  const user = req.session.user;
  const dairyDetails = await Dairy.findOne({ dairyCode: user.dairyCode });
  const details = await addMilk.find({ dairyCode: user.dairyCode });
  const settlements = await Settlement.find({ dairyCode: user.dairyCode });

  // Map total settled amounts per customer code
  const settledMap = {};
  settlements.forEach((s) => {
    const c = Number(s.customerCode);
    settledMap[c] = (settledMap[c] || 0) + (Number(s.settledAmount) || 0);
  });

  // Group entries per customer to calculate FIFO paid status
  const custEntries = {};
  details.forEach((e) => {
    const c = Number(e.code);
    if (!custEntries[c]) custEntries[c] = [];
    custEntries[c].push(e);
  });

  Object.keys(custEntries).forEach((cStr) => {
    const c = Number(cStr);
    const list = custEntries[c];
    const custSettled = settledMap[c] || 0;
    const custGross = list.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
    const custPending = Math.max(0, custGross - custSettled);

    // Sort chronologically ascending to evaluate FIFO paid status
    list.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    let running = 0;
    list.forEach((item) => {
      running += Number(item.amount) || 0;
      item.isPaymentCompleted =
        (custPending === 0 && custGross > 0) ||
        running <= custSettled + 0.05 ||
        item.isPaid === true;
    });
  });

  // Sort all records LATEST DATE FIRST (newest records on top; Evening before Morning on same date)
  if (details && details.length > 0) {
    details.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      if (
        (a.shift === "Eve" || a.shift === "Evening") &&
        (b.shift === "Mor" || b.shift === "Morning")
      )
        return -1;
      if (
        (a.shift === "Mor" || a.shift === "Morning") &&
        (b.shift === "Eve" || b.shift === "Evening")
      )
        return 1;
      return 0;
    });
  }
  const total = 0;
  const totalmilk = 0;
  res.render("milk/details.ejs", { details, total, totalmilk, dairyDetails });
});

// Delete all entries by dairy code
router.post("/delete", isLoggedIn, async (req, res) => {
  try {
    await addMilk.deleteMany({ dairyCode: req.body.dairy.code });
    req.flash("success", "All dairy ledger records cleared successfully.");
    res.redirect("/dairy");
  } catch (err) {
    console.error("Delete dairy records error:", err);
    req.flash("error", "Failed to clear records.");
    res.redirect("/dairy");
  }
});

export default router;
