const path = require('path');
const fs = require('fs');

const PLATFORMS = {
  twitter: { label: 'X / Twitter', charLimit: 280, media: true, format: 'text' },
  linkedin: { label: 'LinkedIn', charLimit: 3000, media: true, format: 'rich' },
  instagram: { label: 'Instagram', charLimit: 2200, media: true, format: 'image' },
  facebook: { label: 'Facebook', charLimit: 63206, media: true, format: 'rich' },
  tiktok: { label: 'TikTok', charLimit: 4000, media: true, format: 'video' },
  threads: { label: 'Threads', charLimit: 500, media: true, format: 'text' },
  bluesky: { label: 'Bluesky', charLimit: 300, media: true, format: 'text' },
  mastodon: { label: 'Mastodon', charLimit: 500, media: true, format: 'text' }
};

function getBridgePath(projectDir) {
  return path.join(projectDir || process.cwd(), 'allie-bridge.json');
}

function load(projectDir) {
  const fp = getBridgePath(projectDir);
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return { profiles: [], queue: [] }; }
}

function save(projectDir, data) {
  fs.writeFileSync(getBridgePath(projectDir), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function listPlatforms() {
  return Object.entries(PLATFORMS).map(([id, p]) => ({ id, ...p }));
}

function addProfile(projectDir, profile) {
  if (!profile.platform || !profile.handle) throw new Error('Platform and handle are required');
  const data = load(projectDir);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    platform: profile.platform,
    handle: profile.handle,
    label: profile.label || profile.handle,
    active: true,
    createdAt: new Date().toISOString()
  };
  data.profiles.push(entry);
  save(projectDir, data);
  return entry;
}

function listProfiles(projectDir) {
  const data = load(projectDir);
  const byPlatform = {};
  for (const p of data.profiles) {
    if (!byPlatform[p.platform]) byPlatform[p.platform] = [];
    byPlatform[p.platform].push(p);
  }
  return { profiles: data.profiles, byPlatform, total: data.profiles.length };
}

function removeProfile(projectDir, id) {
  const data = load(projectDir);
  const idx = data.profiles.findIndex(p => p.id === id);
  if (idx === -1) throw new Error(`Profile ${id} not found`);
  const removed = data.profiles.splice(idx, 1)[0];
  save(projectDir, data);
  return removed;
}

function queue(projectDir, opts) {
  if (!opts.content) throw new Error('Content is required');
  const data = load(projectDir);
  const targets = opts.platforms || data.profiles.filter(p => p.active).map(p => p.platform);
  const unique = [...new Set(targets)];
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    content: opts.content,
    platforms: unique,
    scheduled: opts.scheduled || null,
    status: 'queued',
    createdAt: new Date().toISOString()
  };
  data.queue.push(entry);
  save(projectDir, data);
  return entry;
}

function listQueue(projectDir, status) {
  const data = load(projectDir);
  let items = data.queue;
  if (status) items = items.filter(q => q.status === status);
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { queue: items, total: items.length };
}

function publishBatch(projectDir, id) {
  const data = load(projectDir);
  const item = data.queue.find(q => q.id === id);
  if (!item) throw new Error(`Queue item ${id} not found`);
  const results = [];
  for (const pf of item.platforms) {
    const plat = PLATFORMS[pf];
    if (!plat) { results.push({ platform: pf, status: 'skipped', reason: 'Unknown platform' }); continue; }
    const profiles = data.profiles.filter(p => p.platform === pf && p.active);
    if (profiles.length === 0) { results.push({ platform: pf, status: 'skipped', reason: 'No active profile' }); continue; }
    const content = item.content.length > plat.charLimit ? item.content.substring(0, plat.charLimit) : item.content;
    const exportPath = path.join(projectDir || process.cwd(), 'allie-exports');
    if (!fs.existsSync(exportPath)) fs.mkdirSync(exportPath, { recursive: true });
    const filePath = path.join(exportPath, `${pf}-${item.id}.md`);
    fs.writeFileSync(filePath, `# Cross-post to ${plat.label}\n\n**Profiles:** ${profiles.map(p => p.handle).join(', ')}\n**Date:** ${item.scheduled || new Date().toISOString()}\n\n---\n\n${content}\n`, 'utf8');
    results.push({ platform: pf, label: plat.label, status: 'exported', file: filePath, charCount: content.length, limit: plat.charLimit });
  }
  item.status = 'published';
  item.publishedAt = new Date().toISOString();
  item.results = results;
  save(projectDir, data);
  return { id: item.id, results };
}

function exportAll(projectDir) {
  const data = load(projectDir);
  const exportDir = path.join(projectDir || process.cwd(), 'allie-exports');
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });
  const files = [];
  for (const item of data.queue) {
    if (item.status !== 'published') continue;
    for (const r of (item.results || [])) {
      if (r.file && fs.existsSync(r.file)) files.push(r.file);
    }
  }
  return { exportDir, files, count: files.length };
}

module.exports = { listPlatforms, addProfile, listProfiles, removeProfile, queue, listQueue, publishBatch, exportAll, PLATFORMS };
