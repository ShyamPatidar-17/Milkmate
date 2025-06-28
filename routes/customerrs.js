const express = require("express");
const router = express.Router();
const Customer = require("../Models/customer");
const addMilk = require("../Models/addmilk");
const customerrs=require("../Models/customerr");
const { isLoggedIn } = require("../middleware/auth"); // <-- Import the middleware





// Main dairy page
router.get("/", isLoggedIn, (req, res) => {
    const user = req.session.user;
    res.render("customer/front.ejs", { user });
});

// router.get("/details",async(req,res)=>{
//     const user=req.session.user;
//     console.log(user)
//     const customer = await Customer.findOne({$and:[{codeD:user.dairyCode},{code:user.code}]}) 
//     console.log(customer)
//     res.render("customer/show.ejs",{customer})
// })

// Show individual customer
router.get("/details", isLoggedIn, async (req, res) => {

    const user=req.session.user;
    console.log(user)
    const customer = await Customer.findOne({$and:[{codeD:user.dairyCode},{code:user.code}]}) 
    console.log(customer)
    
        const milks = await addMilk.find({$and:[{dairyCode:user.dairyCode},{code:user.code}]}) // Get milk data by code

        res.render("customer/show.ejs", {customer,milks,total: 0});
});



// Edit form
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    res.render("customer/edit.ejs", { customer });
});


// Update DB
router.put("/:id", isLoggedIn, async (req, res) => {
    await Customer.findByIdAndUpdate(req.params.id, { ...req.body.customer });
    res.redirect("/customerrs");
});


// // Delete
// router.delete("/:id", isLoggedIn, async (req, res) => {
//     await Customer.findByIdAndDelete(req.params.id);
//     res.redirect("/customers/allcustomers");
// });



router.get("/product", (req, res) => res.render("customer/product.ejs"));

module.exports = router;
