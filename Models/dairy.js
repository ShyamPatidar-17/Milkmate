const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create the DairyOwner schema
const dairyOwnerSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  dairyName: {
    type: String,
    required: true,
  },
  dairyCode:{
    type:Number,
    unique:true,
    required:true,
  },
  dairyAddress: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    unique:true,
    match: [/^([a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4})$/, 'Please enter a valid email address']
  },
  contact:{
    type:Number,
    required:true,
    unique:true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 20
  },
  confirmPassword: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 20
  }
},);

// Validate that the password and confirmPassword fields match
dairyOwnerSchema.pre('save', function(next) {
  if (this.password !== this.confirmPassword) {
    next(new Error('Passwords do not match'));
  } else {
    next();
  }
});

// Create and export the DairyOwner model
const Dairy = mongoose.model('Dairy', dairyOwnerSchema);

module.exports = Dairy;
