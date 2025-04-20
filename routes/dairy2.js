const express = require("express");
const router = express.Router();
const Customer = require("../Models/customer");
const addMilk = require("../Models/addmilk");
const { isLoggedIn } = require("../middleware/auth"); // <-- Import the middleware





// Main dairy page
router.get("/dairy", isLoggedIn, (req, res) => {
    const user = req.session.user;
    res.render("dairy/front.ejs", { user });
});


        
// Show all customers
router.get("/allcustomers", async (req, res) => {
    const user=req.session.user;
        const allCustomer = await Customer.find({codeD:user.dairyCode});
        res.render("dairy/index.ejs", { allCustomer });
});

// Add customer form
router.get("/add",(req,res)=>{
    const user = req.session.user;
    console.log(user)
     res.render("dairy/add.ejs",{user});
})



// Show individual customer
router.get("/:id", isLoggedIn, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id); // Get one customer
        if (!customer) {
            return res.status(404).send("Customer not found");
        }

        const milk = await addMilk.find({ code: customer.code }); // Get milk data by code

        res.render("dairy/show.ejs", {
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
    const newCustomer = req.body.customer;
    await Customer.insertOne(newCustomer);
    res.redirect("/customers/allcustomers");
});


// Edit form
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    res.render("dairy/edit.ejs", { customer });
});


// Update DB
router.put("/:id", isLoggedIn, async (req, res) => {
    await Customer.findByIdAndUpdate(req.params.id, { ...req.body.customer });
    res.redirect("/customers/allcustomers");
});


// Delete
router.delete("/:id", isLoggedIn, async (req, res) => {
    await Customer.findByIdAndDelete(req.params.id);
    res.redirect("/customers/allcustomers");
});

module.exports = router;
