const express = require("express");
const router = express.Router();
const addMilk = require("../Models/addmilk");
const Dairy = require("../Models/dairy");
const { isLoggedIn } = require("../middleware/auth");
const sendSMS = require("../utils/sendSMS");


// Dairy home page
router.get("/", isLoggedIn, (req, res) => {
    const user = req.session.user;
    console.log(user)
    res.render("dairy/front.ejs");
});

// Add milk form
router.get("/add", isLoggedIn, (req, res) => {
    const user = req.session.user;
    res.render("milk/add.ejs", { user });
});

// Add milk
router.post("/add", isLoggedIn, async (req, res) => {
    const details = req.body.milk;
    details.amount = details.rate * details.liter;
    await addMilk.insertOne(details);
    res.redirect("/dairy");
});

// Pay milk
router.post("/pay", isLoggedIn, async (req, res) => {
    await addMilk.deleteMany({ code: req.body.pay.code });
    res.redirect("/dairy");
});

// Show dairy details 

router.get("/details", isLoggedIn, async (req, res) => {
    const user = req.session.user;
    console.log(user)
    const dairyDetails = await Dairy.findOne({ dairyCode: user.dairyCode });
    console.log(dairyDetails)
    const details = await addMilk.find({ dairyCode: user.dairyCode })
    console.log(details)
    const total = 0
    const totalmilk = 0
    res.render("milk/details.ejs", { details, total, totalmilk, dairyDetails })
});

// Show dairy details

// Delete all entries by dairy code
router.post("/delete", isLoggedIn, async (req, res) => {
    await addMilk.deleteMany({ dairyCode: req.body.dairy.code });
    res.redirect("/dairy");
});

module.exports = router;
