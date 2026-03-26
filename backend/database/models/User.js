const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password_hash: String,
  language: { type: String, default: 'en' },
  state: String,
  district: String,
  farm_size: String,
  primary_crops: String,
  plan: { type: String, default: 'free' },
  plan_expires_at: Date,
  messages_today: { type: Number, default: 0 },
  last_message_date: Date,
  voice_enabled: { type: Boolean, default: true },
  response_style: { type: String, default: 'detailed' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
