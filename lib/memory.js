const path = require('path');
const fs = require('fs');

const MEMORY_LIB_PATH = 'C:\\Users\\uncom\\Desktop\\lib\\memory\\index.js';

let _mem = null;

function load(projectDir) {
  if (_mem) return _mem;
  try {
    if (fs.existsSync(MEMORY_LIB_PATH)) {
      const lib = require(MEMORY_LIB_PATH);
      _mem = new lib.UnifiedMemory({ dataDir: path.join(projectDir, '.allie-memory') });
      return _mem;
    }
  } catch {}
  return null;
}

function remember(projectDir, params) {
  const mem = load(projectDir);
  if (!mem) return null;
  return mem.remember(params);
}

function recall(projectDir, query, opts) {
  const mem = load(projectDir);
  if (!mem) return [];
  return mem.recall(query, opts);
}

function stats(projectDir) {
  const mem = load(projectDir);
  if (!mem) return { enabled: false };
  return { enabled: true, ...mem.stats() };
}

function consolidate(projectDir) {
  const mem = load(projectDir);
  if (!mem) return null;
  return mem.consolidate();
}

function tui(projectDir) {
  const mem = load(projectDir);
  if (!mem) {
    console.log('Memory system not available. Install lib/memory/ first.');
    return;
  }
  mem.tui();
}

function enabled() { return _mem !== null || fs.existsSync(MEMORY_LIB_PATH); }

module.exports = { load, remember, recall, stats, consolidate, tui, enabled };
