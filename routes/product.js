const mongoose = require('mongoose');
const Product = require('../Models/product'); 
const express = require('express');
const { isLoggedIn } = require("../middleware/auth");
const { users } = require('moongose/models');
const router = express.Router();



// Show Main Product page {dairy and Milkman}
router.get("/", isLoggedIn, async (req, res) => {
    const user = req.session.user;
    const code = user.dairyCode || user.milkmanCode;
    const products = await Product.find({code:code});
    res.render("product/product", { products, code,user });
  });

// SHOW MAIN PAGE TO CUSTOMER
router.get("/all", async (req, res) => {
  const user = req.session.user;
  const products = await Product.find({});
  const cart = req.session.cart || [];
  res.render("product/product", { products, user, cart });
});

//Add neew Product 
router.get('/add', (req, res) => {
  const user = req.session.user;
  const code=user.dairyCode || user.milkmanCode
    res.render("product/addproduct.ejs",{code})
  });

router.post('/add',async (req, res) => {
    const product = req.body.product;
    console.log(product)
    try {
      const data = await Product.create(product); // Mongoose method
      res.redirect('/product');
    } catch (err) {
      res.status(400).send('Error saving product: ' + err.message);
    }
  });


//EDIT ROUTE
router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('product/edit', { product});
  });
  
router.put('/edit/:id', isLoggedIn, async (req, res) => {
    await Product.findByIdAndUpdate(req.params.id, req.body.product);
    res.redirect('/product');
  });


// DELETE ROUTE
router.delete('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/product');
  } catch (err) {
    res.status(500).send('Failed to delete product: ' + err.message);
  }
});

module.exports = router;

  
