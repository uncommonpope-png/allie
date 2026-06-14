const path = require('path');
const fs = require('fs');

const POSITIVE_WORDS = ['great','amazing','love','awesome','best','excellent','fantastic','wonderful','helpful','brilliant','thank','thanks','appreciate','incredible','outstanding','perfect','superb','impressive'];
const NEGATIVE_WORDS = ['terrible','awful','worst','hate','bad','horrible','poor','disappointing','useless','broken','scam','fraud','overpriced','waste','annoying','frustrating','awful','dreadful'];

function getMonitorPath(projectDir) {
  return path.join(projectDir || process.cwd(), 'allie-monitor.json');
}

function load(projectDir) {
  const fp = getMonitorPath(projectDir);
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return { mentions: [], keywords: [] }; }
}

function save(projectDir, data) {
  fs.writeFileSync(getMonitorPath(projectDir), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function addKeyword(projectDir, keyword, platform) {
  const data = load(projectDir);
  const entry = { id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6), keyword, platform: platform || 'all', createdAt: new Date().toISOString() };
  data.keywords.push(entry);
  save(projectDir, data);
  return entry;
}

function listKeywords(projectDir) {
  const data = load(projectDir);
  return data.keywords;
}

function removeKeyword(projectDir, id) {
  const data = load(projectDir);
  const idx = data.keywords.findIndex(k => k.id === id);
  if (idx === -1) throw new Error(`Keyword ${id} not found`);
  const removed = data.keywords.splice(idx, 1)[0];
  save(projectDir, data);
  return removed;
}

function addMention(projectDir, mention) {
  if (!mention.content) throw new Error('Mention content is required');
  const data = load(projectDir);
  const content = mention.content.toLowerCase();
  const posScore = POSITIVE_WORDS.reduce((s, w) => s + (content.includes(w) ? 1 : 0), 0);
  const negScore = NEGATIVE_WORDS.reduce((s, w) => s + (content.includes(w) ? 1 : 0), 0);
  const sentiment = posScore > negScore ? 'positive' : negScore > posScore ? 'negative' : 'neutral';
  const score = posScore - negScore;
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    source: mention.source || 'manual',
    platform: mention.platform || 'twitter',
    author: mention.author || 'anonymous',
    content: mention.content,
    sentiment,
    score,
    keywords: data.keywords.filter(k => content.includes(k.keyword.toLowerCase())).map(k => k.keyword),
    date: mention.date || new Date().toISOString(),
    url: mention.url || '',
    flagged: Math.abs(score) >= 3,
    handled: false
  };
  data.mentions.push(entry);
  save(projectDir, data);
  return entry;
}

function listMentions(projectDir, options) {
  const data = load(projectDir);
  let items = data.mentions;
  if (options) {
    if (options.sentiment) items = items.filter(m => m.sentiment === options.sentiment);
    if (options.flagged) items = items.filter(m => m.flagged);
    if (options.platform) items = items.filter(m => m.platform === options.platform);
    if (options.keyword) items = items.filter(m => m.keywords.includes(options.keyword));
  }
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  return { mentions: items, total: items.length };
}

function analyze(projectDir) {
  const data = load(projectDir);
  const m = data.mentions;
  const total = m.length;
  if (total === 0) return { total: 0, sentiment: {}, topKeywords: [], flagged: 0, message: 'No mentions recorded yet' };
  const bySentiment = {};
  const keywordCounts = {};
  for (const mention of m) {
    bySentiment[mention.sentiment] = (bySentiment[mention.sentiment] || 0) + 1;
    for (const kw of mention.keywords) keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
  }
  const topKeywords = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => ({ keyword: k, count: v }));
  const flagged = m.filter(x => x.flagged).length;
  const positive = bySentiment.positive || 0;
  const negative = bySentiment.negative || 0;
  const netScore = total > 0 ? ((positive - negative) / total * 100).toFixed(1) : 0;
  return { total, bySentiment, netScore: Number(netScore), topKeywords, flagged, alertCount: flagged };
}

module.exports = { addKeyword, listKeywords, removeKeyword, addMention, listMentions, analyze };
