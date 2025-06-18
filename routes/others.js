const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.render("user/front.ejs"));
router.get("/customerss", (req, res) => res.render("ours/ours.ejs"));
router.get("/about", (req, res) => res.render("others/about.ejs"));
router.get("/contact",(req,res)=> res.render("others/contact.ejs"));

module.exports = router;
