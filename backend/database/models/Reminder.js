const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  reminder_date: Date,
  reminder_type: { type: String, default: 'general' },
  is_completed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminder', reminderSchema);
