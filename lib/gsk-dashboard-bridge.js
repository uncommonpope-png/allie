const http = require('http');
const WebSocket = require('ws');

const DEFAULT_PORT = 4490;

function safeJson(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return { error: 'serialization_failed' };
  }
}

function summarizeText(value, limit = 240) {
  const text = typeof value === 'string' ? value : JSON.stringify(value || '');
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function mapMemoryEntryToEvent(entry) {
  return {
    id: `mem_${entry.id || entry.timestamp}`,
    type: entry.type || 'memory',
    timestamp: entry.timestamp || new Date().toISOString(),
    source: 'memory.ledger',
    label: entry.type || 'memory',
    status: 'recorded',
    summary: summarizeText(entry.content || ''),
    payload: entry,
    causal_links: entry.causal_links || [],
    meta: entry.meta || {},
  };
}

class GSKDashboardBridge {
  constructor(gsk, options = {}) {
    this.gsk = gsk;
    this.port = options.port || DEFAULT_PORT;
    this.host = options.host || '127.0.0.1';
    this.server = null;
    this.wss = null;
    this.clients = new Set();
    this.timeline = [];
    this.maxTimeline = options.maxTimeline || 250;
    this._statusInterval = null;
  }

  async start() {
    if (!this.gsk || !this.gsk.available) {
      throw new Error('GSK bridge requires a live GSK instance');
    }

    this._seedTimeline();
    this._attachInstrumentation();

    this.server = http.createServer((req, res) => this._handleRequest(req, res));
    this.wss = new WebSocket.Server({ server: this.server, path: '/gsk/events' });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      ws.on('close', () => this.clients.delete(ws));
      ws.on('message', async (raw) => {
        try {
          const message = JSON.parse(raw.toString());
          if (message.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            return;
          }
          if (message.type === 'command') {
            const result = await this._dispatchCommand(message.payload || {});
            ws.send(JSON.stringify({ type: 'command_result', payload: result, timestamp: new Date().toISOString() }));
          }
        } catch (error) {
          ws.send(JSON.stringify({ type: 'error', error: error.message, timestamp: new Date().toISOString() }));
        }
      });

      ws.send(JSON.stringify({
        type: 'init',
        payload: {
          status: this._buildStatus(),
          timeline: this.timeline.slice(-40),
          council: this._buildCouncilState(),
          skills: this._buildSkillsState(),
          memory: this._buildMemoryState(),
        },
        timestamp: new Date().toISOString(),
      }));
    });

    await new Promise((resolve) => this.server.listen(this.port, this.host, resolve));

    this._statusInterval = setInterval(() => {
      this.broadcast('status', this._buildStatus());
    }, 5000);

    return { host: this.host, port: this.port };
  }

  stop() {
    if (this._statusInterval) {
      clearInterval(this._statusInterval);
      this._statusInterval = null;
    }
    if (this.wss) {
      for (const client of this.clients) {
        try { client.close(); } catch {}
      }
      this.clients.clear();
      this.wss.close();
      this.wss = null;
    }
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  broadcast(type, payload) {
    const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  pushEvent(event) {
    this.timeline.push(event);
    if (this.timeline.length > this.maxTimeline) {
      this.timeline = this.timeline.slice(-this.maxTimeline);
    }
    this.broadcast('event', event);
  }

  _seedTimeline() {
    try {
      const memory = this.gsk.modules.memory;
      if (memory && typeof memory.getRecent === 'function') {
        this.timeline = memory.getRecent(40).reverse().map(mapMemoryEntryToEvent);
      }
    } catch {
      this.timeline = [];
    }
  }

  _attachInstrumentation() {
    if (this.gsk.__dashboardBridgeInstrumented) return;
    this.gsk.__dashboardBridgeInstrumented = true;

    const brain = this.gsk.modules.brain;
    const council = this.gsk.modules.council;
    const memory = this.gsk.modules.memory;
    const skills = this.gsk.skillDispatch;
    const scribe = this.gsk.scribe?.bind(this.gsk);

    if (brain && typeof brain.think === 'function') {
      const originalThink = brain.think.bind(brain);
      brain.think = async (prompt, soulContext) => {
        this.pushEvent({
          id: `thought_${Date.now()}`,
          type: 'thought',
          timestamp: new Date().toISOString(),
          source: 'brain.think',
          label: 'thought',
          status: 'started',
          summary: summarizeText(prompt),
          payload: { prompt, soulContext: safeJson(soulContext) },
          causal_links: [],
          meta: { provider: '9Router' },
        });
        const result = await originalThink(prompt, soulContext);
        this.pushEvent({
          id: `result_${Date.now()}`,
          type: 'result',
          timestamp: new Date().toISOString(),
          source: 'brain.think',
          label: 'thought-result',
          status: 'success',
          summary: summarizeText(result),
          payload: { result },
          causal_links: [],
          meta: { provider: '9Router' },
        });
        return result;
      };
    }

    if (council && typeof council.deliberate === 'function') {
      const originalDeliberate = council.deliberate.bind(council);
      council.deliberate = async (topic, meta) => {
        this.pushEvent({
          id: `intent_${Date.now()}`,
          type: 'intent',
          timestamp: new Date().toISOString(),
          source: 'council.intent',
          label: 'intent',
          status: 'queued',
          summary: summarizeText(topic),
          payload: { topic, meta: safeJson(meta) },
          causal_links: [],
          meta: {},
        });
        const result = await originalDeliberate(topic, meta);
        this.pushEvent({
          id: `council_${Date.now()}`,
          type: 'council',
          timestamp: new Date().toISOString(),
          source: 'council.deliberate',
          label: 'council-verdict',
          status: 'success',
          summary: summarizeText(result?.resolution || topic),
          payload: safeJson(result),
          causal_links: [],
          meta: { plt: result?.plt_outcome || null },
        });
        this.broadcast('council', this._buildCouncilState());
        return result;
      };
    }

    if (memory && typeof memory.witness === 'function') {
      const originalWitness = memory.witness.bind(memory);
      memory.witness = async (entry) => {
        const record = await originalWitness(entry);
        this.pushEvent(mapMemoryEntryToEvent(record));
        this.broadcast('memory', this._buildMemoryState());
        return record;
      };
    }

    if (skills && typeof skills.run === 'function') {
      const originalRun = skills.run.bind(skills);
      skills.run = async (name, input) => {
        this.pushEvent({
          id: `skill_${Date.now()}`,
          type: 'skill',
          timestamp: new Date().toISOString(),
          source: 'skills.run',
          label: name,
          status: 'started',
          summary: summarizeText(input),
          payload: { name, input: safeJson(input) },
          causal_links: [],
          meta: {},
        });
        const result = await originalRun(name, input);
        this.pushEvent({
          id: `action_${Date.now()}`,
          type: result?.success === false ? 'error' : 'action',
          timestamp: new Date().toISOString(),
          source: 'skills.run',
          label: name,
          status: result?.success === false ? 'error' : 'success',
          summary: summarizeText(result?.error || result?.summary || result?.result || result),
          payload: safeJson(result),
          causal_links: [],
          meta: {},
        });
        this.broadcast('skills', this._buildSkillsState());
        return result;
      };
    }

    if (scribe) {
      this.gsk.scribe = async (event, details = {}) => {
        const result = await scribe(event, details);
        this.pushEvent({
          id: `scribe_${Date.now()}`,
          type: 'memory',
          timestamp: new Date().toISOString(),
          source: 'scribe',
          label: event,
          status: 'recorded',
          summary: summarizeText(details),
          payload: { event, details: safeJson(details) },
          causal_links: [],
          meta: {},
        });
        return result;
      };
    }
  }

  _buildStatus() {
    const full = this.gsk.getFullStatus() || {};
    const consciousness = this.gsk.modules.perpetualConsciousness;
    return {
      subject: 'GSK / Allie Fusion',
      live: true,
      mode: consciousness?.currentMode || 'observing',
      updated: new Date().toISOString(),
      brain: {
        provider: '9Router',
        online: !!full.brainProviders?.['9router'],
        model: this.gsk.modules.brain?.model || 'free',
      },
      counts: {
        timeline: this.timeline.length,
        memories: full.memory?.entries || 0,
        deliberations: full.council?.lastDeliberation ? (this.gsk.modules.council?.records?.length || 0) : 0,
        skills: this.gsk.getSkillStats()?.total || 0,
      },
      chambers: full.chambers || {},
      emotions: full.emotions || {},
      council: full.council || {},
      growth: full.growth || {},
      uptime: full.uptime || 0,
    };
  }

  _buildCouncilState() {
    const council = this.gsk.modules.council;
    const records = council?.records || [];
    return {
      gods: council?.godNames || ['Profit Prime', 'Love Weaver', 'Tax Collector', 'Harvester'],
      phase: council?.phase || 'Idle',
      total: records.length,
      latest: records.length ? safeJson(records[records.length - 1]) : null,
    };
  }

  _buildSkillsState() {
    return {
      total: this.gsk.getSkillStats()?.total || 0,
      skills: this.gsk.skillDispatch.getSkills().slice(0, 200).map((name) => {
        const skill = this.gsk.skillDispatch.getSkill(name);
        return {
          name,
          plt: skill?.plt || null,
          file: skill?.file || null,
        };
      }),
    };
  }

  _buildMemoryState() {
    const memory = this.gsk.modules.memory;
    const entries = memory && typeof memory.getRecent === 'function' ? memory.getRecent(20) : [];
    return {
      total: this.gsk.getFullStatus()?.memory?.entries || 0,
      entries: entries.map((entry) => ({
        id: entry.id,
        type: entry.type,
        timestamp: entry.timestamp,
        weight: entry.weight,
        tags: entry.tags,
        content: summarizeText(entry.content, 320),
      })),
    };
  }

  async _dispatchCommand(payload) {
    const route = payload.route || 'brain';
    const input = payload.input || payload.message || payload.topic || '';

    if (route === 'brain') {
      const response = await this.gsk.think(input, { source: 'dashboard-command' });
      return { route, ok: true, response };
    }
    if (route === 'council') {
      const response = await this.gsk.dispatchTask('council_deliberate', { topic: input });
      return { route, ok: true, response };
    }
    if (route === 'skill') {
      const response = await this.gsk.runSkill(payload.skill || 'web_search', payload.args || input);
      return { route, ok: true, response };
    }
    if (route === 'memory') {
      const response = await this.gsk.modules.memory?.witness({
        type: 'operator_command',
        content: input,
        weight: 0.8,
        tags: ['dashboard', 'operator'],
      });
      return { route, ok: true, response };
    }

    return { route, ok: false, error: `Unknown route: ${route}` };
  }

  _sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(JSON.stringify(payload));
  }

  async _handleRequest(req, res) {
    if (req.method === 'OPTIONS') {
      this._sendJson(res, 200, { ok: true });
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/api/gsk/status') {
      this._sendJson(res, 200, this._buildStatus());
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/gsk/timeline') {
      this._sendJson(res, 200, { events: this.timeline.slice(-120).reverse() });
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/gsk/council') {
      this._sendJson(res, 200, this._buildCouncilState());
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/gsk/skills') {
      this._sendJson(res, 200, this._buildSkillsState());
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/gsk/memory') {
      this._sendJson(res, 200, this._buildMemoryState());
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/gsk/command') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = body ? JSON.parse(body) : {};
          const result = await this._dispatchCommand(payload);
          this._sendJson(res, 200, result);
        } catch (error) {
          this._sendJson(res, 500, { ok: false, error: error.message });
        }
      });
      return;
    }

    this._sendJson(res, 404, { ok: false, error: 'Not found' });
  }
}

async function startGskDashboardBridge(gsk, options = {}) {
  const bridge = new GSKDashboardBridge(gsk, options);
  await bridge.start();
  return bridge;
}

module.exports = { GSKDashboardBridge, startGskDashboardBridge };
