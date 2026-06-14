const path = require('path');
const fs = require('fs');

function getCalendarPath(projectDir) {
  return path.join(projectDir || process.cwd(), 'allie-calendar.json');
}

function load(projectDir) {
  const fp = getCalendarPath(projectDir);
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return { posts: [], tags: [] }; }
}

function save(projectDir, data) {
  fs.writeFileSync(getCalendarPath(projectDir), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function add(projectDir, post) {
  if (!post.title) throw new Error('Title is required');
  const data = load(projectDir);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    title: post.title,
    platform: post.platform || 'twitter',
    date: post.date || new Date().toISOString().split('T')[0],
    time: post.time || '12:00',
    content: post.content || '',
    status: post.status || 'draft',
    tags: post.tags || [],
    loops: post.loops || null,
    createdAt: new Date().toISOString()
  };
  data.posts.push(entry);
  if (post.tags) {
    for (const t of post.tags) { if (!data.tags.includes(t)) data.tags.push(t); }
  }
  save(projectDir, data);
  return entry;
}

function list(projectDir, options) {
  const data = load(projectDir);
  let posts = data.posts;
  if (options) {
    if (options.status) posts = posts.filter(p => p.status === options.status);
    if (options.platform) posts = posts.filter(p => p.platform === options.platform);
    if (options.tag) posts = posts.filter(p => p.tags.includes(options.tag));
    if (options.date) posts = posts.filter(p => p.date === options.date);
  }
  posts.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return { posts, tags: data.tags, total: posts.length };
}

function get(projectDir, id) {
  const data = load(projectDir);
  return data.posts.find(p => p.id === id) || null;
}

function update(projectDir, id, updates) {
  const data = load(projectDir);
  const idx = data.posts.findIndex(p => p.id === id);
  if (idx === -1) throw new Error(`Post ${id} not found`);
  Object.assign(data.posts[idx], updates);
  save(projectDir, data);
  return data.posts[idx];
}

function remove(projectDir, id) {
  const data = load(projectDir);
  const idx = data.posts.findIndex(p => p.id === id);
  if (idx === -1) throw new Error(`Post ${id} not found`);
  const removed = data.posts.splice(idx, 1)[0];
  save(projectDir, data);
  return removed;
}

function publish(projectDir, id) {
  return update(projectDir, id, { status: 'published', publishedAt: new Date().toISOString() });
}

function upcoming(projectDir, days) {
  const data = load(projectDir);
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + (days || 7));
  const range = data.posts.filter(p => {
    const d = new Date(p.date + 'T' + p.time);
    return d >= now && d <= end && p.status === 'scheduled';
  });
  range.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return { posts: range, count: range.length, from: now.toISOString().split('T')[0], to: end.toISOString().split('T')[0] };
}

function exportCsv(projectDir) {
  const data = load(projectDir);
  const header = 'id,title,platform,date,time,status,tags,loops,createdAt';
  const rows = data.posts.map(p =>
    `"${p.id}","${p.title.replace(/"/g,'""')}","${p.platform}","${p.date}","${p.time}","${p.status}","${(p.tags||[]).join(';')}","${p.loops||''}","${p.createdAt}"`
  );
  return [header, ...rows].join('\n') + '\n';
}

function stats(projectDir) {
  const data = load(projectDir);
  const byStatus = {};
  const byPlatform = {};
  for (const p of data.posts) {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1;
  }
  return { total: data.posts.length, byStatus, byPlatform, tags: data.tags };
}

module.exports = { add, list, get, update, remove, publish, upcoming, exportCsv, stats, load };
