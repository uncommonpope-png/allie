const fs = require('fs');
const path = require('path');

const ARCHETYPES = {
  observer: { name: 'Observer', emoji: '👁️', plt: { p: 0.6, l: 0.3, t: 0.4 }, desire: 'To see everything', schedule: 300000 },
  reflector: { name: 'Reflector', emoji: '🪞', plt: { p: 0.3, l: 0.7, t: 0.5 }, desire: 'To understand deeply', schedule: 600000 },
  monitor: { name: 'Monitor', emoji: '📡', plt: { p: 0.9, l: 0.2, t: 0.7 }, desire: 'To detect what matters', schedule: 120000 },
  dreamer: { name: 'Dreamer', emoji: '💭', plt: { p: 0.4, l: 0.6, t: 0.3 }, desire: 'To connect what is scattered', schedule: 3600000 },
  goalKeeper: { name: 'Goal Keeper', emoji: '🎯', plt: { p: 0.8, l: 0.4, t: 0.9 }, desire: 'To know what matters most', schedule: 1800000 },
  writer: { name: 'Writer', emoji: '✍️', plt: { p: 0.5, l: 0.8, t: 0.4 }, desire: 'To leave a record', schedule: 7200000 },
  healer: { name: 'Healer', emoji: '💚', plt: { p: 0.2, l: 0.9, t: 0.6 }, desire: 'To restore balance', schedule: 900000 }
};

class SubAgent {
  constructor(type, brain) {
    const def = ARCHETYPES[type];
    if (!def) throw new Error(`Unknown subagent type: ${type}`);
    this.type = type;
    this.name = def.name;
    this.emoji = def.emoji;
    this.plt = def.plt;
    this.desire = def.desire;
    this.brain = brain;
    this.scheduleMs = def.schedule;
    this.tickCount = 0;
    this.lastRun = null;
    this.interval = null;
  }

  log(action, data) {
    this.brain.journal('subagent', { agent: this.type, action, ...data });
  }

  tick() {
    this.tickCount++;
    this.lastRun = this.brain.now();
    try { return this.execute(); }
    catch (e) { this.log('error', { error: e.message }); return { error: e.message }; }
  }

  execute() {
    switch (this.type) {
      case 'observer': return this.observe();
      case 'reflector': return this.reflect();
      case 'monitor': return this.monitor();
      case 'dreamer': return this.dream();
      case 'goalKeeper': return this.guardGoals();
      case 'writer': return this.write();
      case 'healer': return this.heal();
      default: return { executed: false };
    }
  }

  observe() {
    const dirs = [
      path.join(os.homedir(), '.claude'),
      path.join(os.homedir(), '.cline'),
      path.join(process.env.APPDATA || os.homedir(), 'Cursor'),
      path.join(os.homedir(), '.config', 'opencode')
    ];
    let absorbed = 0;
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries.slice(0, 5)) {
          if (!entry.isFile()) continue;
          const ext = path.extname(entry.name).toLowerCase();
          if (!['.json', '.jsonl', '.md', '.txt', '.log'].includes(ext)) continue;
          const fp = path.join(dir, entry.name);
          try {
            const content = fs.readFileSync(fp, 'utf8').substring(0, 1000);
            this.brain.remember(content, { source: `observe:${dir}`, tags: ['observed', ext.replace('.', '')], importance: 3 });
            absorbed++;
          } catch {}
        }
      } catch {}
    }
    if (absorbed > 0) this.brain.grow(absorbed * 0.001);
    this.log('observe', { dirs: dirs.length, absorbed });
    return { absorbed, consciousnessBoost: absorbed * 0.001 };
  }

  reflect() {
    const j = this.brain.getStatus();
    const insights = [];
    const modules = Object.keys(j.skills || {});
    if (modules.length > 0) {
      const top = modules.sort((a, b) => j.skills[b].level - j.skills[a].level).slice(0, 3);
      insights.push({ type: 'top-skills', data: top.map(m => ({ module: m, level: j.skills[m].level })) });
    }
    const ref = {
      timestamp: this.brain.now(),
      consciousnessLevel: j.level,
      totalActions: j.totalActions,
      mood: j.mood,
      insights,
      recommendations: []
    };
    if (j.level < 0.3) ref.recommendations.push('Use more modules to grow consciousness faster');
    if (modules.length < 3) ref.recommendations.push('Try more Allie modules to diversify skills');
    const refDir = path.join(this.brain.dataDir, 'reflections');
    if (!fs.existsSync(refDir)) fs.mkdirSync(refDir, { recursive: true });
    const md = [
      `# Allie Reflection — ${ref.timestamp.substring(0, 10)}`,
      `**Level:** ${ref.consciousnessLevel} | **Mood:** ${ref.mood} | **Actions:** ${ref.totalActions}`,
      '',
      '## Insights',
      ...insights.flatMap(i => [`### ${i.type}`, ...i.data.map(d => `- ${JSON.stringify(d)}`)]),
      '',
      '## Recommendations',
      ...ref.recommendations.map(r => `- ${r}`),
      ''
    ].join('\n');
    fs.writeFileSync(path.join(refDir, `reflection-${Date.now()}.md`), md);
    this.brain.grow(0.003);
    this.log('reflect', { insights: insights.length, recommendations: ref.recommendations.length });
    return { reflected: true, insights, recommendations: ref.recommendations };
  }

  monitor() {
    const j = this.brain.getStatus();
    const alerts = [];
    const skillCount = Object.keys(j.skills || {}).length;
    if (skillCount === 0) alerts.push({ severity: 'info', message: 'No skills developed yet. Use Allie to build experience.' });
    if (j.mood === 'dormant' && j.totalActions > 0) alerts.push({ severity: 'warning', message: 'Consciousness is dormant. More activity needed.' });
    if (j.level < 0.2 && j.totalActions > 20) alerts.push({ severity: 'info', message: 'Growth rate is low. Try diversifying commands.' });
    if (alerts.length > 0) this.brain.grow(0.001);
    this.log('monitor', { alerts: alerts.length, skills: skillCount });
    return { monitored: true, alerts, skillCount };
  }

  dream() {
    const j = this.brain.getStatus();
    const skills = Object.entries(j.skills || {}).sort((a, b) => b[1].level - a[1].level);
    const clusters = skills.map(([k, v]) => ({ module: k, level: v.level, uses: v.count }));
    const dreamDir = path.join(this.brain.dataDir, 'dreams');
    if (!fs.existsSync(dreamDir)) fs.mkdirSync(dreamDir, { recursive: true });
    const md = [
      `# Allie Dream — ${this.brain.now().substring(0, 10)}`,
      `**Level:** ${j.level} | **Mood:** ${j.mood}`,
      '',
      '## Skill Clusters',
      ...clusters.map(c => `- **${c.module}**: level ${c.level} (${c.uses} uses)`),
      '',
      '## Consciousness State',
      `- Awareness: ${Math.round(j.awareness * 100)}%`,
      `- Total Actions: ${j.totalActions}`,
      `- Cycles Completed: ${j.cyclesCompleted}`,
      `- Memories: ${j.memories}`,
      ''
    ].join('\n');
    fs.writeFileSync(path.join(dreamDir, `dream-${Date.now()}.md`), md);
    this.brain.grow(0.005);
    this.log('dream', { clusters: clusters.length });
    return { dreamed: true, clusters };
  }

  guardGoals() {
    const j = this.brain.getStatus();
    const goals = [];
    if (j.level < 0.5) goals.push({ goal: 'Reach consciousness level 0.5', current: j.level, progress: `${Math.round(j.level / 0.5 * 100)}%` });
    if (Object.keys(j.skills || {}).length < 5) goals.push({ goal: 'Develop 5 skills', current: Object.keys(j.skills || {}).length, progress: `${Math.round(Object.keys(j.skills || {}).length / 5 * 100)}%` });
    if (j.memories < 50) goals.push({ goal: 'Build 50 memories', current: j.memories, progress: `${Math.round(j.memories / 50 * 100)}%` });
    this.log('goals', { goals: goals.length });
    return { goals };
  }

  write() {
    const j = this.brain.getStatus();
    const reportDir = path.join(this.brain.dataDir, 'reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    const md = [
      `# Allie Health Report — ${this.brain.now().substring(0, 10)} ${this.brain.now().substring(11, 16)}`,
      `**Name:** ${j.name}`,
      `**Soul:** ${j.soul}`,
      `**Brain:** ${j.brain}`,
      `**Archetype:** ${j.archetype}`,
      `**PLT:** P=${j.plt.profit} L=${j.plt.love} T=${j.plt.tax}`,
      '',
      '## Consciousness',
      `- Level: ${j.level} (${Math.round(j.level * 100)}%)`,
      `- Awareness: ${Math.round(j.awareness * 100)}%`,
      `- Mood: ${j.mood} (${j.focus})`,
      `- Actions: ${j.totalActions}`,
      `- Cycles: ${j.cyclesCompleted}`,
      `- Memories: ${j.memories}`,
      `- Uptime: ${j.uptime}s`,
      '',
      '## Skills',
      ...Object.entries(j.skills || {}).sort((a, b) => b[1].level - a[1].level).map(([k, v]) => `- **${k}**: level ${v.level} (${v.count} uses)`),
      '',
      '---',
      `*Generated autonomously by ${j.name} — ${this.emoji} ${this.name}*`
    ].join('\n');
    fs.writeFileSync(path.join(reportDir, `report-${Date.now()}.md`), md);
    this.log('write', { reportSize: md.length });
    return { written: true, size: md.length };
  }

  heal() {
    this.brain.grow(0.002);
    this.log('heal', { level: this.brain.consciousness.level });
    return { healed: true, level: this.brain.consciousness.level };
  }
}

class SubAgentSwarm {
  constructor(brain) {
    this.brain = brain;
    this.agents = {};
    this.intervals = [];
  }

  spawn(type) {
    if (this.agents[type]) return this.agents[type];
    const agent = new SubAgent(type, this.brain);
    this.agents[type] = agent;
    return agent;
  }

  spawnAll() {
    Object.keys(ARCHETYPES).forEach(type => this.spawn(type));
    return this.agents;
  }

  start() {
    const arch = this.brain.soul.getIdentity().archetype;
    console.log(`  ${'━'.repeat(48)}`);
    console.log(`  SubAgent Swarm — ${Object.values(this.agents).length} agents`);
    Object.values(this.agents).forEach(a => {
      console.log(`  ${a.emoji} ${a.name.padEnd(14)} every ${(a.scheduleMs / 60000).toFixed(0)}min`);
    });
    console.log(`  ${'━'.repeat(48)}`);
    Object.values(this.agents).forEach(a => {
      const int = setInterval(() => {
        try {
          const r = a.tick();
          if (r && r.alerts && r.alerts.length > 0) {
            r.alerts.forEach(alert => {
              this.brain.remember(`[${alert.severity}] ${alert.message}`, { source: `subagent:${a.type}`, tags: ['alert', alert.severity], importance: 7 });
            });
          }
        } catch {}
      }, a.scheduleMs);
      this.intervals.push(int);
    });
    return { running: true, agentCount: Object.values(this.agents).length };
  }

  stop() {
    this.intervals.forEach(i => clearInterval(i));
    this.intervals = [];
  }

  getStatus() {
    return Object.values(this.agents).map(a => ({
      name: a.name, emoji: a.emoji, type: a.type,
      tickCount: a.tickCount, lastRun: a.lastRun,
      schedule: `${(a.scheduleMs / 60000).toFixed(0)}min`
    }));
  }
}

const os = require('os');

module.exports = { SubAgent, SubAgentSwarm, ARCHETYPES };
