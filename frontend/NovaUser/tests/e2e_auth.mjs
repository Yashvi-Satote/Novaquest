/**
 * NovaUser Firebase authentication end-to-end browser test.
 *
 * Prereqs:
 *   backend:  python backend/app.py
 *   frontend: npm run build && npm run preview -- --host 127.0.0.1
 *
 * Run from frontend/:
 *   node NovaUser/tests/e2e_auth.mjs
 *
 * The test creates a temporary Firebase email/password account through the
 * public Identity Toolkit REST API, exercises the complete UI flow, and deletes
 * the Firebase account afterwards.  It also leaves the temporary PostgreSQL row
 * for the standard test cleanup (email prefix ``ui.e2e.``).
 */

import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const HERE = dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = join(HERE, '..', '..');
const SHOTS = process.env.NOVAUSER_SCREENSHOT_DIR || join(HERE, 'screenshots');
const BASE = process.env.NOVAUSER_BASE_URL || 'http://127.0.0.1:5173';
const CHROME =
  process.env.CHROME_PATH ||
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((path) => existsSync(path));

const PASSWORD = 'OrbitPass9';
const EMAIL = `ui.e2e.${Date.now()}@example.test`;
const NAME = 'Ui E2E Orbit';

let firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || '';
try {
  const envText = readFileSync(join(FRONTEND_DIR, '.env'), 'utf8');
  const match = envText.match(/^\s*VITE_FIREBASE_API_KEY\s*=\s*(.+)\s*$/m);
  if (match) firebaseApiKey = match[1].trim();
} catch {
  // The test can still run if the key is supplied via the environment.
}

if (!CHROME) {
  throw new Error('No Chrome/Edge executable found. Set CHROME_PATH.');
}
if (!firebaseApiKey) {
  throw new Error('Firebase API key not found. Set VITE_FIREBASE_API_KEY.');
}
mkdirSync(SHOTS, { recursive: true });

async function deleteFirebaseAccount() {
  try {
    const signInResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true }),
      },
    );
    if (!signInResponse.ok) return false;
    const { idToken } = await signInResponse.json();
    const deleteResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      },
    );
    return deleteResponse.ok;
  } catch {
    return false;
  }
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-sync',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-first-run',
    '--renderer-process-limit=1',
    '--js-flags=--max-old-space-size=256',
  ],
});

const page = await browser.newPage();
page.setDefaultTimeout(45000);
page.setDefaultNavigationTimeout(45000);
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

const waitForText = (text) =>
  page.waitForFunction((value) => document.body.innerText.includes(value), {}, text);
const waitForPath = (path) =>
  page.waitForFunction((value) => location.pathname === value, {}, path);
const currentPath = () => page.evaluate(() => location.pathname);
const h1Text = () => page.$eval('h1', (node) => node.textContent.trim());
const clearInput = async (selector) => {
  await page.click(selector);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
};
const session = () =>
  page.evaluate(async () => {
    const response = await fetch('/api/novauser/auth/me', { credentials: 'include' });
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    return { status: response.status, body };
  });

let cleanupMessage = '';

try {
  await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 1 });

  console.log('1. Sign Up is the default entry point');
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/');
  await page.waitForSelector('h1');
  assert.equal(await h1Text(), 'Create account');
  assert.equal(await page.$('a[href="/novamap"]'), null, 'App navigation must be hidden before auth');
  assert.equal(await page.$('a[href="/novabase"]'), null, 'App navigation must be hidden before auth');
  await page.screenshot({ path: join(SHOTS, 'register-default.png'), fullPage: true });

  console.log('2. Sign Up / Sign In toggle works');
  await page.click('nav[aria-label="Authentication mode"] a[href="/novauser/signin"]');
  await waitForPath('/novauser/signin');
  await page.waitForSelector('h1');
  assert.equal(await h1Text(), 'Welcome back');
  await page.click('nav[aria-label="Authentication mode"] a[href="/"]');
  await waitForPath('/');
  await page.waitForSelector('h1');
  assert.equal(await h1Text(), 'Create account');

  console.log('3. Unauthenticated protected URL redirects to Sign Up');
  await page.goto(`${BASE}/settings`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/');
  await page.waitForSelector('h1');
  assert.equal(await h1Text(), 'Create account');

  console.log('4. Password visibility toggle and client validation');
  await page.type('#register-password', PASSWORD);
  await page.click('button[aria-label="Show password"]');
  assert.equal(await page.$eval('#register-password', (node) => node.type), 'text');
  await page.click('button[aria-label="Hide password"]');
  assert.equal(await page.$eval('#register-password', (node) => node.type), 'password');
  await clearInput('#register-password');
  await page.click('button[type="submit"]');
  await waitForText('Full name is required.');
  const validationText = await page.evaluate(() => document.body.innerText);
  assert.match(validationText, /Email address is required\./);
  assert.match(validationText, /Password is required\./);
  assert.equal(await currentPath(), '/');

  console.log('5. Register a new Firebase account and return to the protected URL');
  await page.type('#register-fullName', NAME);
  await page.type('#register-email', EMAIL);
  await page.type('#register-password', PASSWORD);
  await page.click('button[type="submit"]');
  await waitForPath('/settings');
  await waitForText('Settings');
  await waitForText('NovaQuest');

  const afterRegister = await session();
  assert.equal(afterRegister.status, 200, JSON.stringify(afterRegister.body));
  assert.equal(afterRegister.body.user.email, EMAIL);
  assert.equal(afterRegister.body.user.full_name, NAME);
  assert.equal(afterRegister.body.user.auth_provider, 'password');
  assert.equal(afterRegister.body.user.email_verified, false);
  const visibleCookies = await page.evaluate(() => document.cookie);
  assert.ok(!visibleCookies.includes('novauser_token'), 'JWT cookie must stay HTTP-only');
  await waitForText('not verified yet');
  await page.screenshot({ path: join(SHOTS, 'authenticated-settings.png'), fullPage: true });

  console.log('6. Persisted session survives a full refresh');
  await page.click('header a[href="/app"]');
  await waitForPath('/app');
  await waitForText('NEW GAME');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForPath('/app');
  await waitForText('NEW GAME');
  const afterRefresh = await session();
  assert.equal(afterRefresh.status, 200, JSON.stringify(afterRefresh.body));
  assert.equal(afterRefresh.body.user.email, EMAIL);
  await page.screenshot({ path: join(SHOTS, 'app-after-refresh.png'), fullPage: true });

  console.log('7. Logout clears the session and returns to Sign Up');
  // The NovaQuest main menu is full-screen and has no shared header, so open a
  // section with the header before using its sign-out control.
  await page.goto(`${BASE}/settings`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/settings');
  await page.waitForSelector('button[aria-label="Sign out of NovaUser"]');
  await page.click('button[aria-label="Sign out of NovaUser"]');
  await waitForPath('/');
  await page.waitForSelector('h1');
  assert.equal(await h1Text(), 'Create account');
  const afterLogout = await session();
  assert.equal(afterLogout.status, 401);

  console.log('8. Invalid credentials show a friendly Firebase error');
  await page.goto(`${BASE}/novauser/signin`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#signin-email');
  await page.type('#signin-email', EMAIL);
  await page.type('#signin-password', 'WrongPass9');
  await page.click('button[type="submit"]');
  await waitForText('Email address or password is incorrect.');
  assert.equal(await currentPath(), '/novauser/signin');

  console.log('9. Existing user signs in with Firebase email/password');
  await clearInput('#signin-password');
  await page.type('#signin-password', PASSWORD);
  await page.click('button[type="submit"]');
  await waitForPath('/app');
  await waitForText('NEW GAME');
  const afterSignIn = await session();
  assert.equal(afterSignIn.status, 200);
  assert.equal(afterSignIn.body.user.email, EMAIL);

  console.log('10. Authenticated users skip the auth pages');
  await page.goto(`${BASE}/novauser/signin`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/app');
  await waitForText('NEW GAME');

  console.log('11. Authenticated users can open any protected section directly');
  await page.goto(`${BASE}/novabase`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/novabase');
  await waitForText('NovaQuest');

  console.log('12. Logout then protected URL redirects back to Sign Up');
  await page.click('button[aria-label="Sign out of NovaUser"]');
  await waitForPath('/');
  await page.goto(`${BASE}/novabase`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/');
  await page.waitForSelector('h1');
  assert.equal(await h1Text(), 'Create account');

  console.log('13. Duplicate Firebase registration is rejected');
  await page.type('#register-fullName', NAME);
  await page.type('#register-email', EMAIL);
  await page.type('#register-password', PASSWORD);
  await page.click('button[type="submit"]');
  await waitForText('already exists');
  assert.equal(await currentPath(), '/');

  console.log('14. Sign-in page remains responsive on mobile');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/novauser/signin`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/novauser/signin');
  await page.waitForSelector('h1');
  assert.equal(await h1Text(), 'Welcome back');
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    false,
    'Mobile sign-in page must not overflow horizontally',
  );
  await page.screenshot({ path: join(SHOTS, 'signin-mobile.png'), fullPage: true });

  assert.deepEqual(pageErrors, [], `Unexpected page errors: ${pageErrors.join('; ')}`);
  cleanupMessage = (await deleteFirebaseAccount())
    ? 'Firebase test account deleted.'
    : 'Firebase test account could not be deleted automatically.';
  console.log(`\nAll browser checks passed. ${cleanupMessage} Screenshots: ${SHOTS}`);
} finally {
  await browser.close();
}
