const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  replied: {
    type: Boolean,
    default: false
  },
  replyText: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema, "contactmessages");

module.exports = ContactMessage;