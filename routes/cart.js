import express from "express";
const router = express.Router();
import Product from "../Models/product.js";
import Order from "../Models/order.js";

// View Cart
router.get('/', async (req, res) => {
  const user = req.session.user;
  const cart = req.session.cart || [];
  try {
    const products = await Product.find();
    // Enrich cart items with product images if missing
    let cartModified = false;
    for (const item of cart) {
      if (!item.image) {
        const prod = products.find(p => p._id.toString() === item.productId.toString());
        if (prod && (prod.image || prod.img)) {
          item.image = prod.image || prod.img;
          cartModified = true;
        }
      }
    }
    if (cartModified) {
      req.session.cart = cart;
    }

    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    res.render('product/cart.ejs', { products, user, cart, totalAmount });
  } catch (err) {
    console.error('Error retrieving cart:', err);
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
      if (!cart[index].image && product.image) {
        cart[index].image = product.image;
      }
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        quantity: 1,
        price: product.price,
        image: product.image || product.img || ''
      });
    }

    req.session.cart = cart;
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ message: 'Item added', cartCount: totalCount });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product quantity (AJAX-friendly, no page refresh required)
router.post('/update/:productId', (req, res) => {
  const { productId } = req.params;
  const { action } = req.body;
  let cart = req.session.cart || [];

  const index = cart.findIndex(item => item.productId.toString() === productId);
  let updatedItem = null;
  let itemRemoved = false;

  if (index !== -1) {
    if (action === 'increase') {
      cart[index].quantity += 1;
      updatedItem = cart[index];
    } else if (action === 'decrease') {
      cart[index].quantity -= 1;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
        itemRemoved = true;
      } else {
        updatedItem = cart[index];
      }
    }
    req.session.cart = cart;
  }

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isAjax = req.xhr || 
                 req.headers.accept?.includes('application/json') || 
                 req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                 req.is('json');

  if (isAjax) {
    return res.json({
      success: true,
      productId,
      action,
      quantity: updatedItem ? updatedItem.quantity : 0,
      itemSubtotal: updatedItem ? (updatedItem.price * updatedItem.quantity).toFixed(2) : '0.00',
      totalAmount: totalAmount.toFixed(2),
      cartCount: totalCount,
      cartItemsCount: cart.length,
      itemRemoved
    });
  }

  res.redirect('/cart');
});

// Remove item from the cart (supports DELETE and POST, AJAX-friendly)
const handleCartDelete = (req, res) => {
  const { id } = req.params;
  let cart = req.session.cart || [];
  cart = cart.filter(item => item.productId.toString() !== id);
  req.session.cart = cart;

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isAjax = req.xhr || 
                 req.headers.accept?.includes('application/json') || 
                 req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                 req.is('json');

  if (isAjax) {
    return res.json({
      success: true,
      productId: id,
      totalAmount: totalAmount.toFixed(2),
      cartCount: totalCount,
      cartItemsCount: cart.length,
      itemRemoved: true
    });
  }

  res.redirect('/cart');
};

router.delete('/delete/:id', handleCartDelete);
router.post('/delete/:id', handleCartDelete);

// Checkout
router.get('/checkout', (req, res) => {
  let cart = req.session.cart || [];
  const user = req.session.user;
  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  res.render('product/checkout', { cart, totalAmount, user });
});

// Payment & Order Placement
router.post("/pay", async (req, res) => {
  try {
    const { fullname, address, contact, payment, cardNumber, cardExpiry, cardCVC, upiId } = req.body;
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
        productId: item.productId || item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount
    });

    await order.save();

    req.session.cart = []; // clear the cart after order placed
    req.flash("success", "Order placed successfully!");
    res.redirect("/product/pay");
  } catch (error) {
    console.error("Order creation error:", error);
    req.flash("error", "Something went wrong while placing your order.");
    res.redirect("/cart/checkout");
  }
});

export default router;
