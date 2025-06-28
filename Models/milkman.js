const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const milkmanSchema= new Schema({
    name:{
        type:String,
        required: true,
    },
    milkmanCode:{
      type:Number,
      required:true,
      unique:true,
    },
    contact:{
        type:Number,
        required:true,
        unique:true,
    },
    email:{
      type:String,
      unique:true,
    },
    address:{
        type:String,
        required:true,
        maxlength: 200
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

milkmanSchema.pre('save', function(next) {
  if (this.password !== this.confirmPassword) {
    next(new Error('Passwords do not match'));
  } else {
    next();
  }
});

// Create and export the DairyOwner model
const Milkman = mongoose.model('Milkman', milkmanSchema);

module.exports = Milkman;
