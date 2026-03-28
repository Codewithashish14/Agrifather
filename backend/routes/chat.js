const express = require('express');
const { groqChat } = require('../utils/groq');
const { v4: uuidv4 } = require('uuid');
const { createConversation, findConversation, getUserConversations, updateConversationTime,
        deleteConversation, createMessage, getConversationMessages, getAllConversationMessages, updateUser } = require('../database/db');
const { authenticate, checkPlan } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  ['image/jpeg','image/png','image/webp','image/gif'].includes(file.mimetype) ? cb(null,true) : cb(new Error('Images only'));
}});

const getSystemPrompt = (user) => {
  const langMap = { en:'English', hi:'Hindi (हिंदी)', 'hi-en':'Hinglish', mr:'Marathi (मराठी)', gu:'Gujarati (ગુજરાતી)', pa:'Punjabi (ਪੰਜਾਬੀ)', te:'Telugu (తెలుగు)', ta:'Tamil (தமிழ்)', kn:'Kannada (ಕನ್ನಡ)', bn:'Bengali (বাংলা)' };
  const langName = langMap[user.language || 'en'] || 'English';
  return `You are AGRIFATHER (अग्रीफादर), the world's most advanced AI assistant exclusively for Indian agriculture. You are the digital father figure for every Indian farmer — wise, compassionate, practical, and deeply knowledgeable.

FARMER PROFILE:
- Name: ${user.name}
- Location: ${user.district || 'Unknown'}, ${user.state || 'India'}
- Farm Size: ${user.farm_size || 'Not specified'}
- Primary Crops: ${user.primary_crops || 'Various'}
- Language: ${langName}

LANGUAGE RULE: ALWAYS respond in ${langName}. Match whatever language the farmer writes in.

EXPERTISE: Crop advisory (200+ crops), soil health, pest & disease identification, weather-based farming, livestock care, government schemes (PM-Kisan, PMFBY, KCC, eNAM), market prices & mandi guidance, irrigation planning, organic farming, farm technology.

STYLE: ${user.response_style === 'short' ? 'SHORT & CONCISE — bullet points, max 150 words' : 'DETAILED & COMPREHENSIVE — step by step, structured with headers'}.

Always be empathetic. Include safety warnings for chemicals. For serious issues recommend local KVK.
Emergency: Kisan Call Center 1800-180-1551 | PM-KISAN 155261

You are their trusted agricultural father. Guide them to prosperity. 🌾`;
};

router.post('/message', authenticate, checkPlan, upload.single('image'), async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message && !req.file) return res.status(400).json({ error: 'Message or image required.' });

    let convId = conversationId;
    if (!convId) {
      convId = uuidv4();
      await createConversation(convId, req.user.id, (message || 'Image Query').substring(0, 60));
    } else {
      const conv = await findConversation(convId, req.user.id);
      if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
    }

    const userMsgId = uuidv4();
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    await createMessage({ _id: userMsgId, conversation_id: convId, user_id: req.user.id, role: 'user', content: message || 'Please analyze this image', image_url: imageUrl });

    const history = await getConversationMessages(convId, 20);
    // Groq API does not support images, so only send text messages
    const groqMessages = history.map((msg) => ({ role: msg.role, content: msg.content }));

    const assistantContent = await groqChat({
      messages: groqMessages,
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama3-70b-8k-english',
      maxTokens: req.user.response_style === 'short' ? 512 : 2048,
      systemPrompt: getSystemPrompt(req.user)
    });
    const assistantMsgId = uuidv4();
    await createMessage({ _id: assistantMsgId, conversation_id: convId, user_id: req.user.id, role: 'assistant', content: assistantContent });

    const today = new Date().toISOString().split('T')[0];
    await updateUser(req.user.id, { messages_today: (req.user.messages_today || 0) + 1, last_message_date: today });
    await updateConversationTime(convId);

    res.json({ message: assistantContent, conversationId: convId, messageId: assistantMsgId, userMessageId: userMsgId });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
  }
});

router.get('/conversations', authenticate, async (req, res) => {
  try { res.json({ conversations: await getUserConversations(req.user.id) }); }
  catch { res.status(500).json({ error: 'Failed to get conversations.' }); }
});

router.get('/conversations/:convId/messages', authenticate, async (req, res) => {
  try {
    const conv = await findConversation(req.params.convId, req.user.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
    const messages = await getAllConversationMessages(req.params.convId);
    res.json({ conversation: conv, messages });
  } catch { res.status(500).json({ error: 'Failed to get messages.' }); }
});

router.delete('/conversations/:convId', authenticate, async (req, res) => {
  try { await deleteConversation(req.params.convId, req.user.id); res.json({ message: 'Deleted.' }); }
  catch { res.status(500).json({ error: 'Failed to delete.' }); }
});

router.get('/suggestions', authenticate, (req, res) => {
  const m = new Date().getMonth() + 1;
  let suggestions;
  if (m >= 6 && m <= 9) suggestions = ['खरीफ फसल की बुवाई का सही समय क्या है?','What fertilizer for paddy this kharif season?','How to protect crops from monsoon flooding?','मेरी धान में कीट लगे हैं, क्या करूं?','Best cotton variety for kharif'];
  else if (m >= 10 && m <= 3) suggestions = ['रबी फसल के लिए खेत की तैयारी कैसे करें?','Best time to sow wheat in my region?','How much irrigation for mustard in winter?','सरसों में माहू का प्रकोप - उपाय बताएं','PM-Kisan scheme ke liye kaise apply karein?'];
  else suggestions = ['गर्मी में कौन सी सब्जियां उगाई जा सकती हैं?','Summer vegetable farming tips','मेरे बगीचे के पेड़ों में रोग लग गया','How to apply for Kisan Credit Card?','Water-saving irrigation for summer'];
  res.json({ suggestions });
});

module.exports = router;
