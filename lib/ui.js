const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

function color(c, s) { return c + s + RESET; }

function banner(title, subtitle) {
  const line = '━'.repeat(60);
  console.log(`\n${color(BOLD+BLUE, `  ${title}`)}`);
  if (subtitle) console.log(`  ${color(GRAY, subtitle)}`);
  console.log(`  ${color(GRAY, line)}`);
}

function section(title) {
  console.log(`\n${color(BOLD+CYAN, `▸ ${title}`)}`);
}

function sub(msg) {
  console.log(`  ${color(GRAY, msg)}`);
}

function success(msg) {
  console.log(`  ${color(GREEN, '✓')} ${msg}`);
}

function warn(msg) {
  console.log(`  ${color(YELLOW, '⚠')} ${msg}`);
}

function error(msg) {
  console.log(`  ${color(RED, '✗')} ${msg}`);
}

function info(msg) {
  console.log(`  ${color(BLUE, 'ℹ')} ${msg}`);
}

function kv(key, value, valColor) {
  const vc = valColor || '';
  console.log(`  ${color(GRAY, key)}: ${vc}${value}${RESET}`);
}

function bullet(items, indent) {
  const pad = '  '.repeat(indent || 1);
  for (const item of items) {
    console.log(`${pad}${color(GRAY, '•')} ${item}`);
  }
}

function divider() {
  console.log(`  ${color(GRAY, '─'.repeat(56))}`);
}

function table(headers, rows) {
  if (rows.length === 0) { sub('(empty)'); return; }
  const colWidths = headers.map((h, i) => {
    const maxData = rows.reduce((m, r) => Math.max(m, String(r[i] || '').length), 0);
    return Math.max(h.length, maxData) + 2;
  });
  const sep = '  ' + headers.map((h, i) => color(GRAY, '─'.repeat(colWidths[i]))).join(color(GRAY, '─┼─')) + color(GRAY, '─');
  console.log('  ' + headers.map((h, i) => color(BOLD, h.padEnd(colWidths[i]))).join(' │ '));
  console.log(sep);
  for (const row of rows) {
    console.log('  ' + row.map((c, i) => String(c).padEnd(colWidths[i])).join(' │ '));
  }
}

function kvTable(rows) {
  if (rows.length === 0) return;
  const keyWidth = Math.max(...rows.map(r => r[0].length)) + 2;
  for (const [k, v] of rows) {
    console.log(`  ${color(GRAY, k.padEnd(keyWidth))}${v}`);
  }
}

function progress(percent, label) {
  const barWidth = 30;
  const filled = Math.round(percent / 100 * barWidth);
  const empty = barWidth - filled;
  const bar = color(GREEN, '█'.repeat(filled)) + color(GRAY, '░'.repeat(empty));
  console.log(`  ${bar} ${color(GRAY, `${percent}%`)} ${label || ''}`);
}

function json(data) {
  console.log(JSON.stringify(data, null, 2));
}

function indent(text, level) {
  const pad = '  '.repeat(level || 1);
  return text.split('\n').map(l => pad + l).join('\n');
}

const ui = {
  banner, section, sub, success, warn, error, info, kv, bullet, divider,
  table, kvTable, progress, json, indent, color, RESET, BOLD, DIM,
  RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, GRAY
};

module.exports = ui;
