const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { createPayment, updatePayment, getUserPayments, updateUser } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/plans', (req, res) => {
  res.json({
    plans: [
      {
        id: 'free', name: 'Free', price: 0, currency: 'INR', period: null,
        features: ['10 messages per day','Basic crop advisory','Hindi & English support','Weather updates','Market prices'],
        limitations: ['No voice mode','No image upload','Limited history']
      },
      {
        id: 'monthly', name: 'Pro Monthly', price: 399, currency: 'INR', period: 'month', badge: 'Most Popular',
        features: ['Unlimited messages','Voice input & output','Image-based disease detection','All 10 regional languages','Smart farming reminders','Complete chat history','Priority AI responses','Emergency alerts','Geolocation-based advice','Government scheme guidance']
      },
      {
        id: 'yearly', name: 'Pro Yearly', price: 4199, currency: 'INR', period: 'year', badge: 'Best Value', savings: '₹1,589 saved',
        features: ['Everything in Pro Monthly','Save ₹1589 vs monthly','Seasonal crop planner','Export farming diary','Advanced market analytics','Early access to new features','Dedicated support']
      }
    ]
  });
});

router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['monthly', 'yearly'].includes(plan)) return res.status(400).json({ error: 'Invalid plan.' });
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ error: 'Payment gateway not configured. Add RAZORPAY keys to .env' });
    }
    const amount = plan === 'monthly' ? 39900 : 419900;
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // Razorpay requires receipt to be <= 40 chars
    let receipt = `agrifather_${req.user.id}_${Date.now()}`;
    if (receipt.length > 40) receipt = receipt.slice(0, 40);
    const order = await razorpay.orders.create({ amount, currency: 'INR', receipt, notes: { userId: req.user.id, plan } });
    await createPayment({ id: uuidv4(), user_id: req.user.id, razorpay_order_id: order.id, plan, amount });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID, userName: req.user.name, userEmail: req.user.email, userPhone: req.user.phone || '' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create order.' }); }
});

router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = req.body;
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expected !== razorpaySignature) return res.status(400).json({ error: 'Invalid payment signature.' });
    const expiry = new Date();
    if (plan === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
    else expiry.setFullYear(expiry.getFullYear() + 1);
    await updateUser(req.user.id, { plan: 'pro', plan_expires_at: expiry.toISOString() });
    await updatePayment(razorpayOrderId, { razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature, status: 'completed' });
    res.json({ message: '🎉 Payment successful! Welcome to AGRIFATHER Pro!', plan: 'pro', expiresAt: expiry.toISOString() });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Payment verification failed.' }); }
});

router.get('/history', authenticate, async (req, res) => {
  try {
    const payments = await getUserPayments(req.user.id);
    res.json({ payments });
  } catch (err) { res.status(500).json({ error: 'Failed to get payment history.' }); }
});

module.exports = router;
