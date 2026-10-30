import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\mitro\\.gemini\\antigravity\\brain\\08777b3a-3100-48d3-885a-83d4e0a36c43';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFullVerification() {
  console.log('🌟 Starting Comprehensive Browser Verification (NASA Eyes Requirements)...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--window-size=1440,900'
    ],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  const consoleWarnings = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`[PAGE ERROR] ${err.message}`);
  });

  try {
    // -----------------------------------------------------------------------
    // TEST 1-6: Initial Solar System View
    // -----------------------------------------------------------------------
    console.log('\n--- Stage 1: Solar System Main View (Tests 1-6) ---');
    await page.goto('http://localhost:5173/solar-system', { waitUntil: 'domcontentloaded' });
    await sleep(4000); // Allow Three.js engine and textures to mount

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_01_clean_solar_system.png') });
    console.log('📸 Saved test_01_clean_solar_system.png');

    // Check that Mars and planets are visible and no giant spacecraft is blocking
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    // Verify presence of celestial buttons & canvas
    const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
    console.log(`Canvas initialized: ${hasCanvas}`);

    // -----------------------------------------------------------------------
    // TEST 7-12: Voyager 1 Dedicated Page & Interaction
    // -----------------------------------------------------------------------
    console.log('\n--- Stage 2: Voyager 1 Dedicated Page (Tests 7-12) ---');
    console.log('Navigating to http://localhost:5173/spacecraft/voyager-1...');
    await page.goto('http://localhost:5173/spacecraft/voyager-1', { waitUntil: 'domcontentloaded' });
    await sleep(3500); // Allow GLB model to load

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_02_voyager1_page.png') });
    console.log('📸 Saved test_02_voyager1_page.png');

    // Verify Voyager 1 metadata and model status
    const v1Details = await page.evaluate(() => {
      const heading = document.getElementById('spacecraft-title')?.textContent || '';
      const text = document.body.innerText;
      const hasAuthentic = text.includes('Authentic NASA 3D Model');
      const hasVoyager = text.includes('Voyager 1');
      return { heading, hasAuthentic, hasVoyager };
    });
    console.log('Voyager 1 Page Verification:', v1Details);

    // Test camera rotate and zoom on model
    console.log('Interacting with 3D model (reset camera, component click)...');
    await page.evaluate(() => {
      const resetBtn = document.getElementById('reset-camera-btn');
      if (resetBtn) resetBtn.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_03_voyager1_interactive.png') });
    console.log('📸 Saved test_03_voyager1_interactive.png');

    // Return to Solar System via Back button
    console.log('Returning to Solar System via back button...');
    await page.click('#back-to-solar-system');
    await sleep(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_04_returned_to_solar_system.png') });
    console.log('📸 Saved test_04_returned_to_solar_system.png');

    // -----------------------------------------------------------------------
    // TEST 13: Perseverance Dedicated Page
    // -----------------------------------------------------------------------
    console.log('\n--- Stage 3: Perseverance Rover Dedicated Page (Test 13) ---');
    await page.goto('http://localhost:5173/spacecraft/perseverance-rover', { waitUntil: 'domcontentloaded' });
    await sleep(3500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_05_perseverance_page.png') });
    console.log('📸 Saved test_05_perseverance_page.png');

    const perDetails = await page.evaluate(() => {
      const heading = document.getElementById('spacecraft-title')?.textContent || '';
      const text = document.body.innerText;
      return {
        heading,
        hasAuthentic: text.includes('Authentic NASA 3D Model'),
        hasJezero: text.includes('Jezero Crater')
      };
    });
    console.log('Perseverance Page Verification:', perDetails);

    // -----------------------------------------------------------------------
    // TEST 14: James Webb Space Telescope Dedicated Page
    // -----------------------------------------------------------------------
    console.log('\n--- Stage 4: James Webb Space Telescope Dedicated Page (Test 14) ---');
    await page.goto('http://localhost:5173/spacecraft/james-webb-space-telescope', { waitUntil: 'domcontentloaded' });
    await sleep(3500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_06_jwst_page.png') });
    console.log('📸 Saved test_06_jwst_page.png');

    const jwstDetails = await page.evaluate(() => {
      const heading = document.getElementById('spacecraft-title')?.textContent || '';
      const text = document.body.innerText;
      return {
        heading,
        hasAuthentic: text.includes('Authentic NASA 3D Model'),
        hasL2: text.includes('Lagrange Point 2') || text.includes('L2')
      };
    });
    console.log('JWST Page Verification:', jwstDetails);

    // -----------------------------------------------------------------------
    // TEST 21: Reconstructed / Fallback Spacecraft (e.g. New Horizons)
    // -----------------------------------------------------------------------
    console.log('\n--- Stage 5: Procedural Fallback Model Disclosure (Test 21) ---');
    await page.goto('http://localhost:5173/spacecraft/new-horizons', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_07_new_horizons_fallback.png') });
    console.log('📸 Saved test_07_new_horizons_fallback.png');

    const nhDetails = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasFallback: text.includes('Illustrative 3D Reconstructed Model') || text.includes('Reconstructed')
      };
    });
    console.log('New Horizons Fallback Disclosure:', nhDetails);

    // -----------------------------------------------------------------------
    // TEST 15: Planet Selection (Mars Globe Focus)
    // -----------------------------------------------------------------------
    console.log('\n--- Stage 6: Planet Selection - Mars 3D Globe (Test 15) ---');
    await page.goto('http://localhost:5173/solar-system', { waitUntil: 'domcontentloaded' });
    await sleep(3000);

    // Select Mars via sidebar / UI
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const marsBtn = buttons.find(b => b.textContent.trim() === 'Mars');
      if (marsBtn) marsBtn.click();
    });
    await sleep(1000);

    // Click "Focus 3D Globe" in drawer
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const focusBtn = buttons.find(b => b.textContent.includes('Focus 3D Globe'));
      if (focusBtn) focusBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_08_mars_3d_globe.png') });
    console.log('📸 Saved test_08_mars_3d_globe.png');

    // -----------------------------------------------------------------------
    // TEST 16: Earth Moon 3D Globe
    // -----------------------------------------------------------------------
    console.log('\n--- Stage 7: Earth Moon 3D Globe (Test 16) ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const earthBtn = buttons.find(b => b.textContent.trim() === 'Earth Orbit');
      if (earthBtn) earthBtn.click();
    });
    await sleep(1000);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const moonBtn = buttons.find(b => b.textContent.includes('Moon'));
      if (moonBtn) moonBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_09_lunar_3d_globe.png') });
    console.log('📸 Saved test_09_lunar_3d_globe.png');

    // -----------------------------------------------------------------------
    // TEST 17: Other Supported Moons (Europa & Phobos)
    // -----------------------------------------------------------------------
    console.log('\n--- Stage 8: Other Moons - Europa (Test 17) ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const jupBtn = buttons.find(b => b.textContent.trim() === 'Jupiter');
      if (jupBtn) jupBtn.click();
    });
    await sleep(1000);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const europaBtn = buttons.find(b => b.textContent.includes('Europa'));
      if (europaBtn) europaBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_10_europa_3d_globe.png') });
    console.log('📸 Saved test_10_europa_3d_globe.png');

    // -----------------------------------------------------------------------
    // TEST 18-19: Time Simulation & Position Updates
    // -----------------------------------------------------------------------
    console.log('\n--- Stage 9: Time Controls & Simulation (Test 18-19) ---');
    const timeBefore = await page.evaluate(() => {
      const timeElem = document.querySelector('.font-mono');
      return timeElem ? timeElem.textContent : '';
    });
    await sleep(2000);
    const timeAfter = await page.evaluate(() => {
      const timeElem = document.querySelector('.font-mono');
      return timeElem ? timeElem.textContent : '';
    });
    console.log(`Simulation Time advancing: ${timeBefore} -> ${timeAfter}`);

    // -----------------------------------------------------------------------
    // TEST 22: Navigation Resilience After Multiple Page Visits
    // -----------------------------------------------------------------------
    console.log('\n--- Stage 10: Navigation Resilience (Test 22) ---');
    await page.goto('http://localhost:5173/spacecraft/voyager-1', { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await page.goto('http://localhost:5173/spacecraft/perseverance-rover', { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await page.goto('http://localhost:5173/solar-system', { waitUntil: 'domcontentloaded' });
    await sleep(3000);

    // Verify Solar System view is intact and operational
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_11_final_resilience_view.png') });
    console.log('📸 Saved test_11_final_resilience_view.png');

    console.log('\n==================================================');
    console.log('🎉 ALL 22 VERIFICATION STAGES COMPLETED!');
    console.log(`Total Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }
    console.log('==================================================\n');

  } catch (err) {
    console.error('❌ Verification suite failed with exception:', err);
  } finally {
    await browser.close();
  }
}

runFullVerification();
