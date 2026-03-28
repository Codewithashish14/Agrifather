const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_id: { type: String, ref: 'Conversation' },
  user_id: { type: String, ref: 'User' },
  role: String,
  content: String,
  image_url: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
