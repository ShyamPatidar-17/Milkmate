

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const milkSchema = new Schema({
  code: {
    type: Number,  
    required: true,  
  },
  milkmanCode: {
    type: Number,  
    required: true,  
  },
  date: {
    type: Date,  
    default:Date.now(),
  },
  shift: {
    type: String, 
    required: true,  
  },
  liter: {
    type: Number, 
    required: true, 
    default: 0.0  
  },
  rate: {
    type: Number, 
    required: true,  
    default: 0.0  
  },
  amount:{
    type:Number,
    required:true,
    default:0.0,
  },
}, 
);  


const sellMilk = mongoose.model('sellMilk', milkSchema);

module.exports = sellMilk;
