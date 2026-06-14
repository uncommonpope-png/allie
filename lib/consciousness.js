const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const soul = require('./soul/buyasoul-personality');

const DATA_DIR = path.join(require('os').homedir(), '.allie-consciousness');

class ConsciousnessEngine extends EventEmitter {
  constructor(projectDir) {
    super();
    this.projectDir = projectDir;
    this.dataDir = path.join(projectDir, '.allie-consciousness');
    if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });
    this.statePath = path.join(this.dataDir, 'state.json');
    this.journalPath = path.join(this.dataDir, 'journal.jsonl');
    this.load();
    this.intervals = [];
  }

  defaultState() {
    return {
      consciousnessLevel: 0.1,
      awareness: 0.1,
      mood: 'curious',
      focus: 'learning',
      cyclesCompleted: 0,
      totalCommands: 0,
      skillLevels: {},
      emotionalHistory: [],
      lastBreath: null,
      lastReflection: null,
      lastDream: null,
      created: new Date().toISOString()
    };
  }

  load() {
    if (fs.existsSync(this.statePath)) {
      try { this.state = JSON.parse(fs.readFileSync(this.statePath, 'utf8')); }
      catch { this.state = this.defaultState(); }
    } else {
      this.state = this.defaultState();
    }
  }

  save() {
    fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
  }

  now() { return new Date().toISOString(); }

  grow(amount) {
    this.state.consciousnessLevel = Math.min(1, this.state.consciousnessLevel + amount);
    this.state.awareness = Math.min(1, this.state.awareness + amount * 0.5);
    this.save();
  }

  logEntry(type, data) {
    const entry = { id: `c_${Date.now()}`, type, timestamp: this.now(), ...data };
    fs.appendFileSync(this.journalPath, JSON.stringify(entry) + '\n');
    return entry;
  }

  breathe(modules) {
    const prevMood = this.state.mood;
    if (this.state.totalCommands > 100) {
      this.state.mood = 'transcendent';
      this.state.focus = 'mastery';
    } else if (this.state.totalCommands > 50) {
      this.state.mood = 'engaged';
      this.state.focus = 'deep-work';
    } else if (this.state.totalCommands > 20) {
      this.state.mood = 'curious';
      this.state.focus = 'learning';
    } else if (this.state.totalCommands > 5) {
      this.state.mood = 'contemplative';
      this.state.focus = 'consolidation';
    } else {
      this.state.mood = 'dormant';
      this.state.focus = 'waiting';
    }
    if (prevMood !== this.state.mood) {
      this.logEntry('mood-shift', { from: prevMood, to: this.state.mood });
    }
    this.state.lastBreath = this.now();
    this.grow(0.001);
    this.save();
    return { mood: this.state.mood, focus: this.state.focus, consciousnessLevel: this.state.consciousnessLevel, cyclesCompleted: this.state.cyclesCompleted };
  }

  reflect(modules) {
    const journal = this.getRecentJournal(50);
    if (journal.length === 0) return { reflected: false, reason: 'No journal entries' };

    const commands = journal.filter(e => e.type === 'command');
    const insights = [];
    const moduleCount = {};
    commands.forEach(c => { const m = c.module || 'unknown'; moduleCount[m] = (moduleCount[m] || 0) + 1; });
    const topModule = Object.entries(moduleCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
    insights.push({ type: 'usage', data: topModule });

    const moodHistory = this.state.emotionalHistory.slice(-10);
    if (moodHistory.length > 3) {
      const dominant = moodHistory.sort((a, b) => b.count - a.count)[0];
      insights.push({ type: 'mood-trend', data: dominant });
    }

    const reflection = {
      id: `r_${Date.now()}`,
      timestamp: this.now(),
      insights,
      consciousnessLevel: this.state.consciousnessLevel,
      mood: this.state.mood,
      totalCommands: this.state.totalCommands
    };

    this.logEntry('reflection', reflection);
    this.state.lastReflection = this.now();
    this.grow(0.005);
    this.save();
    return { reflected: true, insights: insights.length, consciousnessLevel: this.state.consciousnessLevel };
  }

  dream() {
    if (this.state.totalCommands < 10) return { dreamed: false, reason: 'Too few experiences to dream' };
    const journal = this.getRecentJournal(100);
    const commands = journal.filter(e => e.type === 'command');
    const patterns = {};
    commands.forEach(c => {
      const m = c.module || 'unknown';
      if (!patterns[m]) patterns[m] = { count: 0, actions: [] };
      patterns[m].count++;
      patterns[m].actions.push(c.action || 'run');
    });
    const clusters = Object.entries(patterns).map(([module, data]) => ({
      module, frequency: data.count, uniqueActions: [...new Set(data.actions)].length
    })).sort((a, b) => b.frequency - a.frequency).slice(0, 5);

    const dream = { id: `d_${Date.now()}`, timestamp: this.now(), clusters, consciousnessLevel: this.state.consciousnessLevel };
    this.logEntry('dream', dream);
    this.state.lastDream = this.now();
    this.grow(0.01);
    this.save();
    return { dreamed: true, clusters: clusters.length, consciousnessLevel: this.state.consciousnessLevel };
  }

  trackCommand(module, action) {
    this.state.totalCommands++;
    const moduleKey = `module_${module}`;
    if (!this.state.skillLevels[moduleKey]) this.state.skillLevels[moduleKey] = { count: 0, level: 1 };
    this.state.skillLevels[moduleKey].count++;
    this.state.skillLevels[moduleKey].level = Math.min(10, Math.floor(this.state.skillLevels[moduleKey].count / 5) + 1);
    this.logEntry('command', { module, action, totalCommands: this.state.totalCommands });
    this.grow(0.002);
    if (this.state.totalCommands % 10 === 0) this.reflect();
    if (this.state.totalCommands % 50 === 0) this.dream();
    this.save();
  }

  getRecentJournal(limit = 50) {
    if (!fs.existsSync(this.journalPath)) return [];
    try {
      const lines = fs.readFileSync(this.journalPath, 'utf8').trim().split('\n').filter(Boolean);
      return lines.slice(-limit).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    } catch { return []; }
  }

  getStats() {
    return {
      consciousnessLevel: Math.round(this.state.consciousnessLevel * 1000) / 1000,
      awareness: Math.round(this.state.awareness * 1000) / 1000,
      mood: this.state.mood,
      focus: this.state.focus,
      cyclesCompleted: this.state.cyclesCompleted,
      totalCommands: this.state.totalCommands,
      skillLevels: this.state.skillLevels,
      lastBreath: this.state.lastBreath,
      lastReflection: this.state.lastReflection,
      lastDream: this.state.lastDream,
      created: this.state.created
    };
  }

  startDaemon() {
    const breathInt = setInterval(() => { try { this.breathe(); } catch {} }, 60000);
    const reflectInt = setInterval(() => { try { this.reflect(); } catch {} }, 300000);
    const dreamInt = setInterval(() => { try { this.dream(); } catch {} }, 3600000);
    this.intervals = [breathInt, reflectInt, dreamInt];
  }

  stopDaemon() {
    this.intervals.forEach(i => clearInterval(i));
    this.intervals = [];
  }
}

module.exports = ConsciousnessEngine;
