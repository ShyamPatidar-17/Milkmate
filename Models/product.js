const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  code:{
    type:Number,
    required:true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        // Allow links or file paths ending in jpg, jpeg, png
        return /\.(jpg|jpeg|png)$/i.test(v) || /^https?:\/\/.+/i.test(v);
      },
      message: props => `${props.value} is not a valid image URL or file name`
    }
  },
  desc: {
    type: String,
    required: true,
    trim: true
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
