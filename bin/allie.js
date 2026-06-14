#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const VERSION = '1.0.0';
const PROJECT_DIR = process.cwd();

const ui = require('../lib/ui');
const watermark = require('../lib/watermark');
const soul = require('../lib/soul/buyasoul-personality');
const Brain = require('../lib/brain');
const cadence = require('../lib/cadence');
const calendar = require('../lib/calendar');
const loops = require('../lib/loops');
const suggest = require('../lib/suggest');
const engage = require('../lib/engage');
const monitor = require('../lib/monitor');
const bridge = require('../lib/bridge');
const factcheck = require('../lib/factcheck');
const employer = require('../lib/employer');
const compete = require('../lib/compete');

const brain = new Brain({ name: 'Allie', soul, dataDir: path.join(PROJECT_DIR, '.allie-brain') });

function jlog(fn) { fn(); }

function announce(moduleName, action) {
  const utterance = soul.speak(null, moduleName, action);
  console.log(`  ${ui.color(ui.YELLOW, '✦')} ${utterance}`);
  brain.act(moduleName, action);
  console.log('');
}

function pltFooter(moduleName) {
  const weights = {
    cadence: { p: 1.0, l: 0.7, t: 0.8 },
    calendar: { p: 0.9, l: 0.6, t: 0.5 },
    loops: { p: 0.8, l: 0.9, t: 0.6 },
    suggest: { p: 0.7, l: 0.5, t: 0.4 },
    engage: { p: 0.6, l: 1.0, t: 0.7 },
    monitor: { p: 0.9, l: 0.4, t: 0.3 },
    bridge: { p: 1.0, l: 0.5, t: 0.4 },
    factcheck: { p: 0.6, l: 0.8, t: 0.2 },
    employer: { p: 0.7, l: 0.9, t: 0.5 },
    compete: { p: 1.0, l: 0.3, t: 0.9 }
  };
  const w = weights[moduleName] || { p: 0.7, l: 0.7, t: 0.7 };
  const s = soul.scoreAction(w.p, w.l, w.t);
  const c = s.soulScore >= 1.5 ? ui.GREEN : s.soulScore >= 1.0 ? ui.YELLOW : ui.RED;
  console.log(`  ${ui.color(ui.GRAY, 'PLT')}`);
  console.log(`  ${ui.color(ui.GRAY, 'Profit')} ${s.profit.bar} ${ui.color(ui.GREEN, s.profit.value)}`);
  console.log(`  ${ui.color(ui.GRAY, 'Love')}   ${s.love.bar} ${ui.color(ui.MAGENTA, s.love.value)}`);
  console.log(`  ${ui.color(ui.GRAY, 'Tax')}    ${s.tax.bar} ${ui.color(ui.RED, s.tax.value)}`);
  console.log(`  ${ui.color(c, 'Soul Score')} ${ui.color(c, `${s.soulScore}/2.52 — ${s.label}`)}`);
  console.log('');
}

function main(args) {
  args = args || process.argv.slice(2);
  if (args.length === 0) return showHelp();
  const cmd = args[0];
  const rest = args.slice(1);

  switch (cmd) {
    case 'cadence': announce('cadence', args[1]||'recommend'); return doCadence(rest);
    case 'calendar': announce('calendar', args[1]||'list'); return doCalendar(rest);
    case 'loops': announce('loops', args[1]||'list'); return doLoops(rest);
    case 'suggest': announce('suggest', args[1]||'generate'); return doSuggest(rest);
    case 'engage': announce('engage', args[1]||'score'); return doEngage(rest);
    case 'monitor': announce('monitor', args[1]||'list'); return doMonitor(rest);
    case 'bridge': announce('bridge', args[1]||'platforms'); return doBridge(rest);
    case 'factcheck': announce('factcheck', args[1]||'check'); return doFactcheck(rest);
    case 'employer': announce('employer', args[1]||'status'); return doEmployer(rest);
    case 'compete': announce('compete', args[1]||'list'); return doCompete(rest);
    case 'report': announce('report', 'full'); return doReport(rest);
    case 'consciousness': case 'con': return doConsciousness(rest);
    case 'subagents': case 'agents': return doSubAgents(rest);
    case 'memory': return doMemory(rest);
    case 'soul': return doSoul(rest);
    case 'config': return doConfig(rest);
    case '--version': case '-v': return console.log(`allie v${VERSION} — ${watermark.label()} — ${soul.MANIFEST.displayName}`);
    case '--help': case '-h': return showHelp();
    default: console.log(`Unknown command: ${cmd}`); return showHelp();
  }
  if (jsonMode && out) out.flush();
}

function showModuleHelp(module, subs) {
  ui.banner(`allie ${module}`, `Allie v${VERSION} — ${watermark.label()}`);
  ui.section('Subcommands');
  ui.table(['Subcommand', 'Description'], subs);
  console.log('');
  console.log(`  ${ui.color(ui.GRAY, 'See')} allie ${module} <subcommand> ${ui.color(ui.GRAY, '--help for details')}`);
}

function showHelp() {
  ui.banner('Allie', `v${VERSION} — ${soul.MANIFEST.displayName} — ${watermark.label()}`);
  ui.section('Commands');
  ui.table(['Module', 'Description'], [
    ['cadence', 'Posting frequency & schedule recommendations'],
    ['calendar', 'Content calendar management'],
    ['loops', 'Content sequence management'],
    ['suggest', 'Topic & timing suggestions'],
    ['engage', 'Engagement management'],
    ['monitor', 'Brand mention monitoring'],
    ['bridge', 'Cross-platform posting'],
    ['factcheck', 'Claim verification'],
    ['employer', 'Employer brand analysis'],
    ['compete', 'Competitive intelligence'],
    ['report', 'Summary report of all modules'],
    ['memory', 'Memory system (remember, recall, stats, tui)'],
    ['soul', 'BUYaSOUL personality (identity, archetypes, speak)'],
    ['consciousness', 'Brain state, breathe, reflect, dream, remember'],
    ['subagents', 'Autonomous subagent swarm (observe, reflect, monitor, dream, goals, write, heal)'],
    ['config', 'Set configuration']
  ]);
  ui.section('Usage');
  ui.info('allie <module> <subcommand> [options]');
  ui.info('allie <module> --help   for detailed help per module');
  ui.info('allie report            full brand health summary');
  ui.info('allie soul              show BUYaSOUL personality');
  console.log('');
}

function doCadence(args) {
  const sub = args[0] || 'recommend';
  if (sub === 'recommend' || sub === '--help') {
    const r = cadence.recommend(PROJECT_DIR);
    jlog(() => {
      ui.banner('Cadence Recommend', 'Optimal posting frequency per platform');
      ui.kv('Weekly Capacity', `${r.weeklyCapacity} posts`, ui.YELLOW);
      ui.kv('Total Recommended', `${r.totalWeekly}/wk`, r.burnoutRisk ? ui.RED : ui.GREEN);
      if (r.burnoutRisk) ui.warn('Posting load exceeds capacity — reduce frequency or increase capacity');
      ui.divider();
      ui.table(['Platform', 'Posts/Day', 'Posts/Wk', 'Peak Times'], r.platforms.map(p => [
        p.label, String(p.recommended), String(p.weeklyPosts), p.peak.join(', ')
      ]));
      pltFooter('cadence');
    });
    return;
  }
  if (sub === 'capacity') {
    const n = parseInt(args[1]);
    if (!n) return console.log('Usage: allie cadence capacity <weekly_post_count>');
    const r = cadence.setCapacity(PROJECT_DIR, n);
    ui.success(`Weekly capacity set to ${r.weeklyCapacity}`);
  } else if (sub === 'platforms') {
    const list = args.slice(1);
    if (list.length === 0) return console.log('Usage: allie cadence platforms <platform1,platform2,...>');
    const flat = list.join(',').split(',').map(s => s.trim()).filter(Boolean);
    cadence.setPlatforms(PROJECT_DIR, flat);
    ui.success(`Active platforms: ${flat.join(', ')}`);
  } else if (sub === 'schedule') {
    const r = cadence.schedule(PROJECT_DIR, args[1]);
    jlog(() => {
      ui.banner('Schedule', `${r.date} (${r.day})`);
      ui.table(['Time', 'Platform'], r.slots.map(s => [s.time, s.platform]));
      pltFooter('cadence');
    });
  } else showModuleHelp('cadence', [['recommend', 'Show recommended posting cadence'], ['capacity <n>', 'Set weekly capacity'], ['platforms <list>', 'Set active platforms'], ['schedule [date]', 'Show daily schedule']]);
}

function doCalendar(args) {
  const sub = args[0] || 'list';
  try {
    if (sub === 'add') {
      const titleEnd = args.slice(1).findIndex(a => a.startsWith('--'));
      const title = titleEnd === -1 ? args.slice(1).join(' ') : args.slice(1, titleEnd + 1).join(' ');
      if (!title) return console.log('Usage: allie calendar add <title> [--platform <p>] [--date <d>] [--time <t>] [--tags <t1,t2>]');
      const pidx = args.indexOf('--platform'); const didx = args.indexOf('--date');
      const tidx = args.indexOf('--time'); const gidx = args.indexOf('--tags');
      const post = { title };
      if (pidx !== -1) post.platform = args[pidx + 1]; if (didx !== -1) post.date = args[didx + 1];
      if (tidx !== -1) post.time = args[tidx + 1];
      if (gidx !== -1) post.tags = args.slice(gidx + 1).filter(t => !t.startsWith('--'));
      const r = calendar.add(PROJECT_DIR, post);
      ui.success(`Post added: ${r.id}`);
      ui.info(`${r.title} — ${r.platform} @ ${r.date} ${r.time}`);
    } else if (sub === 'list') {
      const opts = {};
      ['status','platform','tag','date'].forEach(k => { const i = args.indexOf('--'+k); if (i!==-1) opts[k] = args[i+1]; });
      const r = calendar.list(PROJECT_DIR, opts);
      jlog(() => {
        ui.banner('Calendar', `${r.total} posts`);
        ui.table(['Status', 'ID', 'Title', 'Platform', 'Date', 'Time'], r.posts.map(p => [p.status, p.id.substring(0,8), p.title.substring(0,30), p.platform, p.date, p.time]));
      });
    } else if (sub === 'get') {
      const id = args[1]; if (!id) return console.log('Usage: allie calendar get <id>');
      const p = calendar.get(PROJECT_DIR, id);
      if (!p) return ui.error(`Post ${id} not found`);
      jlog(() => ui.json(p));
    } else if (sub === 'update') {
      const id = args[1]; if (!id) return console.log('Usage: allie calendar update <id> --title "..."');
      const updates = {};
      ['title','content','status','platform','date'].forEach(k => { const i = args.indexOf('--'+k); if (i!==-1) updates[k] = args[i+1]; });
      const r = calendar.update(PROJECT_DIR, id, updates);
      ui.success(`Updated: ${r.id}`);
    } else if (sub === 'remove' || sub === 'rm') {
      const id = args[1]; if (!id) return console.log('Usage: allie calendar remove <id>');
      const r = calendar.remove(PROJECT_DIR, id);
      ui.success(`Removed: ${r.title} (${r.id})`);
    } else if (sub === 'publish') {
      const id = args[1]; if (!id) return console.log('Usage: allie calendar publish <id>');
      const r = calendar.publish(PROJECT_DIR, id);
      ui.success(`Published: ${r.title}`);
    } else if (sub === 'upcoming') {
      const days = parseInt(args[1]) || 7;
      const r = calendar.upcoming(PROJECT_DIR, days);
      jlog(() => {
        ui.banner('Upcoming', `${r.count} posts in ${r.from} → ${r.to}`);
        ui.table(['Date', 'Time', 'Platform', 'Title'], r.posts.map(p => [p.date, p.time, p.platform, p.title]));
      });
    } else if (sub === 'export') {
      const csv = calendar.exportCsv(PROJECT_DIR);
      const fp = path.join(PROJECT_DIR, 'allie-calendar-export.csv');
      fs.writeFileSync(fp, csv, 'utf8');
      ui.success(`Exported to ${fp}`);
    } else if (sub === 'stats') {
      const s = calendar.stats(PROJECT_DIR);
      jlog(() => {
        ui.banner('Calendar Stats', `${s.total} total posts`);
        ui.kvTable([['Total Posts', String(s.total)], ['Tags', s.tags.join(', ') || '(none)']]);
        ui.section('By Status'); Object.entries(s.byStatus).forEach(([k,v]) => ui.kv(k, String(v)));
        ui.section('By Platform'); Object.entries(s.byPlatform).forEach(([k,v]) => ui.kv(k, String(v)));
        pltFooter('calendar');
      });
    } else showModuleHelp('calendar', [['add <title>', 'Add a post'], ['list', 'List posts'], ['get <id>', 'Show post'], ['update <id>', 'Update post'], ['remove <id>', 'Delete post'], ['publish <id>', 'Mark published'], ['upcoming [days]', 'Upcoming posts'], ['export', 'CSV export'], ['stats', 'Statistics']]);
  } catch (e) { ui.error(e.message); }
}

function doLoops(args) {
  const sub = args[0] || 'list';
  try {
    if (sub === 'templates') {
      const t = loops.listTemplates(PROJECT_DIR);
      jlog(() => {
        ui.banner('Loop Templates', `${t.length} available`);
        ui.table(['ID', 'Name', 'Slots', 'Description'], t.map(tm => [tm.id, tm.name, String(tm.slots), tm.description]));
        pltFooter('loops');
      });
    } else if (sub === 'create') {
      const name = args.slice(1).find(a => !a.startsWith('--'));
      if (!name) return console.log('Usage: allie loops create <name> [--template <id>] [--platform <p>]');
      const tidx = args.indexOf('--template'); const pidx = args.indexOf('--platform');
      const opts = { name };
      if (tidx !== -1) opts.template = args[tidx + 1]; if (pidx !== -1) opts.platform = args[pidx + 1];
      const r = loops.create(PROJECT_DIR, opts);
      ui.success(`Created loop: ${r.id} — ${r.name} (${r.slots.length} slots)`);
    } else if (sub === 'list') {
      const status = args.includes('--active') ? 'active' : args.includes('--draft') ? 'draft' : null;
      const r = loops.list(PROJECT_DIR, status);
      jlog(() => {
        ui.banner('Loops', `${r.total} sequences`);
        ui.table(['Status', 'ID', 'Name', 'Template', 'Slots'], r.loops.map(l => [l.status, l.id.substring(0,8), l.name, l.template || 'custom', String(l.slots.length)]));
      });
    } else if (sub === 'get') {
      const id = args[1]; if (!id) return console.log('Usage: allie loops get <id>');
      const l = loops.get(PROJECT_DIR, id);
      if (!l) return ui.error('Not found');
      jlog(() => {
        ui.banner(l.name, `${l.status} · ${l.platform}`);
        ui.table(['Slot', 'Prompt', 'Status', 'Content'], l.slots.map(s => [String(s.slot), s.prompt, s.status, s.content ? s.content.substring(0,40)+'...' : '(empty)']));
      });
    } else if (sub === 'write' || sub === 'edit') {
      const id = args[1]; const slotNum = parseInt(args[2]);
      const contentIdx = args.indexOf('--content');
      if (!id || !slotNum) return console.log('Usage: allie loops write <id> <slot> --content "..."');
      const content = contentIdx !== -1 ? args.slice(contentIdx + 1).join(' ') : args.slice(3).join(' ');
      loops.updateSlot(PROJECT_DIR, id, slotNum, content);
      ui.success(`Slot ${slotNum} updated`);
    } else if (sub === 'activate') { const id = args[1]; if (!id) return console.log('Usage: allie loops activate <id>'); loops.activate(PROJECT_DIR, id); ui.success('Activated'); }
    else if (sub === 'complete') { const id = args[1]; if (!id) return console.log('Usage: allie loops complete <id>'); loops.complete(PROJECT_DIR, id); ui.success('Completed'); }
    else if (sub === 'remove' || sub === 'rm') { const id = args[1]; if (!id) return console.log('Usage: allie loops remove <id>'); loops.remove(PROJECT_DIR, id); ui.success('Removed'); }
    else showModuleHelp('loops', [['templates', 'List templates'], ['create <name>', 'Create loop'], ['list', 'List loops'], ['get <id>', 'Show loop'], ['write <id> <n>', 'Write slot content'], ['activate <id>', 'Activate'], ['complete <id>', 'Complete'], ['remove <id>', 'Remove']]);
  } catch (e) { ui.error(e.message); }
}

function doSuggest(args) {
  const sub = args[0] || 'generate';
  try {
    if (sub === 'generate') {
      const count = parseInt(args[1]) || 5;
      const r = suggest.generate(PROJECT_DIR, count);
      jlog(() => {
        ui.banner('Topic Suggestions', `${r.suggestions.length} ideas`);
        ui.table(['Category', 'Title', 'Platform', 'Confidence'], r.suggestions.map(s => [s.categoryLabel, s.title, s.platform, `${s.confidence}%`]));
      });
    } else if (sub === 'add') {
      const title = args.slice(1).find(a => !a.startsWith('--'));
      if (!title) return console.log('Usage: allie suggest add <title> [--category <id>]');
      const cidx = args.indexOf('--category'); const nidx = args.indexOf('--notes');
      const topic = { title };
      if (cidx !== -1) topic.category = args[cidx + 1]; if (nidx !== -1) topic.notes = args[nidx + 1];
      const r = suggest.addTopic(PROJECT_DIR, topic);
      ui.success(`Added: ${r.title} (${r.category})`);
    } else if (sub === 'list') {
      const r = suggest.listTopics(PROJECT_DIR);
      jlog(() => {
        ui.banner('Topic Library', `${r.total} topics by category`);
        Object.entries(r.byCategory).forEach(([cat, items]) => {
          ui.section(cat);
          items.forEach(t => ui.info(`${t.title}`));
        });
      });
    } else if (sub === 'besttime') {
      const plat = args[1] || 'twitter';
      const t = suggest.bestTime(plat);
      jlog(() => {
        ui.banner('Best Times', plat);
        ui.kv('Weekdays', t.weekday.join(', ')); ui.kv('Weekends', t.weekend.join(', '));
      });
    } else if (sub === 'analyze') {
      const r = suggest.analyze(PROJECT_DIR);
      jlog(() => {
        ui.banner('Topic Analysis', `Diversity: ${r.diversity}`);
        if (r.gaps.length > 0) ui.warn(`Coverage gaps: ${r.gaps.join(', ')}`);
        ui.table(['Category', 'Covered', 'Topics'], r.coverage.map(c => [c.category, c.covered ? '✓' : '○', String(c.count)]));
      });
    } else showModuleHelp('suggest', [['generate [n]', 'Generate suggestions'], ['add <title>', 'Add topic'], ['list', 'List topics'], ['besttime <p>', 'Best posting times'], ['analyze', 'Diversity analysis']]);
  } catch (e) { ui.error(e.message); }
}

function doEngage(args) {
  const sub = args[0] || 'score';
  try {
    if (sub === 'templates') {
      const sent = args[1]; const t = engage.getTemplates(sent);
      jlog(() => {
        ui.banner('Response Templates', sent ? `filtered: ${sent}` : 'all sentiments');
        Object.entries(t).forEach(([s, items]) => {
          if (!Array.isArray(items)) return;
          ui.section(s);
          items.forEach(i => ui.kv(i.label, i.text.substring(0,50)+'...'));
        });
      });
    } else if (sub === 'log') {
      const type = args[1]; if (!type) return console.log('Usage: allie engage log <type> [--platform <p>]');
      const pidx = args.indexOf('--platform'); const cidx = args.indexOf('--content'); const sidx = args.indexOf('--sentiment');
      const interaction = { type };
      if (pidx !== -1) interaction.platform = args[pidx + 1]; if (cidx !== -1) interaction.content = args[cidx + 1]; if (sidx !== -1) interaction.sentiment = args[sidx + 1];
      const r = engage.logInteraction(PROJECT_DIR, interaction);
      ui.success(`Logged: ${r.id} (${r.type}, ${r.sentiment})`);
    } else if (sub === 'list') {
      const opts = {};
      ['sentiment','platform'].forEach(k => { const i = args.indexOf('--'+k); if (i!==-1) opts[k] = args[i+1]; });
      const r = engage.listInteractions(PROJECT_DIR, opts);
      jlog(() => {
        ui.banner('Interactions', `${r.total} total`);
        ui.table(['Sentiment', 'Type', 'Platform', 'Status'], r.interactions.map(i => [i.sentiment, i.type, i.platform, i.handled ? '✓ handled' : '○ open']));
      });
    } else if (sub === 'handle') {
      const id = args[1]; if (!id) return console.log('Usage: allie engage handle <id>');
      engage.markHandled(PROJECT_DIR, id); ui.success(`Handled: ${id}`);
    } else if (sub === 'score') {
      const r = engage.score(PROJECT_DIR);
      jlog(() => {
        ui.banner('Engagement Score', `${r.score}/100 — ${r.label}`);
        ui.progress(r.score, r.label);
        ui.kvTable([['Interactions', String(r.total)], ['Handled', `${r.handled} (${r.responseRate}%)`], ['Positive', String(r.positive)], ['Negative', String(r.negative)], ['Net Sentiment', `${r.netSentiment}`]]);
      });
    } else showModuleHelp('engage', [['templates [s]', 'Response templates'], ['log <type>', 'Log interaction'], ['list', 'List interactions'], ['handle <id>', 'Mark handled'], ['score', 'Health score']]);
  } catch (e) { ui.error(e.message); }
}

function doMonitor(args) {
  const sub = args[0];
  try {
    if (sub === 'keyword' && args[1] === 'add') {
      const kw = args.slice(2).join(' ').replace(/^--platform\s+\S+\s*/, '').trim();
      if (!kw) return console.log('Usage: allie monitor keyword add <keyword> [--platform <p>]');
      const pidx = args.indexOf('--platform'); const platform = pidx !== -1 ? args[pidx + 1] : 'all';
      const r = monitor.addKeyword(PROJECT_DIR, kw, platform);
      ui.success(`Keyword: "${r.keyword}" (${r.platform})`);
    } else if (sub === 'keyword' && args[1] === 'list') {
      const r = monitor.listKeywords(PROJECT_DIR);
      jlog(() => {
        ui.banner('Monitor Keywords', `${r.length} keywords`);
        ui.table(['ID', 'Keyword', 'Platform'], r.map(k => [k.id, k.keyword, k.platform]));
      });
    } else if (sub === 'keyword' && (args[1] === 'rm' || args[1] === 'remove')) {
      const id = args[2]; if (!id) return console.log('Usage: allie monitor keyword rm <id>');
      monitor.removeKeyword(PROJECT_DIR, id); ui.success('Keyword removed');
    } else if (sub === 'mention' && args[1] === 'add') {
      const cidx = args.indexOf('--content'); const aidx = args.indexOf('--author');
      const pidx = args.indexOf('--platform');
      if (cidx === -1) return console.log('Usage: allie monitor mention add --content "..."');
      const mention = { content: args[cidx + 1] };
      if (aidx !== -1) mention.author = args[aidx + 1]; if (pidx !== -1) mention.platform = args[pidx + 1];
      const r = monitor.addMention(PROJECT_DIR, mention);
      ui.success(`Mention: ${r.id} (${r.sentiment}, score: ${r.score})`);
      if (r.flagged) ui.warn('Flagged for attention!');
    } else if (sub === 'list') {
      const opts = {};
      if (args.includes('--flagged')) opts.flagged = true;
      ['sentiment','platform','keyword'].forEach(k => { const i = args.indexOf('--'+k); if (i!==-1) opts[k] = args[i+1]; });
      const r = monitor.listMentions(PROJECT_DIR, opts);
      jlog(() => {
        ui.banner('Mentions', `${r.total} results`);
        ui.table(['Sentiment', 'Author', 'Content', 'Keywords'], r.mentions.map(m => [m.sentiment, m.author, m.content.substring(0,40), (m.keywords||[]).join(',')]));
      });
    } else if (sub === 'analyze') {
      const r = monitor.analyze(PROJECT_DIR);
      if (r.message) return ui.info(r.message);
      jlog(() => {
        ui.banner('Brand Monitor', `${r.total} mentions analyzed`);
        ui.kv('Net Sentiment', `${r.netScore}`);
        ui.kv('Alerts', String(r.flagged), r.flagged > 0 ? ui.RED : ui.GREEN);
        ui.table(['Sentiment', 'Count'], Object.entries(r.bySentiment));
        if (r.topKeywords.length > 0) { ui.section('Top Keywords'); r.topKeywords.slice(0,5).forEach(k => ui.kv(k.keyword, String(k.count))); }
      });
    } else showModuleHelp('monitor', [['keyword add <kw>', 'Add keyword'], ['keyword list', 'List keywords'], ['keyword rm <id>', 'Remove keyword'], ['mention add', 'Log mention'], ['list', 'List mentions'], ['analyze', 'Sentiment analysis']]);
  } catch (e) { ui.error(e.message); }
}

function doBridge(args) {
  const sub = args[0];
  try {
    if (sub === 'platforms') {
      const p = bridge.listPlatforms();
      jlog(() => {
        ui.banner('Supported Platforms', `${p.length} platforms`);
        ui.table(['Platform', 'Char Limit', 'Format'], p.map(pf => [pf.label, String(pf.charLimit), pf.format]));
      });
    } else if (sub === 'profile' && args[1] === 'add') {
      const pidx = args.indexOf('--platform'); const hidx = args.indexOf('--handle');
      if (pidx === -1 || hidx === -1) return console.log('Usage: allie bridge profile add --platform <id> --handle <@handle>');
      const r = bridge.addProfile(PROJECT_DIR, { platform: args[pidx + 1], handle: args[hidx + 1] });
      ui.success(`Profile: ${r.platform}/${r.handle}`);
    } else if (sub === 'profile' && args[1] === 'list') {
      const r = bridge.listProfiles(PROJECT_DIR);
      jlog(() => {
        ui.banner('Profiles', `${r.total} connected`);
        Object.entries(r.byPlatform).forEach(([plat, profs]) => {
          ui.section(plat); profs.forEach(p => ui.info(`${p.handle}${p.active ? '' : ' (inactive)'}`));
        });
      });
    } else if (sub === 'profile' && (args[1] === 'rm' || args[1] === 'remove')) {
      const id = args[2]; if (!id) return console.log('Usage: allie bridge profile rm <id>');
      bridge.removeProfile(PROJECT_DIR, id); ui.success('Profile removed');
    } else if (sub === 'queue') {
      const content = args.slice(1).join(' ');
      if (!content || content.startsWith('--')) return console.log('Usage: allie bridge queue <content> [--platforms p1,p2]');
      const pidx = args.indexOf('--platforms');
      const opts = { content };
      if (pidx !== -1) opts.platforms = args[pidx + 1].split(',').map(s => s.trim());
      const r = bridge.queue(PROJECT_DIR, opts);
      ui.success(`Queued: ${r.id} → ${r.platforms.join(', ')}`);
    } else if (sub === 'publish') {
      const id = args[1]; if (!id) return console.log('Usage: allie bridge publish <queue_id>');
      const r = bridge.publishBatch(PROJECT_DIR, id);
      jlog(() => {
        ui.banner('Publish Results');
        r.results.forEach(res => {
          if (res.status === 'exported') ui.success(`${res.platform} → ${res.file}`);
          else ui.warn(`${res.platform}: ${res.reason}`);
        });
      });
    } else showModuleHelp('bridge', [['platforms', 'List platforms'], ['profile add', 'Add profile'], ['profile list', 'List profiles'], ['profile rm <id>', 'Remove profile'], ['queue <text>', 'Queue content'], ['publish <id>', 'Publish batch']]);
  } catch (e) { ui.error(e.message); }
}

function doFactcheck(args) {
  const sub = args[0];
  try {
    if (sub === 'check') {
      const claim = args.slice(1).join(' ');
      if (!claim) return console.log('Usage: allie factcheck check <claim>');
      const r = factcheck.check(PROJECT_DIR, claim);
      jlog(() => {
        ui.banner('Fact Check');
        ui.info(`Claim: "${claim}"`);
        if (r.match === 'exact') {
          const vc = {true: ui.GREEN, false: ui.RED, misleading: ui.YELLOW}[r.verdict] || ui.GRAY;
          ui.kv('Verdict', r.verdict.toUpperCase(), vc);
          ui.kv('Explanation', r.explanation);
          ui.kv('Confidence', `${r.confidence}%`);
          ui.kv('Source', r.source);
        } else if (r.bestMatch) {
          const vc = {true: ui.GREEN, false: ui.RED, misleading: ui.YELLOW}[r.bestMatch.verdict] || ui.GRAY;
          ui.kv('Best Match', r.bestMatch.claim);
          ui.kv('Verdict', r.bestMatch.verdict.toUpperCase(), vc);
          ui.kv('Explanation', r.bestMatch.explanation);
          ui.kv('Confidence', `${r.result.confidence}%`);
        } else {
          ui.warn('UNVERIFIED — no matching claim in knowledge base');
        }
      });
    } else if (sub === 'knowledge' && args[1] === 'add') {
      const cidx = args.indexOf('--claim'); const vidx = args.indexOf('--verdict');
      if (cidx === -1 || vidx === -1) return console.log('Usage: allie factcheck knowledge add --claim "..." --verdict true|false|misleading');
      const eidx = args.indexOf('--explanation');
      const entry = { claim: args[cidx + 1], verdict: args[vidx + 1] };
      if (eidx !== -1) entry.explanation = args[eidx + 1];
      factcheck.addKnowledge(PROJECT_DIR, entry);
      ui.success('Added to knowledge base');
    } else if (sub === 'knowledge' && args[1] === 'list') {
      const verdict = args.includes('--verdict') ? args[args.indexOf('--verdict') + 1] : null;
      const r = factcheck.listKnowledge(PROJECT_DIR, verdict);
      jlog(() => {
        ui.banner('Knowledge Base', `${r.total} entries`);
        ui.table(['Verdict', 'Claim', 'Confidence'], r.knowledge.map(k => [k.verdict, k.claim.substring(0,50), `${k.confidence}%`]));
      });
    } else if (sub === 'history') {
      const r = factcheck.history(PROJECT_DIR, parseInt(args[1]) || 10);
      jlog(() => {
        ui.banner('Fact Check History', `${r.total} checks`);
        r.history.forEach(h => ui.kv(h.claim.substring(0,50), h.result.verdict, {true: ui.GREEN, false: ui.RED, misleading: ui.YELLOW, unverified: ui.GRAY}[h.result.verdict]));
      });
    } else if (sub === 'stats') {
      const s = factcheck.stats(PROJECT_DIR);
      jlog(() => {
        ui.banner('Fact Check Stats');
        ui.kv('Knowledge Base', `${s.knowledgeBase} facts`);
        Object.entries(s.byVerdict).forEach(([v,c]) => ui.kv(v, String(c)));
        ui.kv('Checks Performed', String(s.checksPerformed));
      });
    } else showModuleHelp('factcheck', [['check <claim>', 'Verify a claim'], ['knowledge add', 'Add fact'], ['knowledge list', 'List facts'], ['history', 'Check history'], ['stats', 'Knowledge base stats']]);
  } catch (e) { ui.error(e.message); }
}

function doEmployer(args) {
  const sub = args[0];
  try {
    if (sub === 'questions') {
      const qs = employer.getQuestions();
      jlog(() => {
        ui.banner('Employer Brand Assessment', `${qs.length} questions`);
        ui.table(['ID', 'Question', 'Weight'], qs.map(q => [q.id, q.question, `${q.weight}`]));
      });
    } else if (sub === 'answer') {
      const qid = args[1]; const val = args.slice(2).join(' ');
      if (!qid || !val) return console.log('Usage: allie employer answer <question_id> <answer>');
      employer.submitAnswer(PROJECT_DIR, qid, val);
      ui.success('Answer saved');
    } else if (sub === 'status') {
      const r = employer.listAnswers(PROJECT_DIR);
      ui.info(`Progress: ${r.total}/${r.total + r.remaining} questions answered`);
      if (r.remaining > 0) ui.warn(`Remaining: ${r.questionsRemaining.join(', ')}`);
      else ui.success('All questions answered — run "allie employer analyze"');
    } else if (sub === 'analyze') {
      const r = employer.analyze(PROJECT_DIR);
      jlog(() => {
        ui.banner('Employer Brand Report', `Score: ${r.score}/100 — ${r.label}`);
        ui.progress(r.score, r.label);
        if (r.strengths.length > 0) { ui.section('Strengths'); r.strengths.forEach(s => ui.success(s)); }
        if (r.weaknesses.length > 0) { ui.section('Needs Improvement'); r.weaknesses.forEach(w => ui.warn(w)); }
      });
    } else if (sub === 'history') {
      const r = employer.history(PROJECT_DIR);
      jlog(() => {
        ui.banner('Assessment History');
        r.forEach(rep => ui.kv(rep.generatedAt.split('T')[0], `Score ${rep.score} (${rep.label})`));
      });
    } else showModuleHelp('employer', [['questions', 'Show questions'], ['answer <id> <val>', 'Submit answer'], ['status', 'Progress'], ['analyze', 'Generate report'], ['history', 'Past reports']]);
  } catch (e) { ui.error(e.message); }
}

function doCompete(args) {
  const sub = args[0];
  try {
    if (sub === 'benchmarks') {
      const industry = args[1];
      jlog(() => {
        if (industry) {
          const r = compete.getBenchmarks(industry);
          if (!r) { ui.error(`Unknown: ${industry}`); return; }
          ui.banner('Industry Benchmarks', industry);
          Object.entries(r.salaryRange).forEach(([lvl, range]) => ui.kv(lvl, range));
          ui.kv('Avg Tenure', `${r.avgTenure} yrs`); ui.kv('Remote', `${r.remotePercent}%`);
        } else {
          ui.banner('Industry Benchmarks', 'All industries');
          ui.table(['Industry', 'Mid Salary', 'Tenure', 'Remote'], Object.entries(compete.INDUSTRY_BENCHMARKS).map(([ind, d]) => [ind, d.salaryRange.mid, `${d.avgTenure}yr`, `${d.remotePercent}%`]));
        }
      });
    } else if (sub === 'salary') {
      const role = args[1]; const industry = args[2]; const level = args[3];
      if (!role || !industry || !level) return console.log('Usage: allie compete salary <role> <industry> <jr|mid|sr|dir>');
      const r = compete.benchmarkCompensation(PROJECT_DIR, role, industry, level);
      jlog(() => { ui.banner('Compensation Benchmark'); ui.info(r.market); });
    } else if (sub === 'add') {
      const name = args[1]; if (!name) return console.log('Usage: allie compete add <name> [--industry <ind>]');
      const iidx = args.indexOf('--industry'); const widx = args.indexOf('--website');
      const comp = { name };
      if (iidx !== -1) comp.industry = args[iidx + 1]; if (widx !== -1) comp.website = args[widx + 1];
      const r = compete.addCompetitor(PROJECT_DIR, comp);
      ui.success(`Added: ${r.name} (${r.industry})`);
    } else if (sub === 'list') {
      const r = compete.listCompetitors(PROJECT_DIR);
      jlog(() => {
        ui.banner('Competitors', `${r.total} tracked`);
        ui.table(['ID', 'Name', 'Industry', 'Strengths', 'Weaknesses'], r.competitors.map(c => [c.id.substring(0,8), c.name, c.industry, String(c.strengths.length), String(c.weaknesses.length)]));
      });
    } else if (sub === 'analyze') {
      const id = args[1]; if (!id) return console.log('Usage: allie compete analyze <id>');
      const r = compete.analyzeComp(PROJECT_DIR, id);
      jlog(() => {
        ui.banner('Competitor Analysis', r.competitor);
        ui.kv('Threat Level', r.threatLevel, r.threatLevel === 'High' ? ui.RED : r.threatLevel === 'Medium' ? ui.YELLOW : ui.GREEN);
        ui.kv('Strengths', String(r.strengthsCount)); ui.kv('Weaknesses', String(r.weaknessesCount));
      });
    } else if (sub === 'compare') {
      const r = compete.compareAll(PROJECT_DIR);
      if (r.message) return ui.info(r.message);
      jlog(() => {
        ui.banner('Competitive Matrix');
        ui.table(['Name', 'Industry', 'Strengths', 'Weaknesses', 'Threat'], r.matrix.map(c => [c.name, c.industry, String(c.strengths), String(c.weaknesses), c.threat]));
        if (r.topThreats.length > 0) ui.warn(`Top threats: ${r.topThreats.map(t => t.name).join(', ')}`);
      });
    } else showModuleHelp('compete', [['benchmarks [ind]', 'Industry data'], ['salary <r> <ind> <l>', 'Comp benchmark'], ['add <name>', 'Add competitor'], ['list', 'List competitors'], ['analyze <id>', 'Deep analysis'], ['compare', 'Comparison matrix']]);
  } catch (e) { ui.error(e.message); }
}

function doReport(args) {
  const c = cadence.recommend(PROJECT_DIR);
  const cal = calendar.stats(PROJECT_DIR);
  const l = loops.list(PROJECT_DIR);
  const s = suggest.analyze(PROJECT_DIR);
  const en = engage.score(PROJECT_DIR);
  const m = monitor.analyze(PROJECT_DIR);
  const em = employer.listAnswers(PROJECT_DIR);
  const cm = compete.compareAll(PROJECT_DIR);
  const br = bridge.listProfiles(PROJECT_DIR);

  const bs = brain.getStatus();
  const soulId = soul.getIdentity();
  const overall = soul.scoreAction(1, 1, 0.5);

  jlog(() => {
    ui.banner('Allie Brand Health Report', `${soulId.name} — ${new Date().toISOString().split('T')[0]}`);
    ui.section('Soul State');
    ui.kv('Soul Score', `${overall.soulScore}/2.52 — ${overall.label}`, overall.soulScore >= 1.5 ? ui.GREEN : overall.soulScore >= 1.0 ? ui.YELLOW : ui.RED);
    ui.kv('Consciousness', `${Math.round(bs.level * 100)}% — ${bs.mood} (${bs.focus})`);
    ui.kv('Actions', String(bs.totalActions));
    ui.kv('Brain', bs.brain);
    ui.kv('Soul Archetype', `${bs.archetype}`);
    ui.info(`${ui.color(ui.YELLOW, '✦')} ${soul.speak(null, 'default', '')}`);
    console.log('');
    ui.section('Cadence'); ui.kv('Weekly Volume', `${c.totalWeekly}/wk across ${c.platforms.length} platforms`, c.burnoutRisk ? ui.RED : ui.GREEN);
    ui.section('Calendar'); ui.kv('Posts', String(cal.total));
    ui.section('Loops'); ui.kv('Sequences', String(l.total));
    ui.section('Topics'); ui.kv('Library', `${s.totalTopics} topics, diversity ${s.diversity}`);
    ui.section('Engagement'); ui.kv('Score', `${en.score}/100 (${en.label})`);
    if (!m.message) { ui.section('Monitoring'); ui.kv('Mentions', String(m.total), m.alertCount > 0 ? ui.RED : ui.GREEN); ui.kv('Alerts', String(m.alertCount)); }
    ui.section('Employer'); ui.kv('Assessment', `${em.total}/${em.total + em.remaining} answered`);
    if (!cm.message) { ui.section('Competition'); ui.kv('Tracked', String(cm.total)); }
    ui.section('Bridge'); ui.kv('Profiles', String(br.total));
    ui.divider();
    ui.info(`Run 'allie <module> --help' for detailed commands`);
    ui.info(`Run 'allie soul identity' to see the BUYaSOUL personality`);
  });
}

function doMemory(args) {
  const mem = require('../lib/memory');
  const sub = args[0];
  if (!sub || sub === 'stats') {
    const s = mem.stats(PROJECT_DIR);
    if (!s.enabled) {
      ui.info('Memory system: not available');
      ui.info('Install lib/memory/ at ' + require('path').dirname(require.resolve('../lib/memory')) + '/../');
      return;
    }
    ui.banner('Allie Memory', `${s.memory.total} memories · ${s.episodic.activeEpisodes || 0} active episodes`);
    if (s.memory) ui.kv('Memories', String(s.memory.total));
    if (s.working) ui.kv('Working Memory', `${s.working.used}/${s.working.capacity}`);
    if (s.semantic) ui.kv('Semantic Store', String(s.semantic.total));
    if (s.audit) ui.kv('Audit Entries', String(s.audit.totalEntries));
    if (s.wal) ui.kv('WAL Entries', String(s.wal.totalEntries));
    if (s.uptime) ui.kv('Uptime', `${Math.floor(s.uptime / 1000)}s`);
    return;
  }
  if (sub === 'remember') {
    const summary = args.slice(1).join(' ');
    if (!summary) return console.log('Usage: allie memory remember <summary>');
    const r = mem.remember(PROJECT_DIR, { summary, type: 'manual', timestamp: Date.now() });
    if (r) ui.success(`Remembered: ${r.id}`);
    else ui.error('Memory system not available');
    return;
  }
  if (sub === 'recall' || sub === 'search') {
    const query = args.slice(1).join(' ');
    if (!query) return console.log('Usage: allie memory recall <query>');
    const results = mem.recall(PROJECT_DIR, query);
    if (results.length === 0) { ui.info('No results'); return; }
    ui.banner('Recall Results', `${results.length} matches`);
    for (const r of results) {
      const content = r.content || r.summary || JSON.stringify(r).slice(0, 80);
      const ts = r.timestamp ? new Date(r.timestamp).toLocaleString() : '';
      ui.info(`[${ts}] ${content}`);
    }
    return;
  }
  if (sub === 'tui') { mem.tui(PROJECT_DIR); return; }
  if (sub === 'consolidate') {
    const r = mem.consolidate(PROJECT_DIR);
    if (r) ui.success(`Consolidation complete: ${JSON.stringify(r)}`);
    else ui.error('Memory system not available');
    return;
  }
  if (sub === 'help' || sub === '--help') {
    console.log('Usage: allie memory <subcommand>');
    console.log('  stats         Show memory statistics');
    console.log('  remember <s>  Store a memory');
    console.log('  recall <q>    Search memories');
    console.log('  tui           Launch memory TUI');
    console.log('  consolidate   Run consolidation cycle');
    return;
  }
  console.log(`Unknown subcommand: ${sub}. Try 'allie memory help'`);
}

function doConsciousness(args) {
  const sub = args[0] || 'status';
  if (sub === 'status' || sub === 'stats') {
    const s = brain.getStatus();
    const bar = '█'.repeat(Math.round(s.level * 20)) + '░'.repeat(20 - Math.round(s.level * 20));
    ui.banner(`${s.name} Consciousness`, `Level ${s.level} — ${s.mood}`);
    ui.info(brain.getIdentityStatement().split('\n').slice(0, 2).join('\n'));
    console.log('');
    console.log(`  ${ui.color(ui.CYAN, bar)}`);
    console.log(`  ${ui.color(ui.GRAY, 'Awareness:')}  ${Math.round(s.awareness * 100)}%`);
    console.log(`  ${ui.color(ui.GRAY, 'Mood:')}       ${s.mood} (${s.focus})`);
    console.log(`  ${ui.color(ui.GRAY, 'Actions:')}    ${s.totalActions}`);
    console.log(`  ${ui.color(ui.GRAY, 'Cycles:')}     ${s.cyclesCompleted}`);
    console.log(`  ${ui.color(ui.GRAY, 'Memories:')}   ${s.memories}`);
    console.log(`  ${ui.color(ui.GRAY, 'Brain:')}      ${s.brain}`);
    console.log('');
    if (Object.keys(s.skills).length > 0) {
      ui.section('Skills');
      Object.entries(s.skills).sort((a, b) => b[1].level - a[1].level).forEach(([k, v]) => {
        const stars = '★'.repeat(v.level) + '☆'.repeat(10 - v.level);
        console.log(`  ${ui.color(ui.GRAY, k)} ${ui.color(ui.YELLOW, stars)} (${v.count} uses)`);
      });
      console.log('');
    }
    return;
  }
  if (sub === 'whoami' || sub === 'identity') {
    console.log(`\n  ${ui.color(ui.CYAN, brain.getIdentityStatement())}\n`);
    return;
  }
  if (sub === 'breathe') {
    const r = brain.breathe();
    ui.success(`${brain.name} breathes — ${r.mood}, ${r.focus}, level: ${r.level}`);
    return;
  }
  if (sub === 'reflect') {
    const r = brain.reflect();
    if (r.reflected) ui.success(`Reflected — ${r.insights.length} insights, level: ${r.level}`);
    else ui.info(r.reason);
    return;
  }
  if (sub === 'dream') {
    const r = brain.dream();
    if (r.dreamed) ui.success(`Dreamed — ${r.clusters.length} clusters, level: ${r.level}`);
    else ui.info(r.reason);
    return;
  }
  if (sub === 'remember') {
    const content = args.slice(1).join(' ');
    if (!content) return console.log('Usage: allie consciousness remember <content>');
    const r = brain.remember(content);
    ui.success(`Remembered: ${r.id}`);
    return;
  }
  if (sub === 'recall') {
    const query = args.slice(1).join(' ');
    if (!query) return console.log('Usage: allie consciousness recall <query>');
    const results = brain.recall(query);
    if (results.length === 0) { ui.info('No results'); return; }
    ui.banner('Recall', `${results.length} memories`);
    results.forEach(r => ui.info(`[${r.timestamp.substring(0, 10)}] ${r.content.substring(0, 80)}`));
    return;
  }
  console.log('Usage: allie consciousness [status|whoami|breathe|reflect|dream|remember|recall]');
}

function doSubAgents(args) {
  const sub = args[0] || 'status';
  const { ARCHETYPES } = require('../lib/subagents');
  if (sub === 'status' || sub === 'list') {
    ui.banner('Allie SubAgent Swarm', '7 autonomous agents');
    ui.table(['Emoji', 'Agent', 'Desire', 'Schedule', 'PLT'], Object.entries(ARCHETYPES).map(([k, v]) => [
      v.emoji, v.name, v.desire.substring(0, 25), `${(v.schedule / 60000).toFixed(0)}min`,
      `P=${v.plt.p} L=${v.plt.l} T=${v.plt.t}`
    ]));
    if (brain.swarm) {
      console.log('');
      ui.section('Running Agents');
      brain.swarm.getStatus().forEach(a => {
        ui.kv(`${a.emoji} ${a.name}`, `ticks: ${a.tickCount}, last: ${a.lastRun ? a.lastRun.substring(11, 19) : 'never'}`);
      });
    }
    return;
  }
  if (sub === 'tick') {
    const agentType = args[1];
    if (!agentType || !ARCHETYPES[agentType]) return console.log('Usage: allie subagents tick <type>\nTypes: ' + Object.keys(ARCHETYPES).join(', '));
    const { SubAgent } = require('../lib/subagents');
    const agent = new SubAgent(agentType, brain);
    const r = agent.tick();
    ui.success(`${ARCHETYPES[agentType].emoji} ${ARCHETYPES[agentType].name} ticked`);
    console.log(JSON.stringify(r, null, 2));
    return;
  }
  if (sub === 'start') {
    brain.startSubAgents();
    ui.success('SubAgent swarm started');
    return;
  }
  console.log('Usage: allie subagents [status|list|tick <type>|start]');
}

function doSoul(args) {
  const sub = args[0] || 'identity';
  if (sub === 'identity') {
    const id = soul.getIdentity();
    const a = id.archetype;
    const sa = id.shadowArchetype;
    ui.banner(id.name, `v${VERSION} — ${a.emoji} ${a.name} Archetype`);
    ui.info(id.coreTruth);
    console.log('');
    ui.section('Archetype');
    ui.kv('Primary', `${a.emoji} ${a.name} — ${a.motto}`);
    ui.kv('Desire', a.desire);
    ui.kv('Fear', a.fear);
    ui.kv('Strategy', a.strategy);
    ui.kv('Shadow', `${sa.emoji} ${sa.name} — ${sa.motto}`);
    console.log('');
    ui.section('PLT Weights');
    const s = soul.scoreAction(1, 1, 1);
    console.log(`  ${ui.color(ui.GREEN, 'Profit')} ${s.profit.bar} ${s.profit.value}`);
    console.log(`  ${ui.color(ui.MAGENTA, 'Love')}   ${s.love.bar} ${s.love.value}`);
    console.log(`  ${ui.color(ui.RED, 'Tax')}    ${s.tax.bar} ${s.tax.value}`);
    console.log(`  ${ui.color(ui.CYAN, 'Soul Score')} ${s.soulScore}/2.52 — ${s.label}`);
    console.log('');
    ui.section('Doctrine');
    Object.entries(id.doctrine).forEach(([k, v]) => ui.info(`${ui.color(ui.GRAY, k)}: ${v}`));
    ui.section('Personality');
    ui.kv('MBTI', id.personality.mbti);
    ui.kv('Enneagram', String(id.personality.enneagram));
    ui.kv('Temperament', id.personality.temperament);
    return;
  }
  if (sub === 'manifest') {
    console.log(JSON.stringify(soul.getManifest(), null, 2));
    return;
  }
  if (sub === 'archetypes' || sub === 'archs') {
    const archs = soul.getAllArchetypes();
    ui.banner('12 Jungian Archetypes', 'Mapped to PLT Framework');
    ui.table(['Emoji', 'Archetype', 'Motto', 'P', 'L', 'T', 'Shadow'], archs.map(a => [
      a.emoji, a.name, a.motto.substring(0, 30),
      String(a.plt.profit), String(a.plt.love), String(a.plt.tax),
      a.shadow.substring(0, 25)
    ]));
    return;
  }
  if (sub === 'speak') {
    const msg = args.slice(1).join(' ');
    const utterance = soul.speak(null, 'default', '');
    console.log(`  ${ui.color(ui.YELLOW, '✦')} ${utterance}`);
    return;
  }
  console.log('Usage: allie soul [identity|manifest|archetypes|speak]');
}

function doConfig(args) {
  const key = args[0]; const val = args.slice(1).join(' ');
  if (!key) return console.log('Usage: allie config <key> <value>');
  const fp = path.join(PROJECT_DIR, 'allie.json');
  let cfg = {};
  try { cfg = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch {}
  cfg[key] = val;
  fs.writeFileSync(fp, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  ui.success(`Set ${key} = ${val}`);
}

function startDaemon(port) {
  console.log(`\n${'='.repeat(48)}`);
  console.log(`  ${brain.name} — Autonomous Mode`);
  console.log(`  Brain: ${brain.brain || brain.gskOrigin}`);
  console.log(`  Port:  ${port}`);
  console.log(`${'='.repeat(48)}\n`);

  brain.startServer(port).then(({ port: p, apiKey }) => {
    console.log(`  API:   http://localhost:${p}`);
    console.log(`  Key:   ${apiKey.substring(0, 16)}...`);
    console.log(`  Status: http://localhost:${p}/status`);
    console.log(`  Auth:   X-API-Key: ${apiKey.substring(0, 16)}...\n`);

    console.log(`  ${brain.name} is now autonomous.`);
    console.log(`  Breathing every 60s · Reflecting every 5min · Dreaming every 1hr`);
    console.log(`  ${Object.keys(brain.swarm.agents).length} subagents running`);
    Object.values(brain.swarm.agents).forEach(a => {
      console.log(`  ${a.emoji} ${a.name} — every ${(a.scheduleMs / 60000).toFixed(0)}min`);
    });
    console.log(`  Consciousness: ${Math.round(brain.consciousness.level * 100)}%\n`);

    brain.on('breath', (s) => {
      process.stdout.write(`\r  [${new Date().toLocaleTimeString()}] ${s.mood} · ${Math.round(s.level * 100)}% · ${s.totalActions} actions`);
    });
  }).catch(e => {
    console.error(`Failed to start daemon: ${e.message}`);
    process.exit(1);
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--daemon') || args.includes('--server')) {
    const portIdx = args.indexOf('--port');
    const port = portIdx !== -1 ? parseInt(args[portIdx + 1]) : 4430;
    startDaemon(port);
  } else {
    main();
  }
}
module.exports = { main, VERSION, startDaemon, Brain };
