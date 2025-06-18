const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerrSchema= new Schema({
    code:{
        type:Number,
        required: true,
    },
    codeD:{
      type:Number,
      required:true,
    },
    contact:{
        type:Number,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        minlength: 5,
        maxlength: 20
    },
    confirmPassword:{
        type:String,
        minlength:5,
        maxlength:20
    }
})

customerrSchema.index({ code: 1, codeD: 1 }, { unique: true });

customerrSchema.pre('save', function(next) {
  if (this.password !== this.confirmPassword) {
    next(new Error('Passwords do not match'));
  } else {
    next();
  }
});

// Create and export the DairyOwner model
const Customerr = mongoose.model('Customerr', customerrSchema);

module.exports = Customerr;
