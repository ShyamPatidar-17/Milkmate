const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  first: { type: String, required: true },
  last: { type: String, required: true },
  contact: { type: Number, required: true },
  address: { type: String, required: true },
  code: { type: Number, required: true }, 
  codeD: { type: Number, required: true },
});

customerSchema.index({ code: 1, codeD: 1 }, { unique: true });

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
