const jwt = require('jsonwebtoken');
const { findUserById, updateUser } = require('../database/db');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const checkPlan = async (req, res, next) => {
  const user = req.user;
  const today = new Date().toISOString().split('T')[0];

  let updates = {};
  if (user.last_message_date !== today) {
    updates.messages_today = 0;
    updates.last_message_date = today;
    user.messages_today = 0;
  }

  if (user.plan === 'pro' && user.plan_expires_at && new Date(user.plan_expires_at) < new Date()) {
    updates.plan = 'free';
    user.plan = 'free';
  }

  if (Object.keys(updates).length) await updateUser(user.id, updates);

  const limit = user.plan === 'pro' ? 9999 : parseInt(process.env.FREE_MESSAGES_PER_DAY || 10);
  if (user.messages_today >= limit) {
    return res.status(429).json({ error: 'Daily message limit reached.', plan: user.plan, limit, upgradeRequired: user.plan === 'free' });
  }
  next();
};

module.exports = { authenticate, checkPlan };
