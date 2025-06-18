const express = require("express");
const router = express.Router();
const Dairy = require("../Models/dairy");
const Milkman = require("../Models/milkman");
const Customer = require("../Models/customer");
const customerr = require("../Models/customerr");
const MilkmanCustomer=require("../Models/milkmancustomer")

// Signup Routes
router.get("/signup", (req, res) => res.render("user/main.ejs"));


// Dairy Signup
router.get("/signup/dairy", (req, res) => res.render("user/dairy.ejs"));
router.post("/signup/dairy", async (req, res) => {
  const dataa = req.body.dairy;
console.log(dataa)
  try {
    // Check if any dairy exists with same code, contact, or email
    const existingDairy = await Dairy.findOne({
      $or: [
        { dairyCode: dataa.dairyCode },
        { contact: dataa.contact },
        { email: dataa.email }
      ]
    });
    console.log(existingDairy)
    if(existingDairy)
    {
    if(existingDairy.dairyCode === dataa.dairyCode) {
      req.flash("error", "Dairy Code already exist");
      return res.redirect("/signup/dairy");
    }
    if (existingDairy.email===dataa.email) {
      req.flash("error", "Email already exist");
      return res.redirect("/signup/dairy");
    }
    if (existingDairy.contact===dataa.contact) {
      req.flash("error", "Contact Number already exist");
      return res.redirect("/signup/dairy");
    }
    }
 
  else{
  // Insert new dairy
    await Dairy.insertOne(req.body.dairy);
    req.flash("success", "Dairy registered successfully. Please login.");
    res.redirect("/login");
  }}
  catch (error) {
    console.error("Signup Dairy Error:", error);
    req.flash("error", "Something went wrong during registration.");
    res.redirect("/signup/dairy");
  }
});


//MIlkman Signup
router.get("/signup/milkman", (req, res) => res.render("user/milkman.ejs"));
router.post("/signup/milkman", async (req, res) => {
  const { milkmanCode, email, contact } = req.body.milkman;

  try {
    // Check if any milkman exists with same code, contact, or email
    const existingMilkman = await Milkman.findOne({
      $or: [
        { milkmanCode: milkmanCode },
        { email: email },
        { contact: contact }
      ]
    });

    if (existingMilkman) {
      if (existingMilkman.milkmanCode === milkmanCode) {
        req.flash("error", "Milkman Code already exists");
        return res.redirect("/signup/milkman");
      }
      if (existingMilkman.email === email) {
        req.flash("error", "Email already exists");
        return res.redirect("/signup/milkman");
      }
      if (existingMilkman.contact === contact) {
        req.flash("error", "Contact Number already exists");
        return res.redirect("/signup/milkman");
      }
    }

    // Insert new milkman
    await Milkman.insertOne(req.body.milkman);
    req.flash("success", "Milkman registered successfully. Please login.");
    console.log(req.body.milkman);
    res.redirect("/login");

  } catch (error) {
    console.error("Signup Milkman Error:", error);
    req.flash("error", "Something went wrong during milkman registration.");
    res.redirect("/signup/milkman");
  }
});



//Customer Signup
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

    // Check if any customer already registered with same code, codeD, or contact
    const existingCustomer = await customerr.findOne({
      $or: [
        { code: data.code },
        { codeD: data.codeD },
        { contact: data.contact }
      ]
    });

    if (existingCustomer) {
      if (existingCustomer.code === data.code) {
        req.flash("error", "Customer Code already exists.");
        return res.redirect("/signup/customer");
      }
      if (existingCustomer.codeD === data.codeD) {
        req.flash("error", "Dairy Code already exists.");
        return res.redirect("/signup/customer");
      }
      if (existingCustomer.contact === data.contact) {
        req.flash("error", "Contact Number already registered.");
        return res.redirect("/signup/customer");
      }
    }

    // Additional server-side validation for password match
    if (data.password !== data.confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/signup/customer");
    }

    // Create new customer
    const newCustomer = new customerr({
      code: data.code,
      codeD: data.codeD,
      contact: data.contact,
      password: data.password,
      confirmPassword: data.confirmPassword
    });

    await newCustomer.save();  // Mongoose validation
    console.log(newCustomer);
    req.flash("success", "Customer registered successfully. Please login.");
    res.redirect("/login");

  } catch (error) {
    console.error("Signup Customer Error:", error);

    if (error.code === 11000) {
      req.flash("error", "Duplicate registration detected.");
    } else {
      req.flash("error", "Something went wrong during customer registration.");
    }

    res.redirect("/signup/customer");
  }
});




// Login Routes
router.get("/login", (req, res) => res.render("user/login.ejs"));

//Customer Login
router.post("/login/customer", async (req, res) => {
    try {
        const { mobile, code, password } = req.body.user;
        const user = await customerr.findOne({ $and: [{ code: code }, { contact: mobile }] });
        if(!user)
        {
           req.flash("error","User not found. Enter Valid code or Mobile number")
            return res.redirect("/login");
        }
        if (user.password !== password) {
            req.flash("error", "Wrong Password");
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


//Dairy Login
router.post("/login/dairy", async (req, res) => {
    try {
        const { mobile, code, password } = req.body.user;
        const user = await Dairy.findOne({ contact: mobile, dairyCode: code });
       if(!user)
        {
           req.flash("error","User not found. Enter Valid code or Mobile number")
            return res.redirect("/login");
        }
        if (user.password !== password) {
            req.flash("error", "Wrong Password");
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


//Milkman Login
router.post("/login/milkman", async (req, res) => {
    try {
        const { mobile, code, password } = req.body.user;
        const user = await Milkman.findOne({ contact: mobile, milkmanCode: code });
        if(!user)
        {
            req.flash("error","User not found. Enter Valid code or Mobile number")
            return res.redirect("/login");
        }
        if (user.password !== password) {
            req.flash("error", "Wrong Password");
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
