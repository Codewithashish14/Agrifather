const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  plan: String,
  amount: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
