const path = require('path');
const fs = require('fs');

const DEFAULT_KNOWLEDGE = [
  { claim: 'The sky is blue', verdict: 'true', explanation: 'Due to Rayleigh scattering of sunlight by the atmosphere', source: 'Physics', confidence: 100 },
  { claim: 'Water boils at 100°C at sea level', verdict: 'true', explanation: 'Standard boiling point of water at 1 atm pressure', source: 'Chemistry', confidence: 100 },
  { claim: 'Humans need 8 hours of sleep exactly', verdict: 'misleading', explanation: 'Sleep needs vary by age, genetics, and lifestyle. 7-9 hours is the general range for adults.', source: 'CDC / Sleep Foundation', confidence: 90 },
  { claim: 'Eating carbs makes you gain weight', verdict: 'false', explanation: 'Weight gain is caused by caloric surplus, not carbohydrates specifically. Complex carbs are essential for health.', source: 'NIH / WHO', confidence: 95 },
  { claim: 'Vitamin C prevents colds', verdict: 'misleading', explanation: 'Vitamin C may slightly reduce cold duration but does not prevent colds in the general population.', source: 'Cochrane Review', confidence: 95 },
  { claim: 'Coffee stunts growth', verdict: 'false', explanation: 'No scientific evidence links coffee consumption to reduced height.', source: 'Harvard Health', confidence: 98 },
  { claim: 'Humans use only 10% of their brain', verdict: 'false', explanation: 'Brain imaging shows all parts of the brain have function. This is a persistent myth.', source: 'Neuroscience', confidence: 100 },
  { claim: 'Alcohol kills brain cells', verdict: 'misleading', explanation: 'Chronic heavy drinking can damage neurons, but moderate drinking does not kill brain cells.', source: 'NIH / Harvard', confidence: 85 },
  { claim: 'Cracking knuckles causes arthritis', verdict: 'false', explanation: 'Studies show no correlation between knuckle cracking and arthritis.', source: 'BMJ / Johns Hopkins', confidence: 95 },
  { claim: 'Multitasking is efficient', verdict: 'false', explanation: 'The brain cannot focus on multiple complex tasks simultaneously. Task-switching reduces efficiency by up to 40%.', source: 'Stanford / MIT', confidence: 90 }
];

function getFactcheckPath(projectDir) {
  return path.join(projectDir || process.cwd(), 'allie-factcheck.json');
}

function load(projectDir) {
  const fp = getFactcheckPath(projectDir);
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return { knowledge: DEFAULT_KNOWLEDGE, history: [] }; }
}

function save(projectDir, data) {
  fs.writeFileSync(getFactcheckPath(projectDir), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function check(projectDir, claim) {
  if (!claim || claim.trim().length === 0) throw new Error('Claim is required');
  const data = load(projectDir);
  const lower = claim.toLowerCase();
  const exact = data.knowledge.find(k => k.claim.toLowerCase() === lower);
  if (exact) return { ...exact, match: 'exact', claim, checkedAt: new Date().toISOString() };

  const matches = data.knowledge
    .map(k => ({ ...k, score: similarity(lower, k.claim.toLowerCase()) }))
    .filter(k => k.score > 0.3)
    .sort((a, b) => b.score - a.score);
  const entry = {
    claim,
    matches: matches.slice(0, 3),
    bestMatch: matches[0] || null,
    result: matches[0] ? { verdict: matches[0].verdict, explanation: matches[0].explanation, confidence: Math.round(matches[0].score * matches[0].confidence) } : { verdict: 'unverified', explanation: 'No matching claim in knowledge base', confidence: 0 },
    checkedAt: new Date().toISOString()
  };
  data.history.push(entry);
  save(projectDir, data);
  return entry;
}

function addKnowledge(projectDir, entry) {
  if (!entry.claim || !entry.verdict) throw new Error('Claim and verdict are required');
  const data = load(projectDir);
  const item = {
    claim: entry.claim,
    verdict: entry.verdict,
    explanation: entry.explanation || '',
    source: entry.source || 'Manual entry',
    confidence: entry.confidence || 50,
    addedAt: new Date().toISOString()
  };
  data.knowledge.push(item);
  save(projectDir, data);
  return item;
}

function listKnowledge(projectDir, verdict) {
  const data = load(projectDir);
  let items = data.knowledge;
  if (verdict) items = items.filter(k => k.verdict === verdict);
  return { knowledge: items, total: items.length };
}

function history(projectDir, limit) {
  const data = load(projectDir);
  const items = data.history.sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt));
  return { history: items.slice(0, limit || 20), total: items.length };
}

function stats(projectDir) {
  const data = load(projectDir);
  const byVerdict = {};
  for (const k of data.knowledge) byVerdict[k.verdict] = (byVerdict[k.verdict] || 0) + 1;
  return { knowledgeBase: data.knowledge.length, byVerdict, checksPerformed: data.history.length };
}

function similarity(a, b) {
  if (a === b) return 1;
  const wordsA = a.split(/\s+/);
  const wordsB = b.split(/\s+/);
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

module.exports = { check, addKnowledge, listKnowledge, history, stats };
