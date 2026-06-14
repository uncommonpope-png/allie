const path = require('path');
const fs = require('fs');

const TOPIC_CATEGORIES = [
  { id: 'industry-news', label: 'Industry News & Trends', keywords: ['industry', 'trend', 'news', 'market', 'report'] },
  { id: 'educational', label: 'Educational Content', keywords: ['how to', 'guide', 'tutorial', 'tips', 'learn', 'beginner'] },
  { id: 'case-studies', label: 'Case Studies & Results', keywords: ['case study', 'results', 'testimonial', 'roi', 'before after'] },
  { id: 'thought-leadership', label: 'Thought Leadership', keywords: ['opinion', 'perspective', 'future', 'prediction', 'vision'] },
  { id: 'product-updates', label: 'Product Updates', keywords: ['launch', 'update', 'release', 'feature', 'new'] },
  { id: 'community', label: 'Community & Culture', keywords: ['team', 'culture', 'community', 'behind the scenes', 'event'] },
  { id: 'comparisons', label: 'Comparisons & Reviews', keywords: ['vs', 'comparison', 'alternative', 'review', 'best'] },
  { id: 'problem-solving', label: 'Problem Solving', keywords: ['problem', 'solution', 'fix', 'debug', 'troubleshoot'] }
];

const BEST_TIMES = {
  twitter: { weekday: ['7-9 AM', '12-1 PM', '5-6 PM'], weekend: ['8-10 AM', '6-8 PM'] },
  linkedin: { weekday: ['7-9 AM', '12-1 PM', '5-6 PM'], weekend: ['9-11 AM'] },
  instagram: { weekday: ['9-11 AM', '11 AM-1 PM', '6-8 PM'], weekend: ['9-11 AM', '6-9 PM'] },
  facebook: { weekday: ['8-10 AM', '12-2 PM'], weekend: ['9-11 AM', '12-2 PM'] },
  tiktok: { weekday: ['6-9 PM', '11 AM-1 PM'], weekend: ['8-11 AM', '6-10 PM'] },
  youtube: { weekday: ['2-4 PM', '6-8 PM'], weekend: ['9-11 AM', '2-5 PM'] },
  threads: { weekday: ['7-9 AM', '5-7 PM'], weekend: ['8-10 AM', '5-8 PM'] }
};

function getTopicsPath(projectDir) {
  return path.join(projectDir || process.cwd(), 'allie-topics.json');
}

function loadTopics(projectDir) {
  const fp = getTopicsPath(projectDir);
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return { topics: [], contentLibrary: [] }; }
}

function saveTopics(projectDir, data) {
  fs.writeFileSync(getTopicsPath(projectDir), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function generate(projectDir, count) {
  count = count || 5;
  const data = loadTopics(projectDir);
  const existing = data.topics.map(t => t.title.toLowerCase());
  const usedCategories = new Set(data.topics.map(t => t.category));
  const suggestions = [];
  const categories = TOPIC_CATEGORIES.filter(c => !usedCategories.has(c.id) || Math.random() > 0.5);
  for (let i = 0; i < count && i < categories.length * 2; i++) {
    const cat = categories[i % categories.length];
    const kw = cat.keywords[Math.floor(Math.random() * cat.keywords.length)];
    const title = `${cat.label} — ${kw.charAt(0).toUpperCase() + kw.slice(1)} Perspective`;
    if (existing.includes(title.toLowerCase())) continue;
    suggestions.push({
      title,
      category: cat.id,
      categoryLabel: cat.label,
      keywords: cat.keywords,
      platform: ['twitter', 'linkedin', 'instagram', 'tiktok'][Math.floor(Math.random() * 4)],
      confidence: (70 + Math.floor(Math.random() * 25)).toFixed(0)
    });
  }
  return { suggestions, categories: TOPIC_CATEGORIES };
}

function addTopic(projectDir, topic) {
  if (!topic.title) throw new Error('Topic title is required');
  const data = loadTopics(projectDir);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    title: topic.title,
    category: topic.category || 'other',
    notes: topic.notes || '',
    source: topic.source || '',
    createdAt: new Date().toISOString()
  };
  data.topics.push(entry);
  saveTopics(projectDir, data);
  return entry;
}

function listTopics(projectDir) {
  const data = loadTopics(projectDir);
  const byCategory = {};
  for (const t of data.topics) {
    const cat = t.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(t);
  }
  return { topics: data.topics, byCategory, total: data.topics.length };
}

function bestTime(platform) {
  const times = BEST_TIMES[platform];
  if (!times) return { weekday: ['9 AM - 12 PM'], weekend: ['10 AM - 2 PM'] };
  return times;
}

function analyze(projectDir) {
  const data = loadTopics(projectDir);
  const catCounts = {};
  for (const t of data.topics) {
    const cat = t.category || 'other';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  }
  const total = data.topics.length;
  return {
    totalTopics: total,
    categoryBreakdown: catCounts,
    coverage: TOPIC_CATEGORIES.map(c => ({
      category: c.label,
      count: catCounts[c.id] || 0,
      covered: (catCounts[c.id] || 0) > 0
    })),
    gaps: TOPIC_CATEGORIES.filter(c => !catCounts[c.id]).map(c => c.label),
    diversity: total > 0 ? (Object.keys(catCounts).length / TOPIC_CATEGORIES.length * 100).toFixed(0) + '%' : 'N/A'
  };
}

module.exports = { generate, addTopic, listTopics, bestTime, analyze, TOPIC_CATEGORIES, BEST_TIMES };
