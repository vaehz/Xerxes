'use strict';
/*
 * XERXES Auth Server - real backend (Node 22+, no npm dependencies)
 *  - Admin panel API   : /api/v1/admin/*   (what public/app.js calls)
 *  - Client program API: /api/1.2/         (KeyAuth-style: init, license, register, login, check, var, file, log, ban, logout)
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

// Secrets load from .env beside the server (never from public/ or source).
// A real process environment value always wins over the file value.
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvFile(path.join(__dirname, '.env'));

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const FILES_DIR = path.join(DATA_DIR, 'files');
fs.mkdirSync(FILES_DIR, { recursive: true });

// ---------------------------------------------------------------- helpers
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const hmac = (k, m) => crypto.createHmac('sha256', k).update(m).digest('hex');
const rnd = (n = 16) => crypto.randomBytes(n).toString('hex');
const safeEq = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const hashPass = (pw, salt) => crypto.scryptSync(String(pw), salt, 64).toString('hex');
const clean = (s) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, '').trim();

// ---------------------------------------------------------------- storage (sqlite, write-through)
const sql = new DatabaseSync(path.join(DATA_DIR, 'xerxes.sqlite'));
sql.exec('CREATE TABLE IF NOT EXISTS store (k TEXT PRIMARY KEY, v TEXT NOT NULL)');
const getRow = sql.prepare('SELECT v FROM store WHERE k = ?');
const putRow = sql.prepare('INSERT INTO store (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v');

function loadDb() {
  const r = getRow.get('db');
  const db = r ? JSON.parse(r.v) : {};
  db.apps ||= []; db.licenses ||= []; db.variables ||= []; db.logs ||= []; db.users ||= [];
  db.keyGeneration ||= 1;
  db.goldenRootHash ||= sha256('XERXES-GOLDEN-' + Date.now()).slice(0, 32);
  db.ownerId ||= process.env.OWNER_ID || rnd(5).toUpperCase();
  return db;
}
let db = loadDb();
function save(snapshot = false) {
  if (snapshot) {
    const prev = getRow.get('db');
    if (prev) putRow.run('rollback', prev.v);
  }
  putRow.run('db', JSON.stringify(db));
}

// Admin identity comes only from process env / .env — never from source, UI, or DB defaults.
// Env values are authoritative on every boot, so an existing DB is reconciled here too.
const envUser = clean(process.env.ADMIN_USER).toLowerCase();
const envPass = String(process.env.ADMIN_PASS || '');

if (!db.admin) {
  const user = envUser || 'admin';
  const pass = envPass || rnd(8);
  const salt = rnd(16);
  db.admin = { user, salt, hash: hashPass(pass, salt), role: 'superadmin' };
  save();
  console.log('\n==============================================');
  console.log(envPass ? ' ADMIN ACCOUNT CREATED FROM ENV (password hidden)' : ' ADMIN ACCOUNT CREATED (shown only once)');
  console.log('  username : ' + user);
  if (!envPass) console.log('  password : ' + pass);
  console.log('==============================================\n');
} else {
  let changed = false;
  if (envUser && db.admin.user !== envUser) { db.admin.user = envUser; changed = true; }
  if (envPass && !safeEq(hashPass(envPass, db.admin.salt), db.admin.hash)) {
    db.admin.salt = rnd(16);
    db.admin.hash = hashPass(envPass, db.admin.salt);
    changed = true;
  }
  if (changed) {
    save();
    console.log(' ADMIN CREDENTIALS SYNCED FROM ENV (password hidden)');
  }
}

function addLog(type, level, message, ip = '') {
  db.logs.unshift({
    id: 'log_' + Date.now() + '_' + rnd(2), timestamp: new Date().toISOString(),
    type, level, message: String(message).replace(/[()-]/g, ''), ip
  });
  if (db.logs.length > 1000) db.logs.length = 1000;
}

// ---------------------------------------------------------------- license model
function licStatus(l) {
  if (l.status === 'banned') return 'banned';
  if (l.expiresAt && new Date(l.expiresAt) < new Date()) return 'expired';
  return 'active';
}
const licView = (l) => ({ ...l, status: licStatus(l) });
const varView = (v) => { const { fileBase64, ...rest } = v; return rest; };
const fileOf = (id) => path.join(FILES_DIR, String(id).replace(/[^a-zA-Z0-9_-]/g, ''));

// ---------------------------------------------------------------- rate limiting
const buckets = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const b = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  b.push(now); buckets.set(key, b);
  return b.length > max;
}
setInterval(() => { const n = Date.now(); for (const [k, v] of buckets) if (!v.some((t) => n - t < 600000)) buckets.delete(k); }, 60000).unref();

// ---------------------------------------------------------------- admin sessions
const sessions = new Map(); // token -> { signKey, exp, nonces:Set }
const SESSION_MS = 12 * 3600 * 1000;
function newSession() {
  const token = 'sess_' + rnd(16), signKey = rnd(16);
  sessions.set(token, { signKey, exp: Date.now() + SESSION_MS, nonces: new Set() });
  return { token, signKey };
}
function getSession(req) {
  const t = req.headers['x-session-token'];
  const s = t && sessions.get(t);
  if (!s) return null;
  if (s.exp < Date.now()) { sessions.delete(t); return null; }
  return { token: t, ...s };
}
function verifySignature(req, pathname, raw, s) {
  const ts = Number(req.headers['x-signature-timestamp']);
  const nonce = String(req.headers['x-signature-nonce'] || '');
  const bh = String(req.headers['x-signature-body-hash'] || '');
  const sig = String(req.headers['x-signature-hmac'] || '');
  if (!ts || !nonce || !bh || !sig) return false;
  if (Math.abs(Date.now() - ts) > 120000) return false;
  if (s.nonces.has(nonce)) return false;
  if (!safeEq(sha256(raw), bh)) return false;
  const expect = hmac(s.signKey, `${req.method}\n${pathname}\n${ts}\n${nonce}\n${bh}`);
  if (!safeEq(expect, sig)) return false;
  s.nonces.add(nonce);
  if (s.nonces.size > 5000) s.nonces.clear();
  return true;
}

// ---------------------------------------------------------------- http utils
function clientIp(req) {
  if (TRUST_PROXY) {
    const f = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (f) return f;
  }
  return (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
}
function send(res, status, obj, type = 'application/json; charset=utf-8') {
  const body = typeof obj === 'string' || Buffer.isBuffer(obj) ? obj : JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req, limit = 40 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
const R = (status, data) => ({ status, data });
const fail = (status, message) => R(status, { ok: false, message });

// ---------------------------------------------------------------- ADMIN API
const publicPaths = new Set(['/api/v1/admin/status', '/api/v1/admin/login', '/api/v1/admin/logout']);

function adminLogin(body, ip) {
  if (limited('login:' + ip, 10, 5 * 60 * 1000)) return fail(429, 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ 5 นาที');
  const user = clean(body.username).toLowerCase(), pass = String(body.password || '').trim();
  if (!user || !pass) return fail(400, 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
  const okUser = safeEq(user, db.admin.user);
  const okPass = safeEq(hashPass(pass, db.admin.salt), db.admin.hash);
  if (!(okUser && okPass)) {
    addLog('AUTH', 'WARN', 'ความพยายามเข้าสู่ระบบไม่สำเร็จ', ip); save();
    return fail(401, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }
  const s = newSession();
  addLog('AUTH', 'SUCCESS', 'ผู้ดูแลระบบเข้าสู่ระบบสำเร็จ', ip); save();
  return R(200, { ok: true, admin: { username: 'Xerxes Operator', role: db.admin.role, ownerId: db.ownerId }, token: s.token, signing_key: s.signKey, server_time: Date.now() });
}

function adminRoute(req, pathname, method, body, ip, sess) {
  const p = pathname;
  const gen = () => 'app_' + Date.now() + '_' + rnd(2);

  if (p === '/api/v1/admin/ui' && method === 'GET') {
    return R(200, { ok: true, html: fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8') });
  }
  if (p === '/api/v1/admin/overview' && method === 'GET') {
    const L = db.licenses.map(licView);
    return R(200, { ok: true, stats: {
      totalKeys: L.length, activeKeys: L.filter((l) => l.status === 'active').length,
      expiredKeys: L.filter((l) => l.status === 'expired').length, bannedKeys: L.filter((l) => l.status === 'banned').length,
      boundHwid: L.filter((l) => !!l.hwid).length, totalApps: db.apps.length,
      totalVariables: db.variables.length, totalLogs: db.logs.length },
      recentLogs: db.logs.slice(0, 10), apps: db.apps });
  }

  // ----- variables
  if (p === '/api/v1/admin/variables' && method === 'GET') return R(200, { ok: true, variables: db.variables.map(varView) });
  if (p === '/api/v1/admin/variables' && method === 'POST') {
    const name = clean(body.name), data = String(body.data || '').trim();
    if (!name) return fail(400, 'กรุณาระบุชื่อ Variable Name');
    if (!data && !body.file_base64) return fail(400, 'กรุณาระบุ Variable Data หรือเลือกไฟล์ที่ต้องการฝาก');
    const appId = body.app_id || 'global';
    const app = db.apps.find((a) => a.id === appId);
    const v = { id: 'var_' + Date.now() + '_' + rnd(2), name, data: data || (body.file_name ? `Deposited File: ${body.file_name}` : ''),
      authenticated: body.authenticated !== false, appId: app ? appId : 'global', appName: app ? app.name : 'Global All Apps',
      hasFile: false, fileName: null, fileExt: null, fileSize: 0, fileSha256: null, createdAt: new Date().toISOString() };
    if (body.file_base64 && body.file_name) {
      const buf = Buffer.from(String(body.file_base64), 'base64');
      fs.writeFileSync(fileOf(v.id), buf);
      const dot = String(body.file_name).lastIndexOf('.');
      Object.assign(v, { hasFile: true, fileName: clean(body.file_name), fileExt: dot >= 0 ? body.file_name.slice(dot).toLowerCase() : '.bin', fileSize: buf.length, fileSha256: sha256(buf) });
    }
    db.variables.unshift(v);
    addLog('VAULT', 'INFO', `ฝากข้อมูลหรือไฟล์ใหม่ชื่อ ${v.name} ${v.fileName || ''}`, ip); save(true);
    return R(201, { ok: true, variable: varView(v), message: 'สร้าง Global Variable และฝากไฟล์สำเร็จ' });
  }
  if (p.startsWith('/api/v1/admin/variables/') && method === 'PUT') {
    const id = p.split('/').pop(); const t = db.variables.find((v) => v.id === id);
    if (!t) return fail(404, 'ไม่พบรายการที่ต้องการแก้ไข');
    t.name = clean(body.name || t.name);
    if (body.data !== undefined) t.data = String(body.data);
    if (body.authenticated !== undefined) t.authenticated = !!body.authenticated;
    if (body.app_id !== undefined) { const a = db.apps.find((x) => x.id === body.app_id); t.appId = a ? a.id : 'global'; t.appName = a ? a.name : 'Global All Apps'; }
    if (body.file_base64 && body.file_name) {
      const buf = Buffer.from(String(body.file_base64), 'base64'); fs.writeFileSync(fileOf(t.id), buf);
      Object.assign(t, { hasFile: true, fileName: clean(body.file_name), fileSize: buf.length, fileSha256: sha256(buf) });
    }
    addLog('VAULT', 'INFO', `แก้ไขรายการฝากของ ${t.name} เรียบร้อย`, ip); save(true);
    return R(200, { ok: true, message: 'บันทึกการแก้ไขเรียบร้อยแล้ว' });
  }
  if (p.startsWith('/api/v1/admin/variables/') && method === 'DELETE') {
    const id = p.split('/').pop(); const t = db.variables.find((v) => v.id === id);
    db.variables = db.variables.filter((v) => v.id !== id);
    try { fs.unlinkSync(fileOf(id)); } catch (e) { /* none */ }
    addLog('VAULT', 'WARN', `ลบรายการฝากของ ${t ? t.name : id}`, ip); save(true);
    return R(200, { ok: true, message: 'ลบรายการฝากของเรียบร้อยแล้ว' });
  }

  // ----- apps
  if (p === '/api/v1/admin/apps' && method === 'GET') return R(200, { ok: true, apps: db.apps, ownerId: db.ownerId });
  if (p === '/api/v1/admin/apps' && method === 'POST') {
    const name = clean(body.name);
    if (!name) return fail(400, 'กรุณาระบุชื่อแอปพลิเคชัน');
    if (db.apps.some((a) => a.name.toLowerCase() === name.toLowerCase())) return fail(400, 'มีชื่อแอปพลิเคชันนี้ในระบบแล้ว');
    const app = { id: gen(), name, description: clean(body.description).slice(0, 50),
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-') || ('app-' + Date.now()), version: clean(body.version) || '1.0',
      sdkLang: body.sdk_lang || 'all', ownerId: db.ownerId, secretKey: rnd(32), keyGeneration: 1, status: 'active', createdAt: new Date().toISOString() };
    db.apps.unshift(app);
    addLog('APP', 'INFO', `สร้างแอปพลิเคชัน Auth ใหม่ชื่อ ${app.name}`, ip); save(true);
    return R(201, { ok: true, app });
  }
  if (p.startsWith('/api/v1/admin/apps/') && p.endsWith('/reset-hwid') && method === 'POST') {
    const parts = p.split('/'); const app = db.apps.find((a) => a.id === parts[parts.length - 2]);
    if (!app) return fail(404, 'ไม่พบแอปพลิเคชันที่ระบุ');
    if (body.mode === 'all') {
      let n = 0;
      db.licenses.forEach((l) => { if (l.appId === app.id) { if (l.hwid) n++; l.hwid = null; l.hwidResetCount = 0; } });
      addLog('HWID', 'INFO', `RESET HWID ทั้งหมดของแอป ${app.name} จำนวน ${n} คีย์`, ip); save(true);
      return R(200, { ok: true, message: `RESET HWID เฉพาะของแอป ${app.name} เรียบร้อยแล้ว จำนวน ${n} คีย์` });
    }
    const key = clean(body.key).toUpperCase();
    const l = db.licenses.find((x) => x.key.toUpperCase() === key);
    if (!l) return fail(404, 'ไม่พบคีย์ไลเซนส์ในระบบ');
    if (l.appId !== app.id) return fail(403, `คีย์ ${l.key} เป็นของแอป ${l.appName} ไม่สามารถ RESET HWID ข้ามแอปพลิเคชันได้`);
    l.hwid = null; l.hwidResetCount = 0;
    addLog('HWID', 'INFO', `RESET HWID สำเร็จสำหรับคีย์ ${l.key} ของแอป ${app.name}`, ip); save();
    return R(200, { ok: true, message: `RESET HWID คีย์ ${l.key} ของแอป ${app.name} เรียบร้อยแล้ว` });
  }
  if (p.startsWith('/api/v1/admin/apps/') && method === 'PUT') {
    const app = db.apps.find((a) => a.id === p.split('/').pop());
    if (!app) return fail(404, 'ไม่พบแอปพลิเคชัน');
    if (body.action === 'regenerate_secret') {
      app.secretKey = rnd(32); app.keyGeneration = (app.keyGeneration || 1) + 1;
      addLog('APP', 'WARN', `หมุนคีย์ Secret Rotation ของแอป ${app.name}`, ip);
    } else {
      const nn = clean(body.name || app.name);
      if (db.apps.some((a) => a.id !== app.id && a.name.toLowerCase() === nn.toLowerCase())) return fail(400, 'มีชื่อแอปพลิเคชันนี้ในระบบแล้ว');
      app.name = nn; app.description = clean(body.description).slice(0, 50); app.version = clean(body.version) || '1.0';
      app.status = body.status === 'disabled' ? 'disabled' : (body.status || 'active'); app.sdkLang = body.sdk_lang || app.sdkLang || 'all';
      if (body.secretKey && String(body.secretKey).trim().length >= 16) app.secretKey = String(body.secretKey).trim();
      db.licenses.forEach((l) => { if (l.appId === app.id) l.appName = app.name; });
      db.variables.forEach((v) => { if (v.appId === app.id) v.appName = app.name; });
      addLog('APP', 'INFO', `แก้ไขข้อมูลแอปพลิเคชัน ${app.name} เรียบร้อย`, ip);
    }
    save(true);
    return R(200, { ok: true, app, message: 'บันทึกการแก้ไขแอปพลิเคชันเรียบร้อยแล้ว' });
  }
  if (p.startsWith('/api/v1/admin/apps/') && method === 'DELETE') {
    const id = p.split('/').pop(); const t = db.apps.find((a) => a.id === id);
    db.apps = db.apps.filter((a) => a.id !== id);
    db.licenses = db.licenses.filter((l) => l.appId !== id);
    db.users = db.users.filter((u) => u.appId !== id);
    db.variables.filter((v) => v.appId === id).forEach((v) => { try { fs.unlinkSync(fileOf(v.id)); } catch (e) { /* none */ } });
    db.variables = db.variables.filter((v) => v.appId !== id);
    addLog('APP', 'WARN', `ลบแอปพลิเคชัน ${t ? t.name : id}`, ip); save(true);
    return R(200, { ok: true, message: 'ลบแอปพลิเคชันเรียบร้อย' });
  }

  // ----- licenses
  if (p === '/api/v1/admin/licenses' && method === 'GET') return R(200, { ok: true, licenses: db.licenses.map(licView) });
  if (p === '/api/v1/admin/licenses/generate' && method === 'POST') {
    if (!db.apps.length) return fail(400, 'กรุณาสร้างแอปพลิเคชันก่อนสร้างคีย์ไลเซนส์');
    const amount = Math.min(Math.max(parseInt(body.amount, 10) || 1, 1), 100);
    const app = db.apps.find((a) => a.id === body.app_id) || db.apps[0];
    const days = Number.isNaN(parseInt(body.duration_days, 10)) ? 30 : parseInt(body.duration_days, 10);
    const prefix = String(body.prefix || 'XERXES').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'XERXES';
    const maxResets = Number.isNaN(parseInt(body.max_hwid_resets, 10)) ? 3 : parseInt(body.max_hwid_resets, 10);
    const notes = String(body.notes || 'สร้างโดยผู้ดูแลระบบ').replace(/[()-]/g, '').slice(0, 200);
    const out = [];
    for (let i = 0; i < amount; i++) {
      const n = rnd(8).toUpperCase();
      const dur = days <= 1 ? 'D' : days <= 7 ? 'W' : days <= 31 ? 'M' : 'L';
      const g1 = dur + n.slice(1, 4), g2 = n.slice(4, 8);
      const g3 = hmac(app.secretKey, `${prefix}-${g1}-${g2}`).toUpperCase().slice(0, 4);
      const lic = { key: `${prefix}-${g1}-${g2}-${g3}`, appId: app.id, appName: app.name, status: 'active', hwid: null,
        maxHwidResets: maxResets, hwidResetCount: 0, expiresAt: days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null,
        createdAt: new Date().toISOString(), notes };
      db.licenses.unshift(lic); out.push(licView(lic));
    }
    addLog('LICENSE', 'INFO', `สร้างคีย์ใหม่จำนวน ${amount} คีย์สำหรับแอป ${app.name}`, ip); save(true);
    return R(201, { ok: true, generated: out, count: amount });
  }
  if (p === '/api/v1/admin/licenses/toggle-ban' && method === 'POST') {
    const l = db.licenses.find((x) => x.key === body.key);
    if (!l) return fail(404, 'ไม่พบคีย์');
    l.status = l.status === 'banned' ? 'active' : 'banned';
    addLog('LICENSE', 'WARN', `เปลี่ยนสถานะคีย์ ${l.key} เป็น ${l.status}`, ip); save(true);
    return R(200, { ok: true, status: l.status, message: `เปลี่ยนสถานะเป็น ${l.status} เรียบร้อย` });
  }
  if (p === '/api/v1/admin/licenses/delete' && method === 'POST') {
    db.licenses = db.licenses.filter((l) => l.key !== body.key);
    db.users = db.users.filter((u) => u.licenseKey !== body.key);
    addLog('LICENSE', 'WARN', `ลบคีย์ ${body.key}`, ip); save(true);
    return R(200, { ok: true, message: 'ลบคีย์เรียบร้อย' });
  }
  if (p === '/api/v1/admin/licenses/clear' && method === 'POST') {
    db.licenses = []; db.users = [];
    addLog('LICENSE', 'WARN', 'ลบคีย์ไลเซนส์ทั้งหมดในระบบ', ip); save(true);
    return R(200, { ok: true, message: 'ลบคีย์ทั้งหมดเรียบร้อยแล้ว' });
  }

  // ----- logs / security
  if (p === '/api/v1/admin/logs' && method === 'GET') return R(200, { ok: true, logs: db.logs });
  if (p === '/api/v1/admin/logs/clear' && method === 'POST') {
    db.logs = []; addLog('SYSTEM', 'WARN', 'ล้างประวัติบันทึกความปลอดภัย', ip); save();
    return R(200, { ok: true, message: 'ล้างประวัติบันทึกเรียบร้อยแล้ว' });
  }
  if (p === '/api/v1/admin/security/password' && method === 'POST') {
    if (!safeEq(hashPass(String(body.old_password || '').trim(), db.admin.salt), db.admin.hash)) return fail(400, 'รหัสผ่านปัจจุบันไม่ถูกต้อง');
    const np = String(body.new_password || '').trim();
    if (np.length < 8) return fail(400, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
    if (clean(body.new_username)) db.admin.user = clean(body.new_username).toLowerCase();
    db.admin.salt = rnd(16); db.admin.hash = hashPass(np, db.admin.salt);
    for (const t of [...sessions.keys()]) if (t !== sess.token) sessions.delete(t);
    addLog('SECURITY', 'WARN', 'อัปเดตข้อมูลบัญชีผู้ดูแลระบบสำเร็จ', ip); save(true);
    return R(200, { ok: true, message: 'บันทึกข้อมูลบัญชีใหม่สำเร็จแล้ว' });
  }
  if (p === '/api/v1/admin/session/rotate' && method === 'POST') {
    sessions.delete(sess.token); const s = newSession();
    addLog('SECURITY', 'INFO', 'หมุนเวียน Session Token และ Signing Key สำเร็จ', ip); save();
    return R(200, { ok: true, token: s.token, signing_key: s.signKey, server_time: Date.now(), message: 'หมุนเวียน Session Token ใหม่สำเร็จ' });
  }
  if (p === '/api/v1/admin/integrity/status' && method === 'GET') {
    return R(200, { ok: true, integrity: { verified: true, keyGeneration: db.keyGeneration, goldenRootHash: db.goldenRootHash } });
  }
  if (p === '/api/v1/admin/integrity/recalculate' && method === 'POST') {
    db.goldenRootHash = sha256(JSON.stringify({ a: db.apps.length, l: db.licenses.length, t: Date.now() })).slice(0, 32);
    addLog('INTEGRITY', 'INFO', 'คำนวณ Golden Hash Manifest ใหม่สำเร็จ', ip); save();
    return R(200, { ok: true, manifest: { goldenRootHash: db.goldenRootHash }, message: 'คำนวณและบันทึก Golden Hash Manifest สำเร็จ' });
  }
  if (p === '/api/v1/admin/security/rotate-master' && method === 'POST') {
    db.keyGeneration += 1; db.goldenRootHash = sha256('XERXES-MASTER-' + Date.now()).slice(0, 32);
    addLog('SECURITY', 'WARN', `หมุนคีย์หลัก Master Key รุ่นที่ ${db.keyGeneration} สำเร็จ`, ip); save();
    return R(200, { ok: true, keyGeneration: db.keyGeneration, message: `หมุนคีย์หลัก Master Key รุ่นที่ ${db.keyGeneration} สำเร็จ` });
  }
  if (p === '/api/v1/admin/security/rollback' && method === 'POST') {
    const snap = getRow.get('rollback');
    if (!snap) return fail(404, 'ยังไม่มีจุดสำรองข้อมูล Rollback Snapshot');
    const keepAdmin = db.admin; db = JSON.parse(snap.v); db.admin = keepAdmin;
    addLog('SECURITY', 'WARN', 'กู้คืนข้อมูลจาก Rollback Snapshot', ip); save();
    return R(200, { ok: true, message: 'กู้คืนข้อมูลจาก Rollback Snapshot ล่าสุดเรียบร้อยแล้ว' });
  }
  return fail(404, 'ไม่พบคำสั่งที่เรียกใช้งาน');
}

async function handleAdmin(req, res, pathname) {
  const ip = clientIp(req);
  const raw = req.method === 'GET' || req.method === 'HEAD' ? '' : await readBody(req);
  let body = {};
  if (raw) { try { body = JSON.parse(raw); } catch (e) { return send(res, 400, { ok: false, message: 'JSON ไม่ถูกต้อง' }); } }
  const sess = getSession(req);

  if (pathname === '/api/v1/admin/status' && req.method === 'GET') {
    return send(res, 200, { ok: true, initialized: true, authenticated: !!sess,
      admin: sess ? { username: 'Xerxes Operator', role: db.admin.role, ownerId: db.ownerId } : null,
      token: sess ? sess.token : null, signing_key: sess ? sess.signKey : null, server_time: Date.now() });
  }
  if (pathname === '/api/v1/admin/login' && req.method === 'POST') { const r = adminLogin(body, ip); return send(res, r.status, { ...r.data, server_time: Date.now() }); }
  if (pathname === '/api/v1/admin/logout' && req.method === 'POST') {
    if (sess) { sessions.delete(sess.token); addLog('AUTH', 'INFO', 'ผู้ดูแลระบบออกจากระบบ', ip); save(); }
    return send(res, 200, { ok: true, message: 'ออกจากระบบแล้ว', server_time: Date.now() });
  }
  if (!sess) return send(res, 401, { ok: false, message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', server_time: Date.now() });
  if (!verifySignature(req, pathname, raw, sess)) return send(res, 401, { ok: false, message: 'ลายเซ็นคำขอไม่ถูกต้อง กรุณารีเฟรชหน้าแล้วเข้าสู่ระบบใหม่', server_time: Date.now() });
  const r = adminRoute(req, pathname, req.method, body, ip, sess);
  return send(res, r.status, { ...r.data, server_time: Date.now() });
}

// ---------------------------------------------------------------- KEYAUTH-STYLE CLIENT API  (/api/1.2/)
const clientSessions = new Map(); // sid -> { appId, validated, key, user, hwid, exp }
const CLIENT_SESSION_MS = 60 * 60 * 1000;
setInterval(() => { const n = Date.now(); for (const [k, v] of clientSessions) if (v.exp < n) clientSessions.delete(k); }, 60000).unref();

const ok = (o = {}) => ({ success: true, ...o });
const no = (message, o = {}) => ({ success: false, message, ...o });
const unix = (iso) => (iso ? Math.floor(new Date(iso).getTime() / 1000) : 0);

function licenseInfo(l, username, ip) {
  const exp = unix(l.expiresAt);
  return { username, ip, hwid: l.hwid || '', createdate: String(unix(l.createdAt)), lastlogin: String(Math.floor(Date.now() / 1000)),
    subscriptions: [{ subscription: 'default', key: l.key, expiry: String(exp || 4102444800), timeleft: exp ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : 999999999 }] };
}
function checkLicense(l, hwid, ip) {
  const st = licStatus(l);
  if (st === 'banned') return 'Your license key has been banned.';
  if (st === 'expired') return 'Your license key has expired.';
  if (l.hwid && hwid && l.hwid !== hwid) return "HWID doesn't match. Ask for a HWID reset.";
  if (!l.hwid && hwid) l.hwid = hwid;
  l.lastLogin = new Date().toISOString(); l.lastIp = ip;
  return null;
}

function clientApi(f, ip) {
  const type = clean(f.type).toLowerCase();

  if (type === 'init') {
    const app = db.apps.find((a) => a.name === clean(f.name) && a.ownerId === clean(f.ownerid));
    if (!app) return no('Application not found. Check your name and ownerid.');
    if (app.status !== 'active') return no('This application is disabled.');
    if (clean(f.ver) !== String(app.version)) return no('invalidver', { download: '' });
    const sid = rnd(8);
    clientSessions.set(sid, { appId: app.id, validated: false, exp: Date.now() + CLIENT_SESSION_MS, ip });
    const L = db.licenses.filter((l) => l.appId === app.id);
    return ok({ message: 'Initialized', sessionid: sid, newSession: true,
      appinfo: { numUsers: String(db.users.filter((u) => u.appId === app.id).length), numOnlineUsers: String([...clientSessions.values()].filter((s) => s.appId === app.id && s.validated).length),
        numKeys: String(L.length), version: String(app.version), customerPanelLink: '' } });
  }

  const sess = clientSessions.get(clean(f.sessionid));
  if (!sess || sess.exp < Date.now()) return no('Session not found. Please call init again.');
  sess.exp = Date.now() + CLIENT_SESSION_MS;
  const app = db.apps.find((a) => a.id === sess.appId);
  if (!app || app.status !== 'active') return no('This application is disabled.');

  switch (type) {
    case 'license': {
      const key = clean(f.key).toUpperCase(), hwid = clean(f.hwid);
      if (limited('lic:' + ip, 20, 60000)) return no('Too many attempts. Please wait.');
      const l = db.licenses.find((x) => x.appId === app.id && x.key.toUpperCase() === key);
      if (!l) { addLog('CLIENT', 'WARN', `License login failed for app ${app.name}`, ip); save(); return no('Invalid license key.'); }
      if (db.users.some((u) => u.licenseKey === l.key)) return no('This key is linked to a user account. Use login with username and password.');
      const err = checkLicense(l, hwid, ip);
      if (err) { addLog('CLIENT', 'WARN', `${err} (${app.name})`, ip); save(); return no(err); }
      sess.validated = true; sess.key = l.key; sess.hwid = l.hwid; save();
      addLog('CLIENT', 'SUCCESS', `License login ok for app ${app.name}`, ip); save();
      return ok({ message: 'Logged in!', info: licenseInfo(l, l.key, ip) });
    }
    case 'register': {
      const user = clean(f.username).toLowerCase(), pass = String(f.pass || ''), key = clean(f.key).toUpperCase(), hwid = clean(f.hwid);
      if (limited('reg:' + ip, 10, 60000)) return no('Too many attempts. Please wait.');
      if (!/^[a-z0-9_.-]{3,32}$/.test(user)) return no('Username must be 3-32 characters (a-z, 0-9, _ . -).');
      if (pass.length < 6) return no('Password must be at least 6 characters.');
      if (db.users.some((u) => u.appId === app.id && u.username === user)) return no('Username already taken.');
      const l = db.licenses.find((x) => x.appId === app.id && x.key.toUpperCase() === key);
      if (!l) return no('Invalid license key.');
      if (db.users.some((u) => u.licenseKey === l.key)) return no('License key already used.');
      const err = checkLicense(l, hwid, ip); if (err) return no(err);
      const salt = rnd(16);
      db.users.push({ username: user, salt, hash: hashPass(pass, salt), appId: app.id, licenseKey: l.key, createdAt: new Date().toISOString() });
      sess.validated = true; sess.key = l.key; sess.user = user; sess.hwid = l.hwid;
      addLog('CLIENT', 'INFO', `User registered for app ${app.name}`, ip); save();
      return ok({ message: 'Registered!', info: licenseInfo(l, user, ip) });
    }
    case 'login': {
      const user = clean(f.username).toLowerCase(), pass = String(f.pass || ''), hwid = clean(f.hwid);
      if (limited('ulogin:' + ip, 15, 60000)) return no('Too many attempts. Please wait.');
      const u = db.users.find((x) => x.appId === app.id && x.username === user);
      if (!u || !safeEq(hashPass(pass, u.salt), u.hash)) { addLog('CLIENT', 'WARN', `User login failed for app ${app.name}`, ip); save(); return no('Invalid username or password.'); }
      const l = db.licenses.find((x) => x.key === u.licenseKey);
      if (!l) return no('Your subscription no longer exists.');
      const err = checkLicense(l, hwid, ip); if (err) return no(err);
      sess.validated = true; sess.key = l.key; sess.user = user; sess.hwid = l.hwid; save();
      return ok({ message: 'Logged in!', info: licenseInfo(l, user, ip) });
    }
    case 'check': return sess.validated ? ok({ message: 'Session is validated.' }) : no('Session is not validated.');
    case 'logout': clientSessions.delete(clean(f.sessionid)); return ok({ message: 'Successfully logged out.' });
    case 'var': {
      const name = clean(f.varid);
      const v = db.variables.find((x) => x.name === name && (x.appId === app.id || x.appId === 'global'));
      if (!v) return no('Variable not found.');
      if (v.authenticated && !sess.validated) return no('You must be logged in to use this.');
      return ok({ message: v.data });
    }
    case 'file': {
      const id = clean(f.fileid);
      const v = db.variables.find((x) => (x.id === id || x.name === id) && x.hasFile && (x.appId === app.id || x.appId === 'global'));
      if (!v) return no('File not found.');
      if (v.authenticated && !sess.validated) return no('You must be logged in to use this.');
      let buf; try { buf = fs.readFileSync(fileOf(v.id)); } catch (e) { return no('File is missing on the server.'); }
      return ok({ message: 'File download successful', contents: buf.toString('hex'), sha256: v.fileSha256 });
    }
    case 'log': {
      addLog('CLIENT', 'INFO', `[${app.name}] ${clean(f.pcuser) || 'client'}: ${clean(f.message).slice(0, 300)}`, ip); save();
      return ok({ message: 'Added log.' });
    }
    case 'ban': {
      if (!sess.validated) return no('You must be logged in to use this.');
      const l = db.licenses.find((x) => x.key === sess.key);
      if (l) { l.status = 'banned'; addLog('CLIENT', 'WARN', `Key ${l.key} self-banned by client: ${clean(f.reason).slice(0, 200)}`, ip); save(); }
      clientSessions.delete(clean(f.sessionid));
      return ok({ message: 'Successfully banned.' });
    }
    default: return no('Unknown request type.');
  }
}

async function handleClientApi(req, res) {
  const ip = clientIp(req);
  if (limited('api:' + ip, 300, 60000)) return send(res, 429, no('Rate limit exceeded.'));
  const raw = await readBody(req, 1024 * 1024);
  let f = {};
  if ((req.headers['content-type'] || '').includes('json')) { try { f = JSON.parse(raw); } catch (e) { /* ignore */ } }
  else f = Object.fromEntries(new URLSearchParams(raw));
  return send(res, 200, clientApi(f, ip));
}

// ---------------------------------------------------------------- static files + router
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'";

function serveStatic(req, res, pathname) {
  let rel = pathname === '/' ? '/index.html' : pathname;
  const full = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!full.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, 'Forbidden', 'text/plain');
  fs.readFile(full, (err, buf) => {
    if (err) return send(res, 404, 'Not found', 'text/plain');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream', 'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (pathname.startsWith('/api/v1/admin/')) return await handleAdmin(req, res, pathname);
    if ((pathname === '/api/1.2/' || pathname === '/api/1.2') && req.method === 'POST') return await handleClientApi(req, res);
    if (pathname.startsWith('/api/')) return send(res, 404, { ok: false, success: false, message: 'Not found' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain');
    return serveStatic(req, res, pathname);
  } catch (e) {
    if (!res.headersSent) send(res, 500, { ok: false, success: false, message: 'Server error' });
    console.error('[error]', e && e.message);
  }
});
server.listen(PORT, HOST, () => console.log(`XERXES server listening on http://${HOST}:${PORT}`));
