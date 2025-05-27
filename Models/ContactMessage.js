const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    index: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    minlength: 10,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
});

module.exports = mongoose.model('Contact', contactSchema);
