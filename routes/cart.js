const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../Models/product');
const Order = require("../Models/order");
const methodOverride=require("method-override")

router.get('/', async (req, res) => {
  const user = req.session.user;
  const cart = req.session.cart || [];
  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  try {
    const products = await Product.find();
    res.render('product/cart.ejs', { products, user, cart,totalAmount });
  } catch (err) {
    res.status(500).send('Error retrieving cart');
  }
});


// Adding product to cart
router.post('/add', async (req, res) => {
  const { productId } = req.body;
  let cart = req.session.cart || [];

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const index = cart.findIndex(item => item.productId.toString() === productId);
    if (index !== -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        quantity: 1,
        price: product.price
      });
    }

    req.session.cart = cart;
    res.json({ message: 'Item added', cartCount: cart.length });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product quantity 
router.post('/update/:productId', (req, res) => {
  const { productId } = req.params;
  const { action } = req.body;
  let cart = req.session.cart || [];

  const index = cart.findIndex(item => item.productId.toString() === productId);
  if (index !== -1) {
    if (action === 'increase') {
      cart[index].quantity += 1;
    } else if (action === 'decrease') {
      cart[index].quantity -= 1;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1); 
      }
    }
    req.session.cart = cart; 
  }

  res.redirect('/cart'); 
});


// Remove item from the cart
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  let cart = req.session.cart || [];
  cart = cart.filter(item => item.productId.toString() !== id);
  req.session.cart = cart; 
  res.redirect('/cart'); 
});



router.get('/checkout', (req, res) => {
  let cart = req.session.cart || [];
  const user=req.session.user;
  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  res.render('product/checkout', { cart, totalAmount,user });
});


// Simulate payment and clear the cart
// router.post('/pay', (req, res) => {
//   let cart = req.session.cart || [];
//   const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

//   // Clear cart after "payment"
//   req.session.cart = [];

//   res.render('product/pay', { totalAmount });
// });





router.post("/pay", async (req, res) => {
  try {
    const { fullname, address, contact,payment, cardNumber, cardExpiry, cardCVC, upiId } = req.body;
    const cart = req.session.cart || [];
    const user = req.session.user;

    if (!user || user.type !== "customer") {
      req.flash("error", "You must be logged in as a customer to place an order.");
      return res.redirect("/login");
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      fullname,
      address,
      contact,
      paymentMethod: payment,
      cardDetails: {
        cardNumber: payment === "card" ? cardNumber : null,
        cardExpiry: payment === "card" ? cardExpiry : null,
        cardCVC: payment === "card" ? cardCVC : null
      },
      upiId: payment === "upi" ? upiId : null,
      items: cart.map(item => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount
    });

    await order.save();

    req.session.cart = []; // clear the cart after order placed
    req.flash("success", "Order placed successfully!");
    res.redirect("/customerrs"); // or redirect to /orders or /thank-you
  } catch (error) {
    console.error("Order creation error:", error);
    req.flash("error", "Something went wrong while placing your order.");
    res.redirect("/cart/checkout");
  }
});


module.exports=router