const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customerr", // replace with your actual customer model name
  },
  fullname: String,
  address: String,
  contact:{type:Number, 
    required:true},
  paymentMethod: String,
  cardDetails: {
    cardNumber: String,
    cardExpiry: String,
    cardCVC: String
  },
  upiId: String,
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product" // replace with your actual product model
      },
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);
