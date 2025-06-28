const express = require("express");
const router = express.Router();
const Customer = require("../Models/customer");
const addMilk = require("../Models/addmilk");
const milkman=require("../Models/milkman");
const MilkmanCustomer=require("../Models/milkmancustomer")
const sellMilk=require("../Models/sellmilk")
const { isLoggedIn } = require("../middleware/auth"); // <-- Import the middleware



// Main dairy page
router.get("/",isLoggedIn, (req, res) => {
    const user=req.session.user
    res.render("milkman/front.ejs",{user});
});


// Show all customers
router.get("/allcustomers", async (req, res) => {
        const user=req.session.user;
        console.log(user)
        const allCustomer = await MilkmanCustomer.find({milkmanCode:user.milkmanCode});
        console.log(allCustomer)
        res.render("milkman/index.ejs", { allCustomer });
});

// Add customer form
router.get("/add",(req,res)=>{
    const user = req.session.user;
     res.render("milkman/add.ejs",{ user });
})


router.get("/sell",(req,res)=>{
    const user=req.session.user;

    res.render("milk/sell.ejs",{user})
})


router.post("/sell", isLoggedIn, async (req, res) => {
    const details = req.body.milk;
    details.amount = details.rate * details.liter;
    await sellMilk.insertOne(details);
    res.redirect("/milkman");
});

router.post("/pay", isLoggedIn, async (req, res) => {
    await sellMilk.deleteMany({ code: req.body.pay.code });
    res.redirect("/milkman");
});




router.get("/details", isLoggedIn,async (req, res) => {
    const user=req.session.user;
    console.log(user)
        const dairyDetails = await milkman.findOne({ milkmanCode:user.milkmanCode});
        console.log(dairyDetails)
        const details=await sellMilk.find({milkmanCode:user.milkmanCode})
        console.log(details)
        res.render("milkman/details.ejs",{details,total:0,totalmilk:0,dairyDetails})
});

// Show dairy details

// Delete all entries by dairy code
router.post("/delete", isLoggedIn, async (req, res) => {
    await sellMilk.deleteMany({ milkmanCode: req.body.dairy.code });
    res.redirect("/milkman");
});





// Show individual customer
router.get("/:id", isLoggedIn, async (req, res) => {
    try {
        const customer = await MilkmanCustomer.findById(req.params.id); // Get one customer
        if (!customer) {
            return res.status(404).send("Customer not found");
        }

        const milk = await sellMilk.find({ code: customer.code }); // Get milk data by code

        res.render("milkman/show.ejs", {
            customer, // single customer
            milk,
            total: 0
        });
    } catch (err) {
        console.error("Error loading customer details:", err);
        res.status(500).send("Internal Server Error");
    }
});


// Add customer to DB
router.post("/", isLoggedIn, async (req, res) => {
    const user=req.session.user;
    const newCustomer = req.body.customer;
    console.log(newCustomer)
    await MilkmanCustomer.insertOne(newCustomer);
    res.redirect("/milkman/allcustomers");
});


// Edit form
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    const customer = await MilkmanCustomer.findById(req.params.id);
    res.render("milkman/edit.ejs", { customer });
});


// Update DB
router.put("/:id", isLoggedIn, async (req, res) => {
    await MilkmanCustomer.findByIdAndUpdate(req.params.id, { ...req.body.customer });
    res.redirect("/milkman/allcustomers");
});


// Delete
router.delete("/:id", isLoggedIn, async (req, res) => {
    await MilkmanCustomer.findByIdAndDelete(req.params.id);
    res.redirect("/milkman/allcustomers");
});


module.exports = router;

