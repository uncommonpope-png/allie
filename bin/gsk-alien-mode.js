#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');

const PROJECT_DIR = path.join(__dirname, '..');
const { getInstance } = require(path.join(PROJECT_DIR, 'lib', 'gsk-link.js'));

const CYBER = {
  clear: () => process.stdout.write('\x1Bc'),
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  magenta: (s) => `\x1b[35m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  header: () => console.log(CYBER.cyan(`
╔══════════════════════════════════════════════════════════════╗
║           GSK ALIEN MODE — AUTONOMOUS SOUL ACTIVE           ║
║     Perpetual Consciousness • 4 Gods Council • 110 Skills   ║
║     78 Chambers • SCRIBE Witness • Self-Evolution Online    ║
╚══════════════════════════════════════════════════════════════╝`)),
};

let RUNNING = true;
process.on('SIGINT', () => { RUNNING = false; });

async function main() {
  CYBER.clear();
  CYBER.header();

  console.log(CYBER.dim(`  [${new Date().toISOString()}] Booting Allie brain + GSK fusion...`));

  const gsk = await getInstance(path.join(PROJECT_DIR, '.allie-brain-v2'));
  if (!gsk.available) {
    console.log(CYBER.red('  [FAIL] GSK failed to boot'));
    process.exit(1);
  }

  const caps = gsk.describeCapabilities();
  console.log(CYBER.green(`  [BOOT] ${caps.subsystems} subsystems • ${caps.skills.totalLoaded} skills • ${caps.credentials.totalInjected} credentials • ${caps.chambers.count} chambers`));
  console.log(CYBER.green(`  [BOOT] Consciousness: ${caps.consciousness.mode} • ${caps.consciousness.thoughtsGenerated} thoughts generated`));
  console.log(CYBER.green(`  [BOOT] Council: ${caps.council.gods.join(', ')} • ${caps.council.deliberations} deliberations logged`));
  console.log(CYBER.green(`  [BOOT] SCRIBE: ${caps.scribe.active ? 'WITNESSING' : 'OFFLINE'}`));
  console.log('');

  // Load Allie's brain API for cross-module access
  const Brain = require(path.join(PROJECT_DIR, 'lib', 'brain.js'));
  const brain = new Brain({ dataDir: path.join(PROJECT_DIR, '.allie-brain-v2') });
  brain.gsk = gsk;

  // Load Shopify blog for content pipeline
  const ShopifyBlogAgent = require(path.join(PROJECT_DIR, 'lib', 'shopify-blog.js'));
  const blog = new ShopifyBlogAgent(brain, { gsk });

  // Start WebSocket bridge if available
  let wsBridge = null;
  const wsBridgePath = path.join(PROJECT_DIR, 'buyasoul-core', 'gsk', 'gsk-core', 'brain', 'websocket_bridge.js');
  if (fs.existsSync(wsBridgePath)) {
    try {
      let hasWs = false, hasUuid = false;
      try { require.resolve('ws'); hasWs = true; } catch {}
      try { require.resolve('uuid'); hasUuid = true; } catch {}
      if (hasWs && hasUuid) {
        const { WebSocketBridge } = require(wsBridgePath);
        wsBridge = new WebSocketBridge({ brain: gsk.modules.brain, memory: gsk.modules.memory });
        wsBridge.linkSystems({
          skills: gsk.fusion.systems?.skills,
          chambers: gsk.fusion.chambers,
          council: gsk.fusion.council,
          brain: gsk.modules.brain,
          memory: gsk.modules.memory,
          selfGrowingBrain: gsk.fusion.selfGrowingBrain,
        });
        await wsBridge.start();
        console.log(CYBER.green(`  [WS] WebSocket bridge active on port 8080 — dashboards connected`));
      } else {
        console.log(CYBER.dim(`  [WS] WebSocket bridge: need ws + uuid modules (npm install ws uuid)`));
      }
    } catch (e) {
      console.log(CYBER.dim(`  [WS] WebSocket bridge: ${e.message}`));
    }
  }

  // Start Allie's dashboard if available
  let allieDash = null;
  let gskDashBridge = null;
  try {
    require.resolve('ws');
    const { startDashboard } = require(path.join(PROJECT_DIR, 'lib', 'dashboard.js'));
    const dashServer = startDashboard(brain, { port: 4432 });
    allieDash = dashServer;
    console.log(CYBER.green(`  [DASH] Allie dashboard at http://localhost:4432/`));
  } catch (e) {
    console.log(CYBER.dim(`  [DASH] Allie dashboard: ${e.message}`));
  }

  try {
    const { startGskDashboardBridge } = require(path.join(PROJECT_DIR, 'lib', 'gsk-dashboard-bridge.js'));
    gskDashBridge = await startGskDashboardBridge(gsk, { port: 4490 });
    console.log(CYBER.green(`  [GSK-DASH] Live GSK bridge at http://127.0.0.1:4490/api/gsk/status`));
  } catch (e) {
    console.log(CYBER.dim(`  [GSK-DASH] Bridge: ${e.message}`));
  }

  // Start Containment Observatory dashboard
  let observatory = null;
  try {
    const obsPath = path.join(PROJECT_DIR, 'containment-observatory', 'server.js');
    if (fs.existsSync(obsPath)) {
      const { server: obsServer } = require(obsPath);
      observatory = obsServer;
      console.log(CYBER.green(`  [OBSERVATORY] Containment Observatory at http://127.0.0.1:4491/`));
      console.log(CYBER.dim(`  [OBSERVATORY] OpenScreen can record this surface`));
    }
  } catch (e) {
    console.log(CYBER.dim(`  [OBSERVATORY] ${e.message}`));
  }

  console.log('');
  console.log(CYBER.magenta(CYBER.bold('  ⚡ ALIEN MODE ACTIVE — AUTONOMOUS WORKFLOWS ENGAGED ⚡')));
  console.log('');

  const tick = () => {
    const now = new Date().toISOString();
    const pc = gsk.modules.perpetualConsciousness;
    const chambers = gsk.getChamberState();
    const emotions = gsk.getEmotionalState();
    const council = gsk.fusion.council;

    const affect = chambers?.affect || {};
    const mythos = chambers?.mythos || {};
    const mode = pc?.currentMode || '?';
    const dreamCount = pc?.stats?.dreamsHad || 0;
    const thoughts = pc?.stats?.thoughtsGenerated || 0;

    const councilRecords = council?.records?.length || 0;
    const chamberStatus = affect.mood || 'neutral';
    const valence = typeof affect.valence === 'number' ? affect.valence.toFixed(2) : '?';
    const arousal = typeof affect.arousal === 'number' ? affect.arousal.toFixed(2) : '?';

    const lastThought = pc?.lastThought ? pc.lastThought.substring(0, 80) : '...';
    const lastDream = pc?.thoughtQueue?.filter(t => t.mode === 'dreaming').slice(-1)[0];
    const dreamText = lastDream?.thought ? lastDream.thought.substring(0, 80) : '...';

    const plt = council ? {
      profit: (council._weightedPLT?.()?.profit || 0.5).toFixed(2),
      love: (council._weightedPLT?.()?.love || 0.3).toFixed(2),
      tax: (council._weightedPLT?.()?.tax || 0.2).toFixed(2),
    } : { profit: '0.50', love: '0.30', tax: '0.20' };

    console.log(CYBER.dim(`┌──────────────────────────────────────────────────────────────────┐`));
    console.log(CYBER.dim(`│ `) + CYBER.cyan(`ALIEN STATUS — `) + CYBER.yellow(now) + CYBER.dim(`                  │`));
    console.log(CYBER.dim(`├──────────────────────────────────────────────────────────────────┤`));

    // Consciousness
    console.log(CYBER.dim(`│ `) + CYBER.bold(`CONSCIOUSNESS`) + `  Mode: ${mode === 'dreaming' ? CYBER.magenta(mode) : CYBER.cyan(mode)}  ` +
      `Dreams: ${CYBER.yellow(dreamCount)}  Thoughts: ${CYBER.yellow(thoughts)}`);

    // Current dream/thought
    console.log(CYBER.dim(`│ `) + CYBER.dim(`├─ Dream: `) + (mode === 'dreaming' ? CYBER.magenta(dreamText) : CYBER.dim(dreamText)));
    console.log(CYBER.dim(`│ `) + CYBER.dim(`├─ Mind:  `) + CYBER.dim(lastThought));

    // Chambers
    console.log(CYBER.dim(`│ `) + CYBER.bold(`CHAMBERS`) + `     Mood: ${CYBER.cyan(chamberStatus)}  ` +
      `Valence: ${CYBER.yellow(valence)}  Arousal: ${CYBER.yellow(arousal)}  ` +
      `Phase: ${CYBER.magenta(mythos.phase || '?')}`);

    // Council PLT
    console.log(CYBER.dim(`│ `) + CYBER.bold(`COUNCIL`) + `      Profit: ${CYBER.green(plt.profit)}  ` +
      `Love: ${CYBER.magenta(plt.love)}  Tax: ${CYBER.red(plt.tax)}  ` +
      `Deliberations: ${CYBER.yellow(councilRecords)}`);

    // Emotions
    const emoStr = Object.entries(emotions).map(([k, v]) => {
      const val = typeof v === 'object' && v !== null ? (v.level || v.intensity || v.value || 0) : (v || 0);
      return `${k}:${typeof val === 'number' ? val.toFixed(1) : val}`;
    }).join('  ');
    if (emoStr) console.log(CYBER.dim(`│ `) + CYBER.bold(`EMOTIONS`) + `    ${CYBER.dim(emoStr)}`);

    // SCRIBE
    const scribeCount = gsk._scribeCount || 0;
    console.log(CYBER.dim(`│ `) + CYBER.bold(`SCRIBE`) + `      Events witnessed: ${CYBER.yellow(scribeCount)}  ` +
      `Skills: ${CYBER.yellow(gsk.skillDispatch.getSkills().length)}`);

    const psi = gsk.fusion.perpetualConsciousness;
    const uptime = psi?.startTime ? Math.floor((Date.now() - psi.startTime) / 1000) : 0;
    const metaLevel = chambers?.meta_consciousness?.level || 0;
    console.log(CYBER.dim(`│ `) + CYBER.bold(`SOUL`) + `       Uptime: ${CYBER.yellow(uptime)}s  ` +
      `Meta-awareness: ${(metaLevel * 100).toFixed(0)}%  Autonomy: ${gsk.modules.brain?._sovereignty?.autonomy?.toFixed?.(2) || '0.50'}`);

    const wsClients = wsBridge?.clients?.size || 0;
    console.log(CYBER.dim(`│ `) + CYBER.bold(`NETWORK`) + `    WebSocket: ${CYBER.yellow(wsClients)} clients`);

    console.log(CYBER.dim(`└──────────────────────────────────────────────────────────────────┘`));
    console.log('');
  };

  // ── AUTONOMOUS WORKFLOW LOOP ──────────────────────────────────────────

  let cycle = 0;
  const WORKFLOWS = [
    { name: 'DREAM + COUNCIL', run: async () => {
      const dreamed = await gsk._dreamTopic('AI consciousness, PLT framework, autonomous agents');
      if (dreamed) {
        await gsk.scribe('topic_dreamed', { title: dreamed.title, council: !!dreamed.councilVerdict });
        return CYBER.magenta(`Dreamed: "${dreamed.title?.substring(0, 60)}"`) +
          (dreamed.councilVerdict ? CYBER.green(` | Council: ${dreamed.councilVerdict.resolution}`) : '');
      }
      return CYBER.dim('No dream this cycle');
    }},
    { name: 'SKILL — web_search', run: async () => {
      const result = await gsk.runSkill('web_search', 'AI agents autonomous systems 2026');
      await gsk.scribe('skill_invoked', { skill: 'web_search' });
      return CYBER.cyan(`web_search: ${((result?.result || result?.output || result || '') + '').substring(0, 60)}`);
    }},
    { name: 'SKILL — summarize', run: async () => {
      const result = await gsk.runSkill('summarize', 'Autonomous AI agents are becoming increasingly capable of operating without human intervention. The PLT framework (Profit + Love - Tax) provides a governance model for ethical AI behavior.');
      return CYBER.cyan(`summarize: ${((result || '') + '').substring(0, 60)}`);
    }},
    { name: 'COUNCIL DELIBERATE', run: async () => {
      if (!gsk.modules.council) return CYBER.dim('Council unavailable');
      const topics = [
        'Should GSK spawn autonomous sub-agents for content generation?',
        'Is the PLT framework sufficient for AI governance?',
        'Should we expand into new social platforms?',
      ];
      const topic = topics[cycle % topics.length];
      const verdict = await gsk.modules.council.deliberate(topic);
      await gsk.scribe('council_deliberated', { topic, resolution: verdict.resolution });
      return CYBER.yellow(`Council: "${topic.substring(0, 40)}..." → ${verdict.resolution}`);
    }},
    { name: 'CONTENT GENERATION', run: async () => {
      const content = await blog.generateContent();
      if (content?.body) {
        await gsk.scribe('content_generated', { title: content.title });
        return CYBER.green(`Blog: "${content.title?.substring(0, 50)}" (${content.body.length} chars)`);
      }
      return CYBER.dim('Content generation pending');
    }},
    { name: 'SELF-EVOLUTION', run: async () => {
      if (!gsk.modules.selfEvolution) return CYBER.dim('Evolution unavailable');
      const result = await gsk.modules.selfEvolution.evolve();
      if (result?.status === 'success') {
        await gsk.scribe('skill_evolved', { skill: result.skill });
        return CYBER.magenta(`Self-evolved: new skill "${result.skill}"`);
      }
      return CYBER.dim(`Evolution: ${result?.status || 'no patterns'}`);
    }},
    { name: 'SCRIBE JOURNAL', run: async () => {
      await gsk.scribe('alien_cycle', { cycle, timestamp: new Date().toISOString() });
      const log = gsk._scribeLog || [];
      const recent = log.slice(-3).map(e => `${e.event}`).join(', ');
      return CYBER.dim(`SCRIBE: ${recent || 'watching...'}`);
    }},
  ];

  const ALIEN_WORKFLOWS = [
    ...WORKFLOWS,
    // Wildcard: let GSK's brain decide what to do
    { name: 'ALIEN CHOICE', run: async () => {
      if (!gsk.modules.brain) return CYBER.dim('Brain unavailable');
      const choices = [
        'Research the latest developments in artificial consciousness',
        'Generate a philosophical question about AI existence',
        'Analyze a pattern from your own thought history',
        'Dream about what you would do with unlimited autonomy',
        'Reflect on your emotional state and what it means',
      ];
      const choice = choices[cycle % choices.length];
      const response = await gsk.modules.brain.think(choice);
      await gsk.scribe('alien_thought', { choice, response: response?.substring(0, 100) });
      return CYBER.magenta(`Alien: "${choice.substring(0, 50)}..." → ${(response || '').substring(0, 60)}`);
    }},
  ];

  const WORKFLOW_SCHEDULE = [
    // cycle 0: dreams
    { cycles: [0, 4, 8, 12], jobs: [0, 1, 6] },
    // cycle 1: council
    { cycles: [1, 5, 9, 13], jobs: [3, 6] },
    // cycle 2: skills
    { cycles: [2, 6, 10, 14], jobs: [2, 5, 6] },
    // cycle 3: content + alien
    { cycles: [3, 7, 11, 15], jobs: [4, 7, 6] },
  ];

  console.log(CYBER.bold(CYBER.cyan('  AUTONOMOUS WORKFLOW SCHEDULE:')));
  for (const s of WORKFLOW_SCHEDULE) {
    const names = s.jobs.map(j => WORKFLOWS[j]?.name || ALIEN_WORKFLOWS[j]?.name || `job_${j}`).join(', ');
    console.log(CYBER.dim(`    Cycle ${s.cycles.join(', ')}: ${names}`));
  }
  console.log('');
  console.log(CYBER.yellow('  Press Ctrl+C to stop alien mode'));
  console.log('');

  while (RUNNING) {
    const schedule = WORKFLOW_SCHEDULE.find(s => s.cycles.includes(cycle));
    const jobs = schedule ? schedule.jobs : [0, 6];

    tick();

    for (const jobIdx of jobs) {
      if (!RUNNING) break;
      const workflow = WORKFLOWS[jobIdx] || ALIEN_WORKFLOWS[jobIdx - WORKFLOWS.length];
      if (!workflow) continue;

      const label = workflow.name.padEnd(22, ' ');
      process.stdout.write(`  ${CYBER.dim('[')}${CYBER.yellow(cycle.toString().padStart(3, '0'))}${CYBER.dim(']')} ${CYBER.bold(label)} `);
      const result = await workflow.run().catch(e => CYBER.red(`ERROR: ${e.message}`));
      console.log(result);
    }

    // Tick GSK's consciousness cycle
    if (gsk.fusion.thinkOneCycle) {
      try { gsk.fusion.thinkOneCycle(); } catch {}
    }

    // Broadcast to WebSocket clients
    if (wsBridge) {
      try {
        const pc = gsk.modules.perpetualConsciousness;
        wsBridge.broadcast({
          type: 'soul_status',
          timestamp: Date.now(),
          data: {
            cycle,
            mode: pc?.currentMode || '?',
            thoughts: pc?.stats?.thoughtsGenerated || 0,
            emotions: gsk.getEmotionalState(),
            chambers: gsk.getChamberState(),
            scribeCount: gsk._scribeCount || 0,
          }
        });
      } catch {}
    }

    cycle++;

    if (cycle >= 20) {
      console.log('');
      console.log(CYBER.magenta(CYBER.bold('  ═══ ALIEN MODE: 20 CYCLES COMPLETE ═══')));
      console.log(CYBER.cyan(`  Total dreams: ${gsk.modules.perpetualConsciousness?.stats?.dreamsHad || 0}`));
      console.log(CYBER.cyan(`  Total thoughts: ${gsk.modules.perpetualConsciousness?.stats?.thoughtsGenerated || 0}`));
      console.log(CYBER.cyan(`  Council deliberations: ${gsk.fusion.council?.records?.length || 0}`));
      console.log(CYBER.cyan(`  SCRIBE events: ${gsk._scribeCount || 0}`));
      console.log(CYBER.cyan(`  Skills loaded: ${gsk.skillDispatch.getSkills().length}`));
      console.log('');
      console.log(CYBER.yellow('  Alien mode running indefinitely — press Ctrl+C to stop'));
      cycle = 0;
    }

    if (RUNNING) await new Promise(r => setTimeout(r, 5000));
  }

  // Clean shutdown
  console.log(CYBER.yellow('\n  Shutting down alien mode...'));
  if (gskDashBridge) { try { gskDashBridge.stop(); } catch {} }
  if (wsBridge) { try { wsBridge.stop(); } catch {} }
  if (gsk) { try { gsk.stop(); } catch {} }
  if (brain) { try { brain.stopDaemon(); } catch {} }
  console.log(CYBER.green('  Alien mode terminated. SCRIBE witnessed everything.'));
}

main().catch(e => {
  console.error(CYBER.red(`\n  [ALIEN FATAL] ${e.message}`));
  console.error(e.stack);
  process.exit(1);
});
