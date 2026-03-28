// Utility for calling Groq API
const fetch = require('node-fetch');

async function groqChat({ messages, apiKey, model = 'llama3-70b-8192', maxTokens = 2048, systemPrompt }) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  const groqMessages = [];
  if (systemPrompt) {
    groqMessages.push({ role: 'system', content: systemPrompt });
  }
  for (const msg of messages) {
    groqMessages.push({ role: msg.role, content: msg.content });
  }
  const body = JSON.stringify({
    model,
    messages: groqMessages,
    max_tokens: maxTokens
  });
  const res = await fetch(url, { method: 'POST', headers, body });
  if (!res.ok) throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

module.exports = { groqChat };