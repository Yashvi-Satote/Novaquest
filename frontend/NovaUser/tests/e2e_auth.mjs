/**
 * NovaQuest guest-first authentication end-to-end browser test.
 *
 * Prereqs:
 *   backend:  python backend/app.py
 *   frontend: npm run build && npm run preview -- --host 127.0.0.1
 *
 * Run from frontend/:
 *   node NovaUser/tests/e2e_auth.mjs
 *
 * The test exercises the guest experience first, then creates a temporary
 * Firebase email/password account through the public Identity Toolkit REST API,
 * checks optional sign-in, and deletes the Firebase account afterwards. It also
 * leaves the temporary PostgreSQL row for the standard test cleanup (email
 * prefix ``ui.e2e.``).
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
const clickText = async (selector, text) => {
  await page.evaluate(
    ({ selector: targetSelector, text: targetText }) => {
      const element = [...document.querySelectorAll(targetSelector)].find((node) =>
        node.textContent.trim().includes(targetText),
      );
      if (!element) throw new Error(`No ${targetSelector} containing "${targetText}"`);
      element.click();
    },
    { selector, text },
  );
};
const storedSettings = () =>
  page.evaluate(() => {
    const raw = localStorage.getItem('novaquest_game_settings');
    return raw ? JSON.parse(raw) : null;
  });
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
let cleanedUp = false;

try {
  await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 1 });

  console.log('1. The app opens on /app as a guest');
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/app');
  await waitForText('NEW GAME');
  assert.ok(await page.$('a[href="/novamap"]'), 'Guest must see NovaMap navigation');
  assert.ok(await page.$('a[href="/novabase"]'), 'Guest must see Novabase navigation');
  assert.ok(
    await page.$('a[href="/novauser/signin"]'),
    'Guest must see the optional Sign in link',
  );
  await page.screenshot({ path: join(SHOTS, 'guest-app.png'), fullPage: true });

  console.log('2. Guests can open NovaMap, Novabase and Settings directly');
  await page.goto(`${BASE}/novamap`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/novamap');
  await waitForText('NovaMap');
  await page.goto(`${BASE}/novabase`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/novabase');
  await waitForText('Novabase');
  await page.goto(`${BASE}/settings#account`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/settings');
  await waitForText("YOU'RE PLAYING AS A GUEST");
  assert.ok(
    await page.$('section a[href="/novauser/signin"]'),
    'Guest account card must offer sign in',
  );
  assert.ok(
    await page.$('section a[href="/novauser/register"]'),
    'Guest account card must offer account creation',
  );
  await page.screenshot({ path: join(SHOTS, 'guest-settings-account.png'), fullPage: true });

  console.log('3. Guest settings persist on this device');
  await page.goto(`${BASE}/settings#game`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/settings');
  await waitForText('Game Settings');
  await clickText('button[role="tab"]', 'Graphics');
  await clickText('button', 'Ultra');
  await clickText('button', 'Save Changes');
  await waitForText('saved on this device');
  assert.equal((await storedSettings())?.graphics?.qualityPreset, 'Ultra');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForText('Game Settings');
  assert.equal((await storedSettings())?.graphics?.qualityPreset, 'Ultra');
  await page.screenshot({ path: join(SHOTS, 'guest-settings-game.png'), fullPage: true });

  console.log('4. Sign-in is optional and can return to the app');
  await page.goto(`${BASE}/settings#account`, { waitUntil: 'domcontentloaded' });
  await clickText('section a[href="/novauser/signin"]', 'Sign in');
  await waitForPath('/novauser/signin');
  await waitForText('Welcome back');
  assert.ok(await page.$('a[href="/app"]'), 'Auth page must offer Back to NovaQuest');
  await clickText('a[href="/app"]', 'Continue as guest');
  await waitForPath('/app');
  await waitForText('NEW GAME');
  await page.goto(`${BASE}/novauser/signin?redirect=%2Fnovabase`, {
    waitUntil: 'domcontentloaded',
  });
  await waitForPath('/novauser/signin');
  await clickText('a[href="/app"]', 'Back to NovaQuest');
  await waitForPath('/app');
  assert.equal((await storedSettings())?.graphics?.qualityPreset, 'Ultra', 'Guest data must survive auth-page visits');

  console.log('5. Register a new account from the guest settings card');
  await page.goto(`${BASE}/settings#account`, { waitUntil: 'domcontentloaded' });
  await waitForText("YOU'RE PLAYING AS A GUEST");
  await clickText('section a[href="/novauser/register"]', 'Create account');
  await waitForPath('/novauser/register');
  await waitForText('Create account');
  await page.type('#register-fullName', NAME);
  await page.type('#register-email', EMAIL);
  await page.type('#register-password', PASSWORD);
  await page.click('button[type="submit"]');
  await waitForPath('/settings');
  await waitForText('Account');
  await waitForText(EMAIL);

  const afterRegister = await session();
  assert.equal(afterRegister.status, 200, JSON.stringify(afterRegister.body));
  assert.equal(afterRegister.body.user.email, EMAIL);
  assert.equal(afterRegister.body.user.full_name, NAME);
  assert.equal(afterRegister.body.user.auth_provider, 'password');
  assert.equal(afterRegister.body.user.email_verified, false);
  const visibleCookies = await page.evaluate(() => document.cookie);
  assert.ok(!visibleCookies.includes('novauser_token'), 'JWT cookie must stay HTTP-only');
  assert.equal(
    (await storedSettings())?.graphics?.qualityPreset,
    'Ultra',
    'Signing in must not replace local settings with defaults',
  );
  await page.screenshot({ path: join(SHOTS, 'authenticated-settings.png'), fullPage: true });

  console.log('6. Signed-in users see an initials avatar and the account card');
  await page.goto(`${BASE}/app`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/app');
  await waitForText('NEW GAME');
  await page.waitForSelector('a[aria-label^="Account settings for"]');
  const avatar = await page.$('a[aria-label^="Account settings for"]');
  assert.ok(avatar, 'Signed-in users must see an account avatar');
  assert.equal(await avatar.evaluate((node) => node.getAttribute('href')), '/settings#account');
  assert.equal(await avatar.evaluate((node) => node.textContent.trim()), 'UE');
  await page.screenshot({ path: join(SHOTS, 'authenticated-app.png'), fullPage: true });

  console.log('7. A persisted session survives a full refresh');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForPath('/app');
  await waitForText('NEW GAME');
  const afterRefresh = await session();
  assert.equal(afterRefresh.status, 200, JSON.stringify(afterRefresh.body));
  assert.equal(afterRefresh.body.user.email, EMAIL);

  console.log('8. Signing out returns to /app as a guest and keeps local data');
  await page.goto(`${BASE}/settings#account`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/settings');
  await page.waitForSelector('button[aria-label="Sign out of NovaUser"]');
  await page.click('button[aria-label="Sign out of NovaUser"]');
  await waitForPath('/app');
  await waitForText('NEW GAME');
  assert.ok(await page.$('a[href="/novauser/signin"]'), 'Signed-out users must see Sign in again');
  const afterLogout = await session();
  assert.equal(afterLogout.status, 401);
  assert.equal(
    (await storedSettings())?.graphics?.qualityPreset,
    'Ultra',
    'Signing out must not wipe local guest data',
  );

  console.log('9. Invalid credentials show a friendly Firebase error');
  await page.goto(`${BASE}/novauser/signin`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#signin-email');
  await page.type('#signin-email', EMAIL);
  await page.type('#signin-password', 'WrongPass9');
  await page.click('button[type="submit"]');
  await waitForText('Email address or password is incorrect.');
  assert.equal(await currentPath(), '/novauser/signin');

  console.log('10. Signing in from Settings returns to Settings');
  await page.goto(`${BASE}/settings#account`, { waitUntil: 'domcontentloaded' });
  await waitForText("YOU'RE PLAYING AS A GUEST");
  await clickText('section a[href="/novauser/signin"]', 'Sign in');
  await waitForPath('/novauser/signin');
  await page.type('#signin-email', EMAIL);
  await page.type('#signin-password', PASSWORD);
  await page.click('button[type="submit"]');
  await waitForPath('/settings');
  await waitForText(EMAIL);
  assert.equal(await page.evaluate(() => location.hash), '#account');
  const afterSignIn = await session();
  assert.equal(afterSignIn.status, 200);
  assert.equal(afterSignIn.body.user.email, EMAIL);

  console.log('11. Signed-in users skip optional auth pages');
  await page.goto(`${BASE}/novauser/signin`, { waitUntil: 'domcontentloaded' });
  await waitForPath('/app');
  await waitForText('NEW GAME');

  console.log('12. Sign out again to test duplicate registration');
  await page.goto(`${BASE}/settings#account`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button[aria-label="Sign out of NovaUser"]');
  await page.click('button[aria-label="Sign out of NovaUser"]');
  await waitForPath('/app');
  await page.goto(`${BASE}/novauser/register`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#register-email');
  await page.type('#register-fullName', NAME);
  await page.type('#register-email', EMAIL);
  await page.type('#register-password', PASSWORD);
  await page.click('button[type="submit"]');
  await waitForText('already exists');
  assert.equal(await currentPath(), '/novauser/register');

  console.log('13. Sign-in page remains responsive on mobile');
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
  cleanedUp = true;
  console.log(`\nAll browser checks passed. ${cleanupMessage} Screenshots: ${SHOTS}`);
} finally {
  await browser.close();
  if (!cleanedUp) {
    await deleteFirebaseAccount();
  }
}
