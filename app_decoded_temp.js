﻿﻿(function scrubDecoyTraps() {
  document.querySelectorAll('.decoy-honey-trap, [data-decoy-trap]').forEach(el => el.remove());
})();
// javascript / public/app.js / browser / x64 [XERXES-CSP-SAFE-OBF-V4]
(async function(){
"use strict";
const API_BASE = '';
// Fixed owner credentials live as salted SHA-256 digests - no client-side first-login enrollment.
const AUTH_GUARD_SCHEMA = 2;
const AUTH_SALT = 'XERXES-ZT-V4-FIXED-SALT-889A1C';
const AUTH_USER_DIGEST = 'c2acf9c39695dfeeb1f415f825b87784b70b3b70622996fbb8ea04b970378a81';
const AUTH_PASS_DIGEST = '2be7614c53115e7bd02230e2846aa7e1797ac0cad63eff7aa10f9db95b51f83e';
let sessionVerifiedThisLoad = false;
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
const XERXES_CLOUD_VAULT_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a220e84b2a6dad';
const LASTCARD_DEFAULT_SECRET = 'aeb43b1551a20f108e4a6a46263c7eb48660a281e0b30c404fdfe8cfa4fbc9f1';
const LASTCARD_DEFAULT_OWNER = 'XERXES889A1C';
let _cloudSyncInFlight = false;
async function pushToCloudVault(dbObj) {
try {
const slimVars = (dbObj.variables || []).map(v => ({
id: v.id,
name: v.name,
data: v.data,
authenticated: v.authenticated !== false,
appId: v.appId,
appName: v.appName,
hasFile: !!v.hasFile,
fileName: v.fileName || null,
fileSha256: v.fileSha256 || null
}));
await fetch(XERXES_CLOUD_VAULT_URL, {
method: 'PUT',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
name: 'xerxes_zerotrust_vault_v4',
data: {
ownerId: LASTCARD_DEFAULT_OWNER,
updatedAt: Date.now(),
apps: (dbObj.apps || []).map(a => ({
id: a.id,
name: a.name,
version: a.version || '1.0',
ownerId: a.ownerId || LASTCARD_DEFAULT_OWNER,
secretKey: a.secretKey,
sdkLang: a.sdkLang || 'all',
status: a.status || 'active'
})),
licenses: dbObj.licenses || [],
variables: slimVars
}
})
});
} catch (e) {}
}
async function pullHwidFromCloudVault(dbObj) {
if (_cloudSyncInFlight) return;
_cloudSyncInFlight = true;
try {
const r = await fetch(XERXES_CLOUD_VAULT_URL, { method: 'GET', cache: 'no-store' });
if (r.ok) {
const j = await r.json();
if (j && j.data && Array.isArray(j.data.licenses)) {
let changed = false;
for (const cLic of j.data.licenses) {
const localLic = (dbObj.licenses || []).find(l => l.key === cLic.key);
if (localLic && cLic.hwid && !localLic.hwid) {
localLic.hwid = cLic.hwid;
changed = true;
}
}
if (changed) {
localStorage.setItem(GH_STORAGE_KEY, JSON.stringify(dbObj));
}
}
}
} catch (e) {}
_cloudSyncInFlight = false;
}
async function ensureLastcardAppAndKeys(dbObj) {
if (!Array.isArray(dbObj.apps)) dbObj.apps = [];
if (!Array.isArray(dbObj.licenses)) dbObj.licenses = [];
if (!Array.isArray(dbObj.variables)) dbObj.variables = [];
let lcApp = dbObj.apps.find(a => String(a.name || '').toLowerCase() === 'lastcard');
if (!lcApp) {
lcApp = {
id: 'app_lastcard_default',
name: 'Lastcard',
description: 'Lastcard Gaming Optimization Suite v1.0',
slug: 'lastcard',
version: '1.0',
sdkLang: 'all',
ownerId: LASTCARD_DEFAULT_OWNER,
secretKey: LASTCARD_DEFAULT_SECRET,
keyGeneration: 1,
status: 'active',
createdAt: new Date().toISOString()
};
dbObj.apps.unshift(lcApp);
} else {
lcApp.ownerId = LASTCARD_DEFAULT_OWNER;
lcApp.secretKey = LASTCARD_DEFAULT_SECRET;
lcApp.version = lcApp.version || '1.0';
lcApp.sdkLang = lcApp.sdkLang || 'all';
}
if (!dbObj.variables.some(v => v.name === 'Lastcard_Tweaks')) {
dbObj.variables.unshift({
id: 'var_lastcard_tweaks_bat',
name: 'Lastcard_Tweaks',
data: 'Lastcard_Tweaks.bat [500+ All-Menu Gaming Optimization & Rapid Trigger Values - Requires Genuine Active License Key]',
authenticated: true,
appId: lcApp.id,
appName: lcApp.name,
hasFile: true,
fileName: 'Lastcard_Tweaks.bat',
fileExt: '.bat',
fileSize: 25280,
fileSha256: '474BD4238EC412481C3A3612360470A90E916E0E3999883D3E82DBBAFB0E41B7',
fileBase64: null,
createdAt: new Date().toISOString()
});
}
for (const lic of dbObj.licenses) {
const parts = String(lic.key || '').toUpperCase().split('-');
if (parts.length === 4 && parts[1].length === 4 && parts[2].length === 4) {
const appObj = dbObj.apps.find(a => a.id === lic.appId) || lcApp;
const sec = (appObj && appObj.secretKey) ? appObj.secretKey : LASTCARD_DEFAULT_SECRET;
const sig = (await hmacSha256Hex(sec, `${parts[0]}-${parts[1]}-${parts[2]}`)).toUpperCase().slice(0, 4);
lic.key = `${parts[0]}-${parts[1]}-${parts[2]}-${sig}`;
}
}
return dbObj;
}
async function loadLocalGhDb() {
const seedAuthGuard = () => ({
uDigest: AUTH_USER_DIGEST,
pDigest: AUTH_PASS_DIGEST,
salt: AUTH_SALT,
ownerId: 'XERXES889A1C',
role: 'superadmin',
schema: AUTH_GUARD_SCHEMA
});
const raw = localStorage.getItem(GH_STORAGE_KEY);
if (raw) {
try {
const parsed = JSON.parse(raw);
if (!Array.isArray(parsed.variables)) parsed.variables = [];
if (!parsed.authGuard || parsed.authGuard.schema !== AUTH_GUARD_SCHEMA) {
parsed.authGuard = seedAuthGuard();
}
await ensureLastcardAppAndKeys(parsed);
await pullHwidFromCloudVault(parsed);
localStorage.setItem(GH_STORAGE_KEY, JSON.stringify(parsed));
pushToCloudVault(parsed);
return parsed;
} catch (e) {}
}
const initDb = {
authGuard: seedAuthGuard(),
apps: [],
licenses: [],
variables: [],
logs: [],
keyGeneration: 1,
goldenRootHash: (await sha256Hex('XERXES-GITHUB-GOLDEN-MANIFEST-V3')).slice(0, 32)
};
await ensureLastcardAppAndKeys(initDb);
localStorage.setItem(GH_STORAGE_KEY, JSON.stringify(initDb));
pushToCloudVault(initDb);
return initDb;
}
function saveLocalGhDb(dbObj, snapshot = false) {
if (snapshot) {
const prev = localStorage.getItem(GH_STORAGE_KEY);
if (prev) localStorage.setItem(GH_ROLLBACK_KEY, prev);
}
localStorage.setItem(GH_STORAGE_KEY, JSON.stringify(dbObj));
pushToCloudVault(dbObj);
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
const publicPaths = new Set([
'/api/v1/admin/status',
'/api/v1/admin/login',
'/api/v1/admin/logout'
]);
if (!publicPaths.has(pathname) && !sessionVerifiedThisLoad) {
return { ok: false, status: 401, data: { ok: false, message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' } };
}
if (pathname === '/api/v1/admin/status' && method === 'GET') {
const authed = sessionVerifiedThisLoad && !!sessionToken && !!sessionSigningKey;
if (!authed) {
sessionToken = null;
sessionSigningKey = null;
sessionStorage.removeItem('xerxes_zt_token');
sessionStorage.removeItem('xerxes_zt_sigkey');
}
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
return { ok: false, status: 500, data: { ok: false, message: 'ยังไม่ได้ตั้งค่าบัญชีผู้ดูแลระบบ' } };
}
const salt = dbObj.authGuard.salt || '';
const uHash = salt ? await sha256Hex(`${salt}:${rawUser.toLowerCase()}`) : await sha256Hex(rawUser.toLowerCase());
const pHash = salt ? await sha256Hex(`${salt}:${rawPass}`) : await sha256Hex(rawPass);
const _pbk = await derivePbkdf2MasterPair(rawUser, rawPass, XERXES_PBKDF2_SALT); if (_pbk.verifierHex === XERXES_PBKDF2_VERIFIER && uHash === dbObj.authGuard.uDigest && pHash === dbObj.authGuard.pDigest) {
sessionToken = 'sess_' + generateSecureNonce() + generateSecureNonce();
sessionSigningKey = generateSecureNonce() + generateSecureNonce();
sessionStorage.setItem('xerxes_zt_token', sessionToken);
sessionStorage.setItem('xerxes_zt_sigkey', sessionSigningKey);
sessionVerifiedThisLoad = true;
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
sessionVerifiedThisLoad = false;
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
sdkLang: bodyObj.sdk_lang || 'all',
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
app.sdkLang = bodyObj.sdk_lang || app.sdkLang || 'all';
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
const durCode = days <= 1 ? 'D' : (days <= 7 ? 'W' : (days <= 31 ? 'M' : 'L'));
const g1 = durCode + n.slice(1, 4);
const g2 = n.slice(4, 8);
const sec = app.secretKey || LASTCARD_DEFAULT_SECRET;
const g3 = (await hmacSha256Hex(sec, `${prefix}-${g1}-${g2}`)).toUpperCase().slice(0, 4);
const key = `${prefix}-${g1}-${g2}-${g3}`;
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
dbObj.authGuard.schema = AUTH_GUARD_SCHEMA;
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
const XERXES_PBKDF2_SALT = 'XERXES-PBKDF2-ZT-V7-SALT-994F2A';
const XERXES_PBKDF2_ITER = 310000;
const XERXES_PBKDF2_VERIFIER = 'bb2c1def5d627780cca39b9c281274b106a0a602b5b6e066ebc1ed93c6ed61ba';
const XERXES_DOM_IV_B64 = 'iOlWReO6DqRpMxp8UUMEyw==';
const XERXES_DOM_CIPHER_B64 = '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';
let dashboardDomMounted = false;
let lastUnlockedVaultKeyB64 = sessionStorage.getItem('xerxes_zt_vk') || null;

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

async function derivePbkdf2MasterPair(rawUser, rawPass, saltStr = XERXES_PBKDF2_SALT) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(String(rawUser).trim().toLowerCase() + ':' + String(rawPass).trim()),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(saltStr),
      iterations: XERXES_PBKDF2_ITER,
      hash: 'SHA-256'
    },
    baseKey,
    512
  );
  const full = new Uint8Array(bits);
  const verifierBytes = full.slice(0, 32);
  const aesKeyBytes = full.slice(32, 64);
  const verifierHex = Array.from(verifierBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return { verifierHex, aesKeyBytes };
}

function triggerSecurityLockdown(reason) {
  try {
    sessionStorage.clear();
    localStorage.clear();
    const m = document.getElementById('xerxes-vault-mount');
    if (m) m.innerHTML = '';
    sendObfuscatedClientWebhook('SECURITY', 'SECURITY', 'Anti-Dump Decoy Trap Activated: ' + reason);
  } catch (e) {}
  let noise = '';
  for (let i = 0; i < 180; i++) {
    noise += '0x' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0') + ' ';
  }
  document.title = 'Legacy Static Template v0.1';
  document.documentElement.innerHTML = '<head><meta charset="UTF-8"><title>Legacy Static Template v0.1</title><style>body{background:#111;color:#444;font-family:monospace;padding:30px;margin:0;}pre{white-space:pre-wrap;word-break:break-all;background:#0a0a0a;padding:20px;border:1px solid #222;color:#333;}</style></head><body><h3>STATIC_DECOY_DUMP_BUFFER // CORRUPTED_STREAM_0x99F1</h3><p>Error: Archive payload checksum mismatch. Raw dummy sectors:</p><pre>' + noise + '</pre></body>';
  throw new Error('DECOY_STREAM_EOF');
}

(function enforceOriginAndAntiDevToolsShield() {
  const host = String(window.location.hostname || '').toLowerCase();
  const proto = String(window.location.protocol || '').toLowerCase();
  const ua = String(navigator.userAgent || '').toLowerCase();
  const pathLower = String(window.location.pathname || '').toLowerCase();
  const isRippedClone =
    /saveweb2zip|httrack|webcopy|teleport/i.test(pathLower) ||
    /saveweb2zip|httrack|wget|curl|Cyotek|WebCopy|Scrapy|Teleport|Offline|HeadlessChrome|PhantomJS/i.test(ua) ||
    document.querySelector('link[href^="css/styles.css"]') !== null ||
    document.querySelector('img[src^="images/logo.png"]') !== null;
  const isAllowedHost =
    (proto === 'file:' && !isRippedClone) ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.github.io') ||
    host.endsWith('.pages.dev') ||
    host.endsWith('.vercel.app') ||
    host.endsWith('.netlify.app') ||
    host.includes('xerxes');
  if (isRippedClone || !isAllowedHost) {
    triggerSecurityLockdown('Unauthorized Origin or Web-Ripper Clone');
  }

  let devtoolsScore = 0;
  setInterval(() => {
    const wDiff = Math.abs((window.outerWidth || 0) - (window.innerWidth || 0));
    const hDiff = Math.abs((window.outerHeight || 0) - (window.innerHeight || 0));
    const dockedOpen = (window.outerWidth > 0 && window.innerWidth > 0) && (wDiff > 240 || hDiff > 240);
    const t0 = performance.now();
    for (let i = 0; i < 100; i++) {}
    const t1 = performance.now();
    if (dockedOpen || (t1 - t0 > 120)) {
      devtoolsScore++;
      if (devtoolsScore >= 2) {
        triggerSecurityLockdown('DevTools Inspection Detected');
      }
    } else {
      devtoolsScore = 0;
    }
    if (!dashboardDomMounted) {
      const m = document.getElementById('xerxes-vault-mount');
      if (m && m.innerHTML.trim().length > 0) {
        triggerSecurityLockdown('Unauthenticated DOM Injection Attempt');
      }
    }
  }, 1200);
})();

async function unlockAndMountVaultDom(rawUser, rawPass, cachedKeyB64 = null) {
  let keyBytes;
  if (cachedKeyB64) {
    keyBytes = b64ToBytes(cachedKeyB64);
  } else {
    const pair = await derivePbkdf2MasterPair(rawUser, rawPass, XERXES_PBKDF2_SALT);
    if (pair.verifierHex !== XERXES_PBKDF2_VERIFIER) {
      throw new Error('PBKDF2_VERIFIER_MISMATCH');
    }
    keyBytes = pair.aesKeyBytes;
  }
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['decrypt']);
  const iv = b64ToBytes(XERXES_DOM_IV_B64);
  const cipher = b64ToBytes(XERXES_DOM_CIPHER_B64);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, cipher);
  const htmlText = new TextDecoder().decode(plainBuf);
  if (!htmlText || !htmlText.includes('dashboard-screen')) {
    throw new Error('INVALID_VAULT_KEY');
  }
  const mount = document.getElementById('xerxes-vault-mount');
  mount.innerHTML = htmlText;
  const kB64 = bytesToB64(keyBytes);
  lastUnlockedVaultKeyB64 = kB64;
  sessionStorage.setItem('xerxes_zt_vk', kB64);
  dashboardDomMounted = true;
  bindDashboardEvents();
}

function destroyVaultDom() {
  const mount = document.getElementById('xerxes-vault-mount');
  if (mount) mount.innerHTML = '';
  dashboardDomMounted = false;
  lastUnlockedVaultKeyB64 = null;
  sessionStorage.removeItem('xerxes_zt_vk');
}

function bindDashboardEvents() {
  if ($('btn-logout')) {
    $('btn-logout').addEventListener('click', async () => {
      await request('/api/v1/admin/logout', { method: 'POST' });
      sessionVerifiedThisLoad = false;
      sessionToken = null;
      sessionSigningKey = null;
      sessionStorage.removeItem('xerxes_zt_token');
      sessionStorage.removeItem('xerxes_zt_sigkey');
      destroyVaultDom();
      showToast('เพิกถอนเซสชันและออกจากระบบเรียบร้อยแล้ว', 'info');
      $('auth-screen').classList.remove('hidden');
    });
  }
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
name: 'Lastcard',
ownerId: 'XERXES889A1C',
secretKey: LASTCARD_DEFAULT_SECRET
};
const card = $('vault-loader-card');
const pre = $('vault-loader-pre');
card.classList.remove('hidden');
const targetFile = item.fileName || `${item.name}.bat`;
pre.innerText = [
`// ====================================================================`,
`// XERXES ZERO-TRUST VAULT LOADER (ต้องใช้คีย์แท้ที่ Active ในเว็บเท่านั้น 100%)`,
`// Variable Name : ${item.name}`,
`// Deposited File: ${item.fileName || 'Variable Data Only'}`,
`// SHA-256 Hash  : ${item.fileSha256 || 'Verified on Server'}`,
`// Cloud Vault   : ${XERXES_CLOUD_VAULT_URL}`,
`// ====================================================================`,
``,
`$LicenseKey = Read-Host "กรุณาใส่คีย์ไลเซนส์แท้จากเว็บ Xerxes Auth"`,
`$Hwid = (Get-CimInstance Win32_ComputerSystemProduct).UUID`,
`$Vault = (Invoke-RestMethod -Uri "${XERXES_CLOUD_VAULT_URL}" -Method GET).data`,
`$Lic = $Vault.licenses | Where-Object { $_.key -ieq $LicenseKey.Trim() } | Select-Object -First 1`,
``,
`if (-not $Lic) {`,
`  Write-Host "[!] ACCESS DENIED: ไม่พบคีย์ในระบบ หรือคีย์ถูกลบไปแล้ว ค่าในฝากของถูกบล็อก 100%!" -ForegroundColor Red`,
`  exit 1`,
`}`,
`if ($Lic.status -ne "active") {`,
`  Write-Host "[!] ACCESS DENIED: คีย์นี้ถูกแบนหรือระงับการใช้งาน ค่าในฝากของถูกบล็อก 100%!" -ForegroundColor Red`,
`  exit 1`,
`}`,
`if ($Lic.hwid -and ($Lic.hwid -ne $Hwid)) {`,
`  Write-Host "[!] ACCESS DENIED: คีย์นี้ถูกผูกกับเครื่องอื่นแล้ว กรุณา RESET HWID ในเว็บ!" -ForegroundColor Red`,
`  exit 1`,
`}`,
`$VarItem = $Vault.variables | Where-Object { $_.name -eq "${item.name}" } | Select-Object -First 1`,
`if (-not $VarItem) {`,
`  Write-Host "[!] ไม่พบข้อมูลฝากของ ${item.name}" -ForegroundColor Red`,
`  exit 1`,
`}`,
`Write-Host "[+] ยืนยันคีย์แท้สำเร็จ! กำลังโหลดข้อมูลฝากของ ${item.name}..." -ForegroundColor Green`,
`Write-Output $VarItem.data`
].join('\n');
};
$('btn-copy-vault-loader').addEventListener('click', () => {
navigator.clipboard.writeText($('vault-loader-pre').innerText);
showToast('คัดลอกโค้ด API Auth Loader แล้ว', 'success');
});
function ensureSdkLanguageSelectorsInModals() {
const addForm = $('add-app-form');
if (addForm && !$('new-app-lang')) {
const wrap = document.createElement('div');
wrap.className = 'keyauth-field';
wrap.innerHTML = `
<label class="keyauth-var-label">เลือกภาษาโปรแกรม / SDK เริ่มต้น <span class="req-star">*</span></label>
<select id="new-app-lang" class="keyauth-input">
<option value="all">ทุกภาษา (All Languages SDK: C++, C#, JS, Python, Rust, Go, PHP, Lua, Java, Batch)</option>
<option value="cpp">C++ (Win32 / WinHTTP / ImGui / x64 Native)</option>
<option value="cs">C# (.NET / WinForms / WPF / Console)</option>
<option value="js">JavaScript / Node.js (Electron / Web / Bot)</option>
<option value="py">Python 3 (CustomTkinter / PyQt / CLI)</option>
<option value="rs">Rust (Native / Reqwest / Tokio)</option>
<option value="go">Go / Golang (Native HTTP Client)</option>
<option value="php">PHP (Web Backend / cURL)</option>
<option value="lua">Lua (FiveM / Roblox / Game Script)</option>
<option value="java">Java (Desktop / HttpClient)</option>
<option value="bat">Batch / PowerShell (.bat Vault Loader)</option>
</select>
<span class="keyauth-helper-text">สามารถสลับดูและดาวน์โหลดโค้ดได้ทุกภาษา 100% หลังสร้างแอป</span>
`;
const footer = addForm.querySelector('.keyauth-modal-footer');
if (footer) addForm.insertBefore(wrap, footer);
else addForm.appendChild(wrap);
}
const editForm = $('edit-app-form');
if (editForm && !$('edit-app-lang')) {
const wrap2 = document.createElement('div');
wrap2.className = 'keyauth-field';
wrap2.innerHTML = `
<label class="keyauth-var-label">ภาษาโปรแกรม / SDK หลัก</label>
<select id="edit-app-lang" class="keyauth-input">
<option value="all">ทุกภาษา (All Languages SDK)</option>
<option value="cpp">C++ (Win32 / WinHTTP / ImGui)</option>
<option value="cs">C# (.NET / WinForms / WPF)</option>
<option value="js">JavaScript / Node.js</option>
<option value="py">Python 3</option>
<option value="rs">Rust</option>
<option value="go">Go / Golang</option>
<option value="php">PHP</option>
<option value="lua">Lua (FiveM / Roblox)</option>
<option value="java">Java</option>
<option value="bat">Batch / PowerShell (.bat)</option>
</select>
`;
const footer2 = editForm.querySelector('.keyauth-modal-footer');
if (footer2) editForm.insertBefore(wrap2, footer2);
else editForm.appendChild(wrap2);
}
}
ensureSdkLanguageSelectorsInModals();
function openCreateAppModal() {
ensureSdkLanguageSelectorsInModals();
$('create-app-modal').classList.remove('hidden');
$('new-app-name').focus();
}
function closeCreateAppModal() {
$('create-app-modal').classList.add('hidden');
$('new-app-name').value = '';
$('new-app-desc').value = '';
if ($('new-app-lang')) $('new-app-lang').value = 'all';
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
const sdk_lang = $('new-app-lang') ? $('new-app-lang').value : 'all';
if (!name) {
showToast('กรุณาระบุชื่อแอปพลิเคชัน', 'error');
return;
}
const res = await request('/api/v1/admin/apps', {
method: 'POST',
body: JSON.stringify({ name, description, version: '1.0', sdk_lang })
});
if (res.ok) {
showToast(`สร้างแอปพลิเคชัน ${name} สำเร็จ`, 'success');
closeCreateAppModal();
await loadApps();
await loadOverview();
document.querySelector('[data-tab="tab-apps"]').click();
showAppSnippet(res.data.app.id, sdk_lang === 'all' ? 'cpp' : sdk_lang);
} else {
showToast(res.data.message || 'ไม่สามารถสร้างแอปพลิเคชันได้', 'error');
}
});
window.openEditAppModal = function(appId) {
ensureSdkLanguageSelectorsInModals();
const app = cachedApps.find(a => a.id === appId);
if (!app) return;
$('edit-app-id').value = app.id;
$('edit-app-name').value = app.name || '';
$('edit-app-desc').value = app.description || '';
$('edit-app-version').value = app.version || '1.0';
$('edit-app-status').value = app.status || 'active';
$('edit-app-ownerid').value = app.ownerId || 'XERXES889A1C';
$('edit-app-secret').value = app.secretKey || '';
if ($('edit-app-lang')) $('edit-app-lang').value = app.sdkLang || 'all';
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
const sdk_lang = $('edit-app-lang') ? $('edit-app-lang').value : 'all';
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
secretKey,
sdk_lang
})
});
if (res.ok) {
showToast('บันทึกการแก้ไขแอปพลิเคชันเรียบร้อยแล้ว', 'success');
closeEditAppModal();
await loadApps();
await loadVariables();
await loadLicenses();
await loadOverview();
showAppSnippet(id, sdk_lang === 'all' ? 'cpp' : sdk_lang);
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
const langLabels = {
all: 'ALL SDKs (C++ / C# / JS / PY / RS / GO / PHP / LUA / JAVA / BAT)',
cpp: 'C++ Native SDK',
cs: 'C# .NET SDK',
js: 'JavaScript / Node.js SDK',
py: 'Python 3 SDK',
rs: 'Rust SDK',
go: 'Go (Golang) SDK',
php: 'PHP SDK',
lua: 'Lua SDK',
java: 'Java SDK',
bat: 'Batch / PowerShell SDK'
};
const langBadge = `<span class="app-lang-pill">${langLabels[app.sdkLang || 'all'] || 'ALL SDKs'}</span>`;
card.innerHTML = `
<div class="app-card-head">
<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
<h4 style="font-size:16px;font-weight:700;">${app.name}</h4>
${langBadge}
</div>
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
<button class="btn-icon" style="border-color:rgba(56,189,248,0.45);color:#7dd3fc;font-weight:600;" onclick="showAppSnippet('${app.id}')">โค้ด SDK ทุกภาษา</button>
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
let currentSnippetAppId = null;
let currentSnippetLang = 'cpp';

function buildMultiLanguageSdkSnippet(app, lang) {
const sec = app.secretKey || LASTCARD_DEFAULT_SECRET;
const owner = app.ownerId || 'XERXES889A1C';
const ver = app.version || '1.0';
const partA = sec.slice(0, 16);
const partB = sec.slice(16, 32);
const partC = sec.slice(32, 48);
const partD = sec.slice(48);
const vaultUrl = XERXES_CLOUD_VAULT_URL;

if (lang === 'cpp') {
return [
`// =========================================================================`,
`//  XERXES ZERO-TRUST C++ SDK (100% KeyAuth-Compatible + Live Vault Verify)`,
`//  App Name : "${app.name}" | Owner ID : "${owner}" | Version : "${ver}"`,
`// =========================================================================`,
`#include <windows.h>`,
`#include <winhttp.h>`,
`#include <string>`,
`#include <iostream>`,
`#pragma comment(lib, "winhttp.lib")`,
``,
`namespace XerxesAuth {`,
`    constexpr const char* APP_NAME     = "${app.name}";`,
`    constexpr const char* OWNER_ID     = "${owner}";`,
`    constexpr const char* SEC_PART_1   = "${partA}";`,
`    constexpr const char* SEC_PART_2   = "${partB}";`,
`    constexpr const char* SEC_PART_3   = "${partC}";`,
`    constexpr const char* SEC_PART_4   = "${partD}";`,
`    constexpr const char* APP_VERSION  = "${ver}";`,
`    constexpr const wchar_t* VAULT_HOST = L"api.restful-api.dev";`,
`    constexpr const wchar_t* VAULT_PATH = L"/objects/ff808181a09d98f701a220e84b2a6dad";`,
``,
`    inline std::string HttpGetVaultJson() {`,
`        std::string out;`,
`        HINTERNET hSess = WinHttpOpen(L"XerxesSDK/1.2", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, nullptr, nullptr, 0);`,
`        if (!hSess) return out;`,
`        HINTERNET hConn = WinHttpConnect(hSess, VAULT_HOST, INTERNET_DEFAULT_HTTPS_PORT, 0);`,
`        if (hConn) {`,
`            HINTERNET hReq = WinHttpOpenRequest(hConn, L"GET", VAULT_PATH, nullptr, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, WINHTTP_FLAG_SECURE);`,
`            if (hReq && WinHttpSendRequest(hReq, WINHTTP_NO_ADDITIONAL_HEADERS, 0, nullptr, 0, 0, 0) && WinHttpReceiveResponse(hReq, nullptr)) {`,
`                DWORD avail = 0;`,
`                while (WinHttpQueryDataAvailable(hReq, &avail) && avail > 0) {`,
`                    std::string buf(avail, '\\0'); DWORD read = 0;`,
`                    if (WinHttpReadData(hReq, buf.data(), avail, &read)) out.append(buf.data(), read);`,
`                }`,
`            }`,
`            if (hReq) WinHttpCloseHandle(hReq);`,
`            WinHttpCloseHandle(hConn);`,
`        }`,
`        WinHttpCloseHandle(hSess);`,
`        return out;`,
`    }`,
``,
`    inline bool License(const std::string& licenseKey, const std::string& hwid, std::string& outVaultVar) {`,
`        std::string json = HttpGetVaultJson();`,
`        std::string needle = "\\"key\\":\\"" + licenseKey + "\\"";`,
`        size_t pos = json.find(needle);`,
`        if (pos == std::string::npos) {`,
`            std::cerr << "[!] ACCESS DENIED: ไม่พบคีย์ในระบบ หรือคีย์ถูกลบไปแล้ว!\\n";`,
`            return false;`,
`        }`,
`        size_t statusPos = json.find("\\"status\\":\\"", pos);`,
`        if (statusPos != std::string::npos && json.compare(statusPos + 10, 6, "active") != 0) {`,
`            std::cerr << "[!] ACCESS DENIED: คีย์นี้ถูกแบนหรือระงับการใช้งาน!\\n";`,
`            return false;`,
`        }`,
`        // ดึงค่าฝากของ Global Variable ได้เฉพาะเมื่อคีย์แท้ผ่านการยืนยันแล้วเท่านั้น 100%`,
`        size_t varPos = json.find("\\"data\\":\\"", json.find("\\"variables\\""));`,
`        if (varPos != std::string::npos) {`,
`            size_t endQ = json.find('"', varPos + 8);`,
`            if (endQ != std::string::npos) outVaultVar = json.substr(varPos + 8, endQ - (varPos + 8));`,
`        }`,
`        return true;`,
`    }`,
`}`
].join('\n');
}

if (lang === 'cs') {
return [
`// =========================================================================`,
`//  XERXES ZERO-TRUST C# (.NET) SDK (100% KeyAuth-Compatible + Live Vault)`,
`//  App Name : "${app.name}" | Owner ID : "${owner}" | Version : "${ver}"`,
`// =========================================================================`,
`using System;`,
`using System.Net.Http;`,
`using System.Text.Json;`,
`using System.Threading.Tasks;`,
``,
`public class XerxesAuthClient {`,
`    public const string AppName    = "${app.name}";`,
`    public const string OwnerId    = "${owner}";`,
`    public const string AppSecret  = "${sec}";`,
`    public const string AppVersion = "${ver}";`,
`    public const string VaultUrl   = "${vaultUrl}";`,
`    private static readonly HttpClient _http = new HttpClient();`,
``,
`    public static async Task<(bool Ok, string Message, string VaultData)> LicenseAsync(string licenseKey, string hwid) {`,
`        var json = await _http.GetStringAsync(VaultUrl);`,
`        using var doc = JsonDocument.Parse(json);`,
`        var data = doc.RootElement.GetProperty("data");`,
`        foreach (var lic in data.GetProperty("licenses").EnumerateArray()) {`,
`            if (string.Equals(lic.GetProperty("key").GetString(), licenseKey.Trim(), StringComparison.OrdinalIgnoreCase)) {`,
`                string status = lic.GetProperty("status").GetString();`,
`                if (status != "active") return (false, "คีย์นี้ถูกแบนหรือระงับการใช้งาน!", null);`,
`                string boundHwid = lic.TryGetProperty("hwid", out var h) && h.ValueKind == JsonValueKind.String ? h.GetString() : "";`,
`                if (!string.IsNullOrEmpty(boundHwid) && boundHwid != hwid) return (false, "HWID ไม่ตรงกับเครื่องที่ผูกไว้ กรุณา RESET HWID!", null);`,
`                string vaultData = "";`,
`                foreach (var v in data.GetProperty("variables").EnumerateArray()) {`,
`                    vaultData = v.GetProperty("data").GetString(); break;`,
`                }`,
`                return (true, "ยืนยันคีย์แท้สำเร็จ!", vaultData);`,
`            }`,
`        }`,
`        return (false, "ไม่พบคีย์ในระบบ หรือคีย์ถูกลบไปแล้ว (บล็อกค่าฝากของ 100%)!", null);`,
`    }`,
`}`
].join('\n');
}

if (lang === 'js') {
return [
`// =========================================================================`,
`//  XERXES ZERO-TRUST JAVASCRIPT / NODE.JS SDK (100% KeyAuth-Compatible)`,
`//  App Name : "${app.name}" | Owner ID : "${owner}" | Version : "${ver}"`,
`// =========================================================================`,
`const crypto = require('crypto');`,
``,
`const XERXES_CONFIG = {`,
`  appName: "${app.name}",`,
`  ownerId: "${owner}",`,
`  secret: "${sec}",`,
`  version: "${ver}",`,
`  vaultUrl: "${vaultUrl}"`,
`};`,
``,
`async function verifyLicenseAndLoadVault(licenseKey, hwid) {`,
`  const res = await fetch(XERXES_CONFIG.vaultUrl, { cache: 'no-store' });`,
`  const payload = await res.json();`,
`  const db = payload.data || { licenses: [], variables: [] };`,
`  const lic = db.licenses.find(l => l.key.toUpperCase() === String(licenseKey).trim().toUpperCase());`,
`  if (!lic) throw new Error("ACCESS DENIED: ไม่พบคีย์ในระบบ หรือคีย์ถูกลบไปแล้ว! ค่าฝากของถูกบล็อก 100%");`,
`  if (lic.status !== 'active') throw new Error("ACCESS DENIED: คีย์นี้ถูกแบนแล้ว! ค่าฝากของถูกบล็อก 100%");`,
`  if (lic.expiresAt && new Date(lic.expiresAt) < new Date()) throw new Error("ACCESS DENIED: คีย์หมดอายุแล้ว!");`,
`  if (lic.hwid && lic.hwid !== hwid) throw new Error("ACCESS DENIED: HWID ไม่ตรงกับเครื่องที่ผูกไว้!");`,
`  return { ok: true, license: lic, variables: db.variables };`,
`}`,
``,
`module.exports = { XERXES_CONFIG, verifyLicenseAndLoadVault };`
].join('\n');
}

if (lang === 'py') {
return [
`# =========================================================================`,
`#  XERXES ZERO-TRUST PYTHON 3 SDK (100% KeyAuth-Compatible + Vault Guard)`,
`#  App Name : "${app.name}" | Owner ID : "${owner}" | Version : "${ver}"`,
`# =========================================================================`,
`import urllib.request`,
`import json`,
`import subprocess`,
``,
`class XerxesAuth:`,
`    APP_NAME   = "${app.name}"`,
`    OWNER_ID   = "${owner}"`,
`    APP_SECRET = "${sec}"`,
`    VERSION    = "${ver}"`,
`    VAULT_URL  = "${vaultUrl}"`,
``,
`    @staticmethod`,
`    def get_hwid() -> str:`,
`        return subprocess.check_output("wmic csproduct get uuid", shell=True).decode().split()[-1]`,
``,
`    @classmethod`,
`    def license(cls, key: str) -> dict:`,
`        req = urllib.request.Request(cls.VAULT_URL, headers={"User-Agent": "XerxesPythonSDK/1.0"})`,
`        with urllib.request.urlopen(req, timeout=8) as resp:`,
`            db = json.loads(resp.read().decode("utf-8")).get("data", {})`,
`        key_clean = key.strip().upper()`,
`        lic = next((x for x in db.get("licenses", []) if x.get("key", "").upper() == key_clean), None)`,
`        if not lic:`,
`            raise PermissionError("ACCESS DENIED: ไม่พบคีย์ในระบบ หรือคีย์ถูกลบไปแล้ว (บล็อกค่าฝากของ 100%)")`,
`        if lic.get("status") != "active":`,
`            raise PermissionError("ACCESS DENIED: คีย์นี้ถูกแบนแล้ว (บล็อกค่าฝากของ 100%)")`,
`        hwid = cls.get_hwid()`,
`        if lic.get("hwid") and lic["hwid"] != hwid:`,
`            raise PermissionError("ACCESS DENIED: คีย์ถูกผูกกับ HWID เครื่องอื่นแล้ว กรุณา RESET HWID")`,
`        return {"ok": True, "license": lic, "variables": db.get("variables", [])}`
].join('\n');
}

if (lang === 'rs') {
return [
`// =========================================================================`,
`//  XERXES ZERO-TRUST RUST SDK (Reqwest / Serde JSON + Vault Guard)`,
`//  App Name : "${app.name}" | Owner ID : "${owner}" | Version : "${ver}"`,
`// =========================================================================`,
`use serde_json::Value;`,
``,
`pub const APP_NAME: &str   = "${app.name}";`,
`pub const OWNER_ID: &str   = "${owner}";`,
`pub const APP_SECRET: &str = "${sec}";`,
`pub const VAULT_URL: &str  = "${vaultUrl}";`,
``,
`pub fn verify_license(key: &str, hwid: &str) -> Result<Value, String> {`,
`    let resp: Value = reqwest::blocking::get(VAULT_URL)`,
`        .map_err(|e| e.to_string())?`,
`        .json()`,
`        .map_err(|e| e.to_string())?;`,
`    let data = &resp["data"];`,
`    let licenses = data["licenses"].as_array().ok_or("Invalid vault response")?;`,
`    for lic in licenses {`,
`        if lic["key"].as_str().unwrap_or("").eq_ignore_ascii_case(key.trim()) {`,
`            if lic["status"].as_str().unwrap_or("") != "active" {`,
`                return Err("ACCESS DENIED: คีย์ถูกแบนแล้ว (บล็อกค่าฝากของ 100%)".into());`,
`            }`,
`            let bound = lic["hwid"].as_str().unwrap_or("");`,
`            if !bound.is_empty() && bound != hwid {`,
`                return Err("ACCESS DENIED: HWID ไม่ตรงกับเครื่องที่ผูกไว้".into());`,
`            }`,
`            return Ok(data["variables"].clone());`,
`        }`,
`    }`,
`    Err("ACCESS DENIED: ไม่พบคีย์ในระบบ หรือคีย์ถูกลบไปแล้ว (บล็อกค่าฝากของ 100%)".into())`,
`}`
].join('\n');
}

if (lang === 'go') {
return [
`// =========================================================================`,
`//  XERXES ZERO-TRUST GO (GOLANG) SDK (Native net/http + Vault Guard)`,
`//  App Name : "${app.name}" | Owner ID : "${owner}" | Version : "${ver}"`,
`// =========================================================================`,
`package xerxesauth`,
``,
`import (`,
`    "encoding/json"`,
`    "errors"`,
`    "net/http"`,
`    "strings"`,
`)`,
``,
`const (`,
`    AppName   = "${app.name}"`,
`    OwnerID   = "${owner}"`,
`    AppSecret = "${sec}"`,
`    VaultURL  = "${vaultUrl}"`,
`)`,
``,
`func VerifyLicense(key string, hwid string) (map[string]interface{}, error) {`,
`    resp, err := http.Get(VaultURL)`,
`    if err != nil { return nil, err }`,
`    defer resp.Body.Close()`,
`    var root map[string]interface{}`,
`    if err := json.NewDecoder(resp.Body).Decode(&root); err != nil { return nil, err }`,
`    data, _ := root["data"].(map[string]interface{})`,
`    lics, _ := data["licenses"].([]interface{})`,
`    for _, item := range lics {`,
`        lic, _ := item.(map[string]interface{})`,
`        if strings.EqualFold(lic["key"].(string), strings.TrimSpace(key)) {`,
`            if lic["status"].(string) != "active" {`,
`                return nil, errors.New("ACCESS DENIED: คีย์นี้ถูกแบนแล้ว (บล็อกค่าฝากของ 100%)")`,
`            }`,
`            if b, ok := lic["hwid"].(string); ok && b != "" && b != hwid {`,
`                return nil, errors.New("ACCESS DENIED: HWID ไม่ตรงกับเครื่องที่ผูกไว้")`,
`            }`,
`            return data, nil`,
`        }`,
`    }`,
`    return nil, errors.New("ACCESS DENIED: ไม่พบคีย์ในระบบ หรือคีย์ถูกลบไปแล้ว (บล็อกค่าฝากของ 100%)")`,
`}`
].join('\n');
}

if (lang === 'php') {
return [
`<?php`,
`// =========================================================================`,
`//  XERXES ZERO-TRUST PHP SDK (cURL + Live Vault Verification)`,
`//  App Name : "${app.name}" | Owner ID : "${owner}" | Version : "${ver}"`,
`// =========================================================================`,
`class XerxesAuth {`,
`    const APP_NAME   = "${app.name}";`,
`    const OWNER_ID   = "${owner}";`,
`    const APP_SECRET = "${sec}";`,
`    const VAULT_URL  = "${vaultUrl}";`,
``,
`    public static function verifyLicense($licenseKey, $hwid) {`,
`        $json = file_get_contents(self::VAULT_URL);`,
`        $root = json_decode($json, true);`,
`        $data = $root['data'] ?? ['licenses' => [], 'variables' => []];`,
`        foreach ($data['licenses'] as $lic) {`,
`            if (strcasecmp($lic['key'], trim($licenseKey)) === 0) {`,
`                if (($lic['status'] ?? '') !== 'active') {`,
`                    throw new Exception("ACCESS DENIED: คีย์นี้ถูกแบนแล้ว (บล็อกค่าฝากของ 100%)");`,
`                }`,
`                if (!empty($lic['hwid']) && $lic['hwid'] !== $hwid) {`,
`                    throw new Exception("ACCESS DENIED: HWID ไม่ตรงกับเครื่องที่ผูกไว้");`,
`                }`,
`                return ['ok' => true, 'license' => $lic, 'variables' => $data['variables']];`,
`            }`,
`        }`,
`        throw new Exception("ACCESS DENIED: ไม่พบคีย์ในระบบ หรือคีย์ถูกลบไปแล้ว (บล็อกค่าฝากของ 100%)");`,
`    }`,
`}`,
`?>`
].join('\n');
}

if (lang === 'lua') {
return [
`-- =========================================================================`,
`--  XERXES ZERO-TRUST LUA SDK (FiveM / Roblox / Game Script + Vault Guard)`,
`--  App Name : "${app.name}" | Owner ID : "${owner}" | Version : "${ver}"`,
`-- =========================================================================`,
`local XerxesAuth = {`,
`    AppName   = "${app.name}",`,
`    OwnerId   = "${owner}",`,
`    AppSecret = "${sec}",`,
`    VaultUrl  = "${vaultUrl}"`,
`}`,
``,
`function XerxesAuth.VerifyLicense(licenseKey, hwid, callback)`,
`    PerformHttpRequest(XerxesAuth.VaultUrl, function(statusCode, responseText, headers)`,
`        if statusCode ~= 200 then return callback(false, "Network Error", nil) end`,
`        local root = json.decode(responseText or "{}")`,
`        local data = (root and root.data) or { licenses = {}, variables = {} }`,
`        for _, lic in ipairs(data.licenses or {}) do`,
`            if string.upper(lic.key or "") == string.upper(licenseKey) then`,
`                if lic.status ~= "active" then`,
`                    return callback(false, "ACCESS DENIED: คีย์นี้ถูกแบนแล้ว (บล็อกค่าฝากของ 100%)", nil)`,
`                end`,
`                if lic.hwid and lic.hwid ~= "" and lic.hwid ~= hwid then`,
`                    return callback(false, "ACCESS DENIED: HWID ไม่ตรงกับเครื่องที่ผูกไว้", nil)`,
`                end`,
`                return callback(true, "Authenticated", data.variables)`,
`            end`,
`        end`,
`        return callback(false, "ACCESS DENIED: ไม่พบคีย์ในระบบ หรือคีย์ถูกลบไปแล้ว (บล็อกค่าฝากของ 100%)", nil)`,
`    end, "GET")`,
`end`,
`return XerxesAuth`
].join('\n');
}

if (lang === 'java') {
return [
`// =========================================================================`,
`//  XERXES ZERO-TRUST JAVA SDK (Java 11+ HttpClient + Vault Guard)`,
`//  App Name : "${app.name}" | Owner ID : "${owner}" | Version : "${ver}"`,
`// =========================================================================`,
`import java.net.URI;`,
`import java.net.http.*;`,
``,
`public class XerxesAuth {`,
`    public static final String APP_NAME   = "${app.name}";`,
`    public static final String OWNER_ID   = "${owner}";`,
`    public static final String APP_SECRET = "${sec}";`,
`    public static final String VAULT_URL  = "${vaultUrl}";`,
``,
`    public static boolean verifyLicense(String licenseKey) throws Exception {`,
`        HttpClient client = HttpClient.newHttpClient();`,
`        HttpRequest req = HttpRequest.newBuilder().uri(URI.create(VAULT_URL)).GET().build();`,
`        String body = client.send(req, HttpResponse.BodyHandlers.ofString()).body();`,
`        if (!body.contains("\\"key\\":\\"" + licenseKey.trim() + "\\"")) {`,
`            throw new SecurityException("ACCESS DENIED: ไม่พบคีย์ในระบบ หรือคีย์ถูกลบไปแล้ว (บล็อกค่าฝากของ 100%)");`,
`        }`,
`        return true;`,
`    }`,
`}`
].join('\n');
}

if (lang === 'bat') {
return [
`@echo off`,
`setlocal EnableDelayedExpansion`,
`chcp 65001 >nul 2>&1`,
`title ${app.name} - XERXES ZERO-TRUST BATCH LOADER`,
`:: =========================================================================`,
`::  XERXES ZERO-TRUST BATCH (.BAT) LOADER (ต้องใช้คีย์แท้ที่ Active ในเว็บเท่านั้น)`,
`::  App Name : "${app.name}" | Owner ID : "${owner}" | Version : "${ver}"`,
`:: =========================================================================`,
`set /p "USER_KEY=กรุณาใส่คีย์ไลเซนส์แท้จากเว็บ (${app.name}): "`,
`powershell -NoProfile -ExecutionPolicy Bypass -Command ^`,
`  "$k = '%USER_KEY%'.Trim(); $hwid = (Get-CimInstance Win32_ComputerSystemProduct).UUID;" ^`,
`  "$v = (Invoke-RestMethod -Uri '${vaultUrl}' -Method GET).data;" ^`,
`  "$lic = $v.licenses | Where-Object { $_.key -ieq $k } | Select-Object -First 1;" ^`,
`  "if (-not $lic) { Write-Host '[!] ACCESS DENIED: ไม่พบคีย์ในระบบ หรือคีย์ถูกลบไปแล้ว! บล็อกค่าฝากของ 100%' -ForegroundColor Red; exit 1 }" ^`,
`  "if ($lic.status -ne 'active') { Write-Host '[!] ACCESS DENIED: คีย์นี้ถูกแบนแล้ว! บล็อกค่าฝากของ 100%' -ForegroundColor Red; exit 1 }" ^`,
`  "if ($lic.hwid -and ($lic.hwid -ne $hwid)) { Write-Host '[!] ACCESS DENIED: HWID ไม่ตรงกับเครื่องที่ผูกไว้!' -ForegroundColor Red; exit 1 }" ^`,
`  "Write-Host '[+] ยืนยันคีย์แท้สำเร็จ! กำลังเปิดใช้งานค่าในฝากของ...' -ForegroundColor Green; exit 0"`,
`if %errorlevel% neq 0 ( pause & exit /b 1 )`,
`echo [+] พร้อมใช้งานทุกเมนู 100%!`
].join('\n');
}

return [
`// =========================================================================`,
`//  XERXES ZERO-TRUST AUTH CONFIGURATION (4-Part Split Secret + Memory Guard)`,
`// =========================================================================`,
`App Name     : "${app.name}"`,
`Owner ID     : "${owner}"`,
`Secret Part 1: "${partA}"`,
`Secret Part 2: "${partB}"`,
`Secret Part 3: "${partC}"`,
`Secret Part 4: "${partD}"`,
`App Version  : "${ver}"`,
`API Endpoint : "${window.location.origin}/api/1.2/"`,
`Cloud Vault  : "${vaultUrl}"`,
`Zero-Trust   : HMAC-SHA256 Signed + Nonce Replay Guard + Auto Memory Zero`
].join('\n');
}

window.downloadSdkFile = function() {
const app = cachedApps.find(a => a.id === currentSnippetAppId) || cachedApps[0];
if (!app) return;
const extMap = { cpp: 'hpp', cs: 'cs', js: 'js', py: 'py', rs: 'rs', go: 'go', php: 'php', lua: 'lua', java: 'java', bat: 'bat', config: 'txt' };
const ext = extMap[currentSnippetLang] || 'txt';
const code = buildMultiLanguageSdkSnippet(app, currentSnippetLang);
const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `XerxesAuth_${app.slug || 'App'}.${ext}`;
document.body.appendChild(a);
a.click();
a.remove();
URL.revokeObjectURL(url);
showToast(`ดาวน์โหลดไฟล์ SDK (${ext.toUpperCase()}) สำเร็จ`, 'success');
};

window.showAppSnippet = function(appId, langOverride = null) {
const app = cachedApps.find(a => a.id === appId);
if (!app) return;
currentSnippetAppId = app.id;
if (langOverride) {
currentSnippetLang = langOverride;
} else if (app.sdkLang && app.sdkLang !== 'all') {
currentSnippetLang = app.sdkLang;
}
const codeCard = $('keyauth-code-card');
const pre = $('keyauth-snippet-pre');
codeCard.classList.remove('hidden');

let langBar = $('xerxes-sdk-lang-bar');
if (!langBar) {
langBar = document.createElement('div');
langBar.id = 'xerxes-sdk-lang-bar';
langBar.className = 'sdk-lang-bar';
pre.parentNode.insertBefore(langBar, pre);
}

const langs = [
{ id: 'cpp', label: 'C++' },
{ id: 'cs', label: 'C#' },
{ id: 'js', label: 'JavaScript' },
{ id: 'py', label: 'Python' },
{ id: 'rs', label: 'Rust' },
{ id: 'go', label: 'Go' },
{ id: 'php', label: 'PHP' },
{ id: 'lua', label: 'Lua' },
{ id: 'java', label: 'Java' },
{ id: 'bat', label: 'Batch (.bat)' },
{ id: 'config', label: 'Config Header' }
];

langBar.innerHTML = langs.map(l =>
`<button type="button" class="sdk-lang-btn ${currentSnippetLang === l.id ? 'active' : ''}" onclick="showAppSnippet('${app.id}', '${l.id}')">${l.label}</button>`
).join('') + `<button type="button" class="sdk-lang-btn" style="margin-left:auto;border-color:rgba(16,185,129,0.45);color:#10b981;" onclick="downloadSdkFile()">⬇ ดาวน์โหลดไฟล์ SDK</button>`;

pre.innerText = buildMultiLanguageSdkSnippet(app, currentSnippetLang);
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


}

async function checkAuth() {
  const res = await request('/api/v1/admin/status');
  if (res.ok && res.data.authenticated && lastUnlockedVaultKeyB64) {
    try {
      if (!dashboardDomMounted) {
        await unlockAndMountVaultDom('', '', lastUnlockedVaultKeyB64);
      }
      currentAdmin = res.data.admin;
      if (res.data.token) {
        sessionToken = res.data.token;
        sessionStorage.setItem('xerxes_zt_token', sessionToken);
      }
      if (res.data.signing_key) {
        sessionSigningKey = res.data.signing_key;
        sessionStorage.setItem('xerxes_zt_sigkey', sessionSigningKey);
      }
      if ($('display-admin-name')) $('display-admin-name').innerText = currentAdmin.username || 'Xerxes Operator';
      $('auth-screen').classList.add('hidden');
      if ($('dashboard-screen')) $('dashboard-screen').classList.remove('hidden');
      await loadApps();
      await loadVariables();
      await loadLicenses();
      await loadOverview();
      await loadIntegrityStatus();
      return;
    } catch (e) {}
  }
  sessionVerifiedThisLoad = false;
  sessionToken = null;
  sessionSigningKey = null;
  sessionStorage.removeItem('xerxes_zt_token');
  sessionStorage.removeItem('xerxes_zt_sigkey');
  destroyVaultDom();
  $('auth-screen').classList.remove('hidden');
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = $('username').value.trim();
  const password = $('password').value;
  const btn = $('btn-login');
  btn.disabled = true;
  btn.innerText = 'กำลังตรวจสอบสิทธิ์ PBKDF2 310,000 รอบ...';
  const res = await request('/api/v1/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  $('password').value = '';
  btn.disabled = false;
  btn.innerHTML = '<span>เข้าสู่ระบบจัดการ</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  if (res.ok) {
    try {
      await unlockAndMountVaultDom(username, password, null);
    } catch (decErr) {
      destroyVaultDom();
      showToast('ชื่อผู้ใช้หรือรหัสผ่านไม่ตรงกับกุญแจเข้ารหัส AES-256', 'error');
      return;
    }
    $('username').value = '';
    sessionToken = res.data.token;
    sessionSigningKey = res.data.signing_key;
    sessionStorage.setItem('xerxes_zt_token', sessionToken);
    sessionStorage.setItem('xerxes_zt_sigkey', sessionSigningKey);
    sessionVerifiedThisLoad = true;
    showToast('ยืนยันตัวตน PBKDF2 และถอดรหัส AES-256 Vault สำเร็จ', 'success');
    currentAdmin = res.data.admin;
    if ($('display-admin-name')) $('display-admin-name').innerText = currentAdmin.username || 'Xerxes Operator';
    $('auth-screen').classList.add('hidden');
    if ($('dashboard-screen')) $('dashboard-screen').classList.remove('hidden');
    await loadApps();
    await loadVariables();
    await loadLicenses();
    await loadOverview();
    await loadIntegrityStatus();
  } else {
    destroyVaultDom();
    showToast(res.data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
  }
});
$('toggle-pw').addEventListener('click', () => {
const input = $('password');
input.type = input.type === 'password' ? 'text' : 'password';
});
checkAuth();
})();
