const mongoose = require("mongoose");

const milkmancustomerSchema = new mongoose.Schema({
  first: { type: String, required: true },
  last: { type: String, required: true },
  contact: { type: Number, required: true },
  address: { type: String, required: true },
  code: { type: Number, required: true },  // removed `unique: true`
  milkmanCode: { type: Number, required: true },
});

milkmancustomerSchema.index({ code: 1, milkmanCode: 1 }, { unique: true });

const MilkmanCustomer = mongoose.model("MilkmanCustomer", milkmancustomerSchema);

module.exports = MilkmanCustomer;
