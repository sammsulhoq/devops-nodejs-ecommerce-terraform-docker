'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const services = {
  user: process.env.USER_SERVICE_URL || 'http://user:3001',
  products: process.env.PRODUCTS_SERVICE_URL || 'http://products:3002',
  orders: process.env.ORDERS_SERVICE_URL || 'http://orders:3003',
  cart: process.env.CART_SERVICE_URL || 'http://cart:3004'
};
const homepage = fs.readFileSync(path.join(__dirname, 'public/index.html'));
const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  res.setHeader('X-Content-Type-Options','nosniff');
  if (req.method !== 'GET') { res.writeHead(405, {Allow:'GET'}); return res.end(); }
  if (pathname === '/') { res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'}); return res.end(homepage); }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (pathname === '/health') return res.end(JSON.stringify({service:'frontend',status:'ok'}));
  if (pathname === '/api/status') {
    const results = await Promise.all(Object.entries(services).map(async ([name, url]) => {
      try {
        const response = await fetch(url + '/health', {signal:AbortSignal.timeout(4000)});
        if (!response.ok) throw new Error('Backend unavailable');
        const health = await response.json();
        return {service:name,status:health.status};
      } catch { return {service:name,status:'unavailable'}; }
    }));
    res.writeHead(results.every(r=>r.status==='ok') ? 200 : 503);
    return res.end(JSON.stringify({service:'frontend',backends:results}));
  }
  const match = /^\/api\/(user|products|orders|cart)$/.exec(pathname);
  if (match) {
    try {
      const response = await fetch(services[match[1]] + pathname, {signal:AbortSignal.timeout(4000)});
      res.writeHead(response.status); return res.end(await response.text());
    } catch { res.writeHead(502); return res.end(JSON.stringify({error:'Backend unavailable'})); }
  }
  res.writeHead(404); res.end(JSON.stringify({error:'Not found'}));
});
server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Frontend is Live on port ' + (process.env.PORT || 3000)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
