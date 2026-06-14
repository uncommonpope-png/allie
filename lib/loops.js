const path = require('path');
const fs = require('fs');

const DEFAULT_TEMPLATES = [
  { id: 'hook-story-cta', name: 'Hook → Story → CTA', slots: 3,
    description: 'Classic attention-grabbing narrative arc',
    prompts: ['Hook that grabs attention in first 3 seconds', 'Personal story or case study', 'Clear call to action'] },
  { id: 'teaser-launch-review', name: 'Teaser → Launch → Review', slots: 3,
    description: 'Product release sequence building anticipation',
    prompts: ['Mystery teaser with countdown', 'Full launch announcement', 'Post-launch results and review'] },
  { id: 'problem-solution-proof', name: 'Problem → Solution → Proof', slots: 3,
    description: 'Pain point identification and resolution',
    prompts: ['Relatable problem statement', 'How you solved it', 'Evidence of results'] },
  { id: 'educational-5day', name: '5-Day Educational Series', slots: 5,
    description: 'Deep dive educational content across a week',
    prompts: ['Day 1: What is it?', 'Day 2: Why it matters', 'Day 3: How to start', 'Day 4: Advanced tips', 'Day 5: Resources and next steps'] },
  { id: 'comparison', name: 'Comparison/Showdown', slots: 2,
    description: 'Head-to-head comparison of two approaches',
    prompts: ['Option A vs Option B overview', 'Deep dive on winner and why'] },
  { id: 'behind-scenes', name: 'Behind the Scenes', slots: 3,
    description: 'Transparency and process content',
    prompts: ['The setup/behind the curtain', 'The work in progress', 'The final result and lessons'] }
];

function getLoopsPath(projectDir) {
  return path.join(projectDir || process.cwd(), 'allie-loops.json');
}

function load(projectDir) {
  const fp = getLoopsPath(projectDir);
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return { loops: [], templates: DEFAULT_TEMPLATES }; }
}

function save(projectDir, data) {
  fs.writeFileSync(getLoopsPath(projectDir), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function listTemplates(projectDir) {
  const data = load(projectDir);
  return data.templates;
}

function create(projectDir, opts) {
  if (!opts.name) throw new Error('Loop name is required');
  const data = load(projectDir);
  const template = opts.template ? data.templates.find(t => t.id === opts.template) : null;
  const slots = template ? template.prompts.map((p, i) => ({
    slot: i + 1, prompt: p, content: '', status: 'pending'
  })) : [];
  for (let i = 0; i < (opts.slots || 3); i++) {
    if (!slots[i]) slots.push({ slot: i + 1, prompt: opts.prompts?.[i] || `Post ${i + 1}`, content: '', status: 'pending' });
  }
  const loop = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: opts.name,
    template: template ? template.id : null,
    platform: opts.platform || 'twitter',
    slots,
    status: 'draft',
    createdAt: new Date().toISOString(),
    notes: opts.notes || ''
  };
  data.loops.push(loop);
  save(projectDir, data);
  return loop;
}

function list(projectDir, status) {
  const data = load(projectDir);
  let loops = data.loops;
  if (status) loops = loops.filter(l => l.status === status);
  loops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { loops, total: loops.length };
}

function get(projectDir, id) {
  const data = load(projectDir);
  return data.loops.find(l => l.id === id) || null;
}

function updateSlot(projectDir, loopId, slotNum, content) {
  const data = load(projectDir);
  const loop = data.loops.find(l => l.id === loopId);
  if (!loop) throw new Error(`Loop ${loopId} not found`);
  const slot = loop.slots.find(s => s.slot === slotNum);
  if (!slot) throw new Error(`Slot ${slotNum} not found in loop ${loopId}`);
  slot.content = content;
  slot.status = content ? 'written' : 'pending';
  save(projectDir, data);
  return slot;
}

function activate(projectDir, id) {
  const data = load(projectDir);
  const loop = data.loops.find(l => l.id === id);
  if (!loop) throw new Error(`Loop ${id} not found`);
  loop.status = 'active';
  save(projectDir, data);
  return loop;
}

function complete(projectDir, id) {
  const data = load(projectDir);
  const loop = data.loops.find(l => l.id === id);
  if (!loop) throw new Error(`Loop ${id} not found`);
  loop.status = 'completed';
  loop.completedAt = new Date().toISOString();
  save(projectDir, data);
  return loop;
}

function remove(projectDir, id) {
  const data = load(projectDir);
  const idx = data.loops.findIndex(l => l.id === id);
  if (idx === -1) throw new Error(`Loop ${id} not found`);
  const removed = data.loops.splice(idx, 1)[0];
  save(projectDir, data);
  return removed;
}

module.exports = { listTemplates, create, list, get, updateSlot, activate, complete, remove, DEFAULT_TEMPLATES };
