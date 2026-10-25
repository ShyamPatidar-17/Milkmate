import Product from "../Models/product.js"; 
import express from "express";
import { isLoggedIn } from "../middleware/auth.js";
const router = express.Router();

// Show Main Product page {dairy and Milkman}
router.get("/", isLoggedIn, async (req, res) => {
  try {
    const user = req.session.user;
    const code = user?.dairyCode || user?.milkmanCode;
    const products = await Product.find({ code: code });
    res.render("product/product.ejs", { products, code, user });
  } catch (err) {
    console.error("Error loading products:", err);
    res.render("product/product.ejs", { products: [], code: null, user: req.session.user });
  }
});

// SHOW MAIN PAGE TO CUSTOMER / PUBLIC
router.get("/all", async (req, res) => {
  try {
    const user = req.session.user;
    const products = await Product.find({});
    const cart = req.session.cart || [];
    res.render("product/product.ejs", { products, user, cart });
  } catch (err) {
    console.error("Error loading store products:", err);
    res.render("product/product.ejs", { products: [], user: req.session.user, cart: [] });
  }
});

// Add new Product form
router.get("/add", isLoggedIn, (req, res) => {
  const user = req.session.user;
  const code = user?.dairyCode || user?.milkmanCode;
  res.render("product/addproduct.ejs", { code });
});

router.post("/add", isLoggedIn, async (req, res) => {
  const product = req.body.product;
  try {
    await Product.create(product);
    req.flash("success", "Product published to store!");
    res.redirect("/product");
  } catch (err) {
    console.error("Error saving product:", err);
    req.flash("error", "Error saving product: " + err.message);
    res.redirect("/product/add");
  }
});

// EDIT ROUTE
router.get("/edit/:id", isLoggedIn, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/product");
    }
    res.render("product/edit.ejs", { product });
  } catch (err) {
    console.error("Error fetching product for edit:", err);
    res.redirect("/product");
  }
});
  
router.put("/edit/:id", isLoggedIn, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body.product);
    req.flash("success", "Product updated.");
    res.redirect("/product");
  } catch (err) {
    console.error("Error updating product:", err);
    req.flash("error", "Update failed.");
    res.redirect("/product");
  }
});

// DELETE ROUTE
router.delete("/delete/:id", isLoggedIn, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.flash("success", "Product deleted.");
    res.redirect("/product");
  } catch (err) {
    console.error("Delete product error:", err);
    req.flash("error", "Failed to delete product.");
    res.redirect("/product");
  }
});

export default router;
