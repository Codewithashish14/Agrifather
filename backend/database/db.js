
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Payment = require('./models/Payment');
const Reminder = require('./models/Reminder');

// USER
async function findUserByEmail(email) {
  return User.findOne({ email });
}
async function findUserById(id) {
  return User.findById(id);
}
async function createUser(data) {
  const user = new User(data);
  return user.save();
}
async function updateUser(id, updates) {
  return User.findByIdAndUpdate(id, { ...updates, updated_at: new Date() }, { new: true });
}

// CONVERSATION
async function createConversation(id, userId, title) {
  return Conversation.create({ _id: id, user_id: userId, title });
}
async function findConversation(id, userId) {
  return Conversation.findOne({ _id: id, user_id: userId });
}
async function getUserConversations(userId) {
  return Conversation.find({ user_id: userId }).sort({ updated_at: -1 }).limit(50);
}
async function updateConversationTime(id) {
  return Conversation.findByIdAndUpdate(id, { updated_at: new Date() }); // id is now a string (UUID)
}
async function deleteConversation(id, userId) {
  await Message.deleteMany({ conversation_id: id });
  return Conversation.deleteOne({ _id: id, user_id: userId }); // id is now a string (UUID)
}

// MESSAGE
async function createMessage(data) {
  const msg = new Message(data);
  return msg.save();
}
async function getConversationMessages(conversationId, limit = 20) {
  return Message.find({ conversation_id: conversationId }).sort({ created_at: 1 }).limit(limit);
}
async function getAllConversationMessages(conversationId) {
  return Message.find({ conversation_id: conversationId }).sort({ created_at: 1 });
}

// PAYMENT
async function createPayment(data) {
  const payment = new Payment(data);
  return payment.save();
}
async function updatePayment(orderId, updates) {
  return Payment.findOneAndUpdate({ razorpay_order_id: orderId }, updates, { new: true });
}
async function getUserPayments(userId) {
  return Payment.find({ user_id: userId }).sort({ created_at: -1 });
}

// REMINDER
async function createReminder(data) {
  const r = new Reminder(data);
  return r.save();
}
async function getUserReminders(userId) {
  return Reminder.find({ user_id: userId }).sort({ created_at: 1 });
}
async function completeReminder(id, userId) {
  return Reminder.findOneAndUpdate({ _id: id, user_id: userId }, { is_completed: true });
}
async function deleteReminder(id, userId) {
  return Reminder.deleteOne({ _id: id, user_id: userId });
}

module.exports = {
  findUserByEmail, findUserById, createUser, updateUser,
  createConversation, findConversation, getUserConversations, updateConversationTime, deleteConversation,
  createMessage, getConversationMessages, getAllConversationMessages,
  createPayment, updatePayment, getUserPayments,
  createReminder, getUserReminders, completeReminder, deleteReminder
};
