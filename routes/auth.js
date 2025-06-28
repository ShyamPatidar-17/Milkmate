const express = require("express");
const router = express.Router();
const Dairy = require("../Models/dairy");
const Milkman = require("../Models/milkman");
const Customer = require("../Models/customer");
const customerr = require("../Models/customerr");
const MilkmanCustomer=require("../Models/milkmancustomer")

// Signup Routes
router.get("/signup", (req, res) => res.render("user/main.ejs"));

router.get("/signup/dairy", (req, res) => res.render("user/dairy.ejs"));
router.post("/signup/dairy", async (req, res) => {
    try {
        await Dairy.insertOne(req.body.dairy);
        req.flash("success", "Dairy registered successfully. Please login.");
        res.redirect("/login");
    } catch (error) {
        console.error("Signup Dairy Error:", error);
        req.flash("error", "Something went wrong during dairy registration.");
        res.redirect("/signup/dairy");
    }
});

router.get("/signup/milkman", (req, res) => res.render("user/milkman.ejs"));
router.post("/signup/milkman", async (req, res) => {
    try {
        await Milkman.insertOne(req.body.milkman);
        req.flash("success", "Milkman registered successfully. Please login.");
        res.redirect("/login");
    } catch (error) {
        console.error("Signup Milkman Error:", error);
        req.flash("error", "Something went wrong during milkman registration.");
        res.redirect("/signup/milkman");
    }
});

router.get("/signup/customer", (req, res) => res.render("user/customer.ejs"));

router.post("/signup/customer", async (req, res) => {
    try {
        const data = req.body.customerr;

        // Validate the customer exists in the main Customer collection
        const customerExists = await Customer.findOne({
            code: data.code,
            codeD: data.codeD,
            contact: data.contact
        });

        if (!customerExists) {
            req.flash("error", "You are not registered in the Dairy. Please contact your dairy.");
            return res.redirect("/signup/customer");
        }

        // Check for duplicate mobile number
        const alreadyRegistered = await customerr.findOne({ contact: data.contact });
        if (alreadyRegistered) {
            req.flash("error", "This mobile number is already registered.");
            return res.redirect("/signup/customer");
        }

        // Create new customer (only insert schema-valid fields)
        const newCustomer = new customerr({
            code: data.code,
            codeD: data.codeD,
            contact: data.contact,
            password: data.password,
            confirmPassword: data.confirmPassword
        });

        await newCustomer.save();  // Mongoose handles validation here

        req.flash("success", "Customer registered successfully. Please login.");
        res.redirect("/login");

    } catch (error) {
        console.error("Signup Customer Error:", error);

        if (error.code === 11000) {
            req.flash("error", "Duplicate registration detected.");
        } else if (error.message.includes("Passwords do not match")) {
            req.flash("error", "Passwords do not match.");
        } else {
            req.flash("error", "Something went wrong during customer registration.");
        }

        res.redirect("/signup/customer");
    }
});




// Login Routes
router.get("/login", (req, res) => res.render("user/login.ejs"));
router.post("/login/customer", async (req, res) => {
    try {
        const { mobile, code, password } = req.body.user;
        const user = await customerr.findOne({ $and: [{ code: code }, { contact: mobile }] });
        if (!user || user.password !== password) {
            req.flash("error", "Invalid credentials");
            return res.redirect("/login");
        }

        const userR = await Customer.findOne({ $and: [{ code: user.code }, { codeD: user.codeD }] });
        req.session.user = {
            code: userR.code,
            name: userR.first,
            mobile: userR.contact,
            dairyCode: userR.codeD,
            address: userR.address,
            type: "customer"
        };
        req.flash("success", `Welcome ${userR.first}`);
        res.redirect("/customerrs");

    } catch (error) {
        console.error("Login Customer Error:", error);
        req.flash("error", "User does not exist.");
        res.redirect("/login");
    }
});

router.post("/login/dairy", async (req, res) => {
    try {
        const { mobile, code, password } = req.body.user;
        const user = await Dairy.findOne({ contact: mobile, dairyCode: code });
        if (!user || user.password !== password) {
            req.flash("error", "Invalid credentials");
            return res.redirect("/login");
        }
        req.session.user = {
            dairyCode: user.dairyCode,
            dname: user.dairyName,
            mobile: user.contact,
            type: "dairy"
        };
        req.flash("success", `Welcome ${user.dairyName}`);
        res.redirect("/dairy");
    } catch (error) {
        console.error("Login Dairy Error:", error);
        req.flash("error", "Something went wrong during login.");
        res.redirect("/login");
    }
});

router.post("/login/milkman", async (req, res) => {
    try {
        const { mobile, code, password } = req.body.user;
        const user = await Milkman.findOne({ contact: mobile, milkmanCode: code });
        if (!user || user.password !== password) {
            req.flash("error", "Invalid credentials");
            return res.redirect("/login");
        }
        req.session.user = {
            milkmanCode: user.milkmanCode,
            name: user.name,
            mobile: user.contact,
            type: "milkman"
        };
        req.flash("success", `Welcome ${user.name}`);
        res.redirect("/milkman");
    } catch (error) {
        console.error("Login Milkman Error:", error);
        req.flash("error", "Something went wrong during login.");
        res.redirect("/login");
    }
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {

        res.redirect("/");
    });
});



module.exports = router;
