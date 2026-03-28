const mongoose = require('mongoose');


const conversationSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Use UUID string as _id
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
