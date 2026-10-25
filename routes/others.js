import express from "express";
const router = express.Router();

router.get("/", (req, res) => res.render("user/front.ejs"));
router.get("/customerss", (req, res) => res.render("ours/ours.ejs"));
router.get("/about", (req, res) => res.render("others/about.ejs"));
router.get("/contact", (req, res) => {
  const defaultFormUrl = process.env.GOOGLE_FORM_URL || "https://docs.google.com/forms/d/e/1FAIpQLSdX4uY6X3q0-dummy-milkmate/viewform";
  res.render("others/contact.ejs", { googleFormUrl: defaultFormUrl });
});

export default router;
