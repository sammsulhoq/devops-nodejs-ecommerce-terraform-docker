'use strict';
const {test,after} = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const path = require('node:path');
const children=[];
after(async()=>{await Promise.all(children.map(child=>new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);child.kill('SIGTERM')})))});
const urls={user:'http://127.0.0.1:13001',products:'http://127.0.0.1:13002',orders:'http://127.0.0.1:13003',cart:'http://127.0.0.1:13004'};
async function ready(url){for(let i=0;i<100;i++){try{const r=await fetch(url+'/health',{signal:AbortSignal.timeout(300)});if(r.ok)return}catch{}await new Promise(r=>setTimeout(r,50))}throw new Error('Not ready: '+url)}
test('five services and frontend backend integration',async t=>{
 for(const [name,url] of Object.entries(urls)){
   children.push(spawn(process.execPath,[path.join(__dirname,'../services',name,'server.js')],{env:{...process.env,PORT:new URL(url).port},stdio:'ignore'}));
 }
 await Promise.all(Object.values(urls).map(ready));
 children.push(spawn(process.execPath,[path.join(__dirname,'../services/frontend/server.js')],{env:{...process.env,PORT:'13000',USER_SERVICE_URL:urls.user,PRODUCTS_SERVICE_URL:urls.products,ORDERS_SERVICE_URL:urls.orders,CART_SERVICE_URL:urls.cart},stdio:'ignore'}));
 const base='http://127.0.0.1:13000';await ready(base);
 await t.test('homepage',async()=>{const r=await fetch(base);assert.equal(r.status,200);assert.match(await r.text(),/Frontend is Live/)});
 for(const name of Object.keys(urls))await t.test(name+' proxy',async()=>{const r=await fetch(base+'/api/'+name);assert.equal(r.status,200);const data=await r.json();assert.equal(data.service,name);assert.ok(data.data.length)});
 await t.test('all backend health',async()=>{const r=await fetch(base+'/api/status');assert.equal(r.status,200);const data=await r.json();assert.equal(data.backends.length,4);assert.ok(data.backends.every(s=>s.status==='ok'))});
 await t.test('unknown route',async()=>{assert.equal((await fetch(base+'/api/nope')).status,404)});
 await t.test('unsupported method',async()=>{assert.equal((await fetch(base+'/api/cart',{method:'POST'})).status,405)});
 await t.test('backend failure is visible',async()=>{const child=children[0];await new Promise(resolve=>{child.once('exit',resolve);child.kill('SIGTERM')});assert.equal((await fetch(base+'/api/user')).status,502);const r=await fetch(base+'/api/status');assert.equal(r.status,503);assert.equal((await r.json()).backends.find(s=>s.service==='user').status,'unavailable')});
});
