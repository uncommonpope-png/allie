const path = require('path');
const fs = require('fs');

const RESPONSE_TEMPLATES = {
  positive: [
    { label: 'Thank you', text: 'Thank you so much! Really appreciate the kind words 🙏' },
    { label: 'Share credit', text: 'Glad it resonated! Credit goes to the amazing team behind the scenes.' },
    { label: 'Engage deeper', text: 'So glad you found this valuable! What aspect resonated most with you?' },
    { label: 'Offer help', text: 'Happy this helped! Let me know if you have any questions — happy to dive deeper.' }
  ],
  neutral: [
    { label: 'Acknowledge', text: 'Great point! Appreciate you sharing your perspective on this.' },
    { label: 'Add value', text: 'Building on that — another angle worth considering is...' },
    { label: 'Ask question', text: 'Interesting take! What led you to that conclusion?' }
  ],
  negative: [
    { label: 'De-escalate', text: 'I hear your concern and appreciate the honest feedback. Would love to understand more — feel free to DM me.' },
    { label: 'Acknowledge issue', text: 'You raise a valid point. We\'re actively working on improving this and would love your input.' },
    { label: 'Offer solution', text: 'Sorry to hear that. Here\'s what I\'d recommend...' },
    { label: 'Take offline', text: 'Thanks for flagging this. Let me look into it and get back to you — please DM me the details.' }
  ],
  question: [
    { label: 'Direct answer', text: 'Great question! The short answer is...' },
    { label: 'Resource link', text: 'Great question! I wrote about this here: [link]' },
    { label: 'Reverse question', text: 'What context would be most helpful? Happy to tailor the answer.' }
  ]
};

function getEngagePath(projectDir) {
  return path.join(projectDir || process.cwd(), 'allie-engage.json');
}

function load(projectDir) {
  const fp = getEngagePath(projectDir);
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return { interactions: [], templates: RESPONSE_TEMPLATES }; }
}

function save(projectDir, data) {
  fs.writeFileSync(getEngagePath(projectDir), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function getTemplates(sentiment) {
  if (sentiment) return RESPONSE_TEMPLATES[sentiment] || [];
  return RESPONSE_TEMPLATES;
}

function logInteraction(projectDir, interaction) {
  if (!interaction.type) throw new Error('Interaction type is required');
  const data = load(projectDir);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    type: interaction.type,
    platform: interaction.platform || 'twitter',
    sentiment: interaction.sentiment || 'neutral',
    content: interaction.content || '',
    response: interaction.response || '',
    responseTime: interaction.responseTime || null,
    tags: interaction.tags || [],
    handled: interaction.handled || false,
    createdAt: new Date().toISOString()
  };
  data.interactions.push(entry);
  save(projectDir, data);
  return entry;
}

function listInteractions(projectDir, options) {
  const data = load(projectDir);
  let items = data.interactions;
  if (options) {
    if (options.sentiment) items = items.filter(i => i.sentiment === options.sentiment);
    if (options.platform) items = items.filter(i => i.platform === options.platform);
    if (options.handled !== undefined) items = items.filter(i => i.handled === options.handled);
    if (options.type) items = items.filter(i => i.type === options.type);
  }
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { interactions: items, total: items.length };
}

function markHandled(projectDir, id) {
  const data = load(projectDir);
  const idx = data.interactions.findIndex(i => i.id === id);
  if (idx === -1) throw new Error(`Interaction ${id} not found`);
  data.interactions[idx].handled = true;
  data.interactions[idx].handledAt = new Date().toISOString();
  save(projectDir, data);
  return data.interactions[idx];
}

function score(projectDir) {
  const data = load(projectDir);
  const total = data.interactions.length;
  if (!data.interactions || data.interactions.length === 0) return { score: 0, label: 'No data', total: 0, handled: 0, responseRate: 0, netSentiment: 0, positive: 0, negative: 0 };
  const handled = data.interactions.filter(i => i.handled).length;
  const positive = data.interactions.filter(i => i.sentiment === 'positive').length;
  const negative = data.interactions.filter(i => i.sentiment === 'negative').length;
  const responseRate = total > 0 ? (handled / total * 100).toFixed(0) : 0;
  const netSentiment = total > 0 ? ((positive - negative) / total * 100).toFixed(0) : 0;
  const score = Math.min(100, Math.max(0, Math.round(Number(responseRate) * 0.6 + (Number(netSentiment) + 100) * 0.2)));
  return { score, label: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Critical', total, handled, responseRate: Number(responseRate), netSentiment: Number(netSentiment), positive, negative };
}

module.exports = { getTemplates, logInteraction, listInteractions, markHandled, score, RESPONSE_TEMPLATES };
