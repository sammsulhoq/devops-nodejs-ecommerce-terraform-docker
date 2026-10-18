'use strict';
const http = require('node:http');
const service = 'user';
const port = Number(process.env.PORT || 3001);
const data = [{"id": 1, "name": "Aarav Sharma", "email": "aarav@example.com"}];
const server = http.createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') { res.writeHead(405, { Allow: 'GET' }); return res.end(JSON.stringify({error:'Method not allowed'})); }
  if (path === '/health') return res.end(JSON.stringify({service, status:'ok'}));
  if (path === '/' || path === '/api/user') return res.end(JSON.stringify({service, message: service + ' Service Running', data}));
  res.writeHead(404); res.end(JSON.stringify({error:'Not found'}));
});
server.listen(port, '0.0.0.0', () => console.log(service + ' Service Running on port ' + port));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
