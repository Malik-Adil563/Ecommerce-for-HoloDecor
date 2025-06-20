const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  product: {
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },
  stripeTokenId: { type: String, required: true }
}, { timestamps: true });

const PaymentHistory = mongoose.model("PaymentHistory", paymentHistorySchema, "paymenthistory");

module.exports = PaymentHistory;