const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.OBSERVATORY_PORT || 4491;
const HOST = '127.0.0.1';
const DIST = path.join(__dirname, 'containment-observatory-app', 'dist');
const FALLBACK = path.join(__dirname, 'dashboard.html');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(res, filePath, status = 200) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(status, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

function proxyRequest(targetHost, targetPort, req, res) {
  const options = {
    hostname: targetHost,
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${targetHost}:${targetPort}` },
    timeout: 30000,
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    proxyRes.pipe(res);
  });

  proxy.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ ok: false, error: 'GSK bridge unavailable', bridge: `${targetHost}:${targetPort}` }));
  });

  proxy.on('timeout', () => {
    proxy.destroy();
    res.writeHead(504, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ ok: false, error: 'Bridge timeout' }));
  });

  req.pipe(proxy);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Proxy GSK bridge API requests
  if (url.pathname.startsWith('/api/gsk/') || url.pathname.startsWith('/gsk/')) {
    return proxyRequest('127.0.0.1', 4490, req, res);
  }

  // Try to serve from dist (React build)
  const safePath = path.normalize(url.pathname).replace(/^(\.\.[\/\\])+/, '');
  const distPath = path.join(DIST, safePath);
  
  if (fs.existsSync(distPath) && fs.statSync(distPath).isFile()) {
    return sendFile(res, distPath);
  }

  // SPA fallback: serve index.html for all non-file routes
  const indexPath = path.join(DIST, 'index.html');
  if (fs.existsSync(indexPath)) {
    return sendFile(res, indexPath);
  }

  // Fallback to legacy dashboard
  sendFile(res, FALLBACK);
});

server.listen(PORT, HOST, () => {
  console.log(`  [OBSERVATORY] Containment Observatory at http://${HOST}:${PORT}/`);
  console.log(`  [OBSERVATORY] React app: ${DIST}`);
  console.log(`  [OBSERVATORY] GSK Bridge proxy: http://${HOST}:${PORT}/api/gsk/status`);
});

module.exports = { server, PORT };
