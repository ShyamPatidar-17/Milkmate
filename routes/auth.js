const express = require("express");
const router = express.Router();
const Dairy = require("../Models/dairy");
const Milkman = require("../Models/milkman");
const Customer=require("../Models/customer");
const customerr = require("../Models/customerr");

// Signup Routes
router.get("/signup", (req, res) => res.render("user/main.ejs"));

router.get("/signup/dairy", (req, res) => res.render("user/dairy.ejs"));
router.post("/signup/dairy", async (req, res) => {
    await Dairy.insertOne(req.body.dairy);
    res.redirect("/login");
});
router.get("/signup/milkman", (req, res) => res.render("user/milkman.ejs"));
router.post("/signup/milkman", async (req, res) => {
    await Milkman.insertOne(req.body.milkman);
    res.redirect("/login");
});
router.get("/signup/customer", (req, res) => res.render("user/customer.ejs"));
router.post("/signup/customer", async (req, res) => {
    await customerr.insertOne(req.body.customerr);
    console.log(req.body.customerr)
    res.redirect("/login");
});


// Login Routes
router.get("/login", (req, res) => res.render("user/login.ejs"));

router.post("/login/customer", async (req, res) => {
    const { mobile, code, password } = req.body.user;
    const user = await customerr.findOne({ $and:[{code: code},{contact:mobile}]});
    console.log(user)
    if (!user || user.password !== password) {
        req.flash("error", "Invalid credentials");
        return res.redirect("/login");
    }
    const userR=await Customer.findOne({$and:[{code:user.code},{codeD:user.codeD}]})
    console.log(userR);
    req.session.user = { code: userR.code, name: userR.first, mobile: userR.contact,dairyCode:userR.codeD,address:userR.address,type:"customer"};
    console.log(req.session.user)
    res.render("others/sweet", {
        icon: "success",
        title: "Login Successful",
        message: `Welcome back ${user.first}`,
        redirectTo: "/customerrs",
    });
});

router.post("/login/dairy", async (req, res) => {
    const { mobile, code, password } = req.body.user;
    const user = await Dairy.findOne({ contact: mobile, dairyCode: code });
    if (!user || user.password !== password) {
        return res.render("others/sweet", {
            icon: "error",
            title: "Login Failed",
            message: "Invalid credentials",
            redirectTo: "/login"
        });
    }
    req.session.user = { dairyCode:user.dairyCode, dname:user.dairyName,mobile:user.contact,type:"dairy"};
    // console.log(req.session.user)
    res.render("others/sweet", {
        icon: "success",
        title: "Login Successful",
        message: `Welcome back ${user.fullName}`,
        redirectTo: "/dairy",
        
    });
});

router.post("/login/milkman", async (req, res) => {
    const { mobile, code, password } = req.body.user;
    const user = await Milkman.findOne({ contact: mobile, milkmanCode: code });
    if (!user || user.password !== password) {
        return res.render("others/sweet", {
            icon: "error",
            title: "Login Failed",
            message: "Invalid credentials",
            redirectTo: "/login"
        });
    }
    req.session.user = { milkmanCode: user.milkmanCode, name: user.name, mobile: user.contact,type:"milkman" };
    console.log(req.session.user)
    res.render("others/sweet", {
        icon: "success",
        title: "Login Successful",
        message: `Welcome back ${user.name}`,
        redirectTo: "/milkman",
        
    });
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
