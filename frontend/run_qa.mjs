import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\mitro\\project\\NQ';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTestSuite() {
  console.log('🚀 Starting Novaquest QA Verification Suite (NASA Eyes Explorer)...');

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
  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[CONSOLE ${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });

  page.on('pageerror', err => {
    errors.push(`[PAGE ERROR] ${err.stack || err.toString()}`);
  });

  try {
    // 1. Initial Load
    console.log('Step 1: Navigating to http://localhost:5173/solar-system...');
    await page.goto('http://localhost:5173/solar-system');
    await sleep(4000); // Allow React and Three.js engine and textures to mount
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_01_initial_scene.png') });
    console.log('✅ Step 1 complete: test_01_initial_scene.png');

    // 2. Select Mars (Testing Planet Click & Detailed 3D Globe)
    console.log('Step 2: Inspecting Mars 3D Globe & Celestial Drawer...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const marsCategory = buttons.find(b => b.textContent.trim() === 'Mars');
      if (marsCategory) marsCategory.click();
    });
    await sleep(1000);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const focusBtn = buttons.find(b => b.textContent.includes('Focus 3D Globe'));
      if (focusBtn) focusBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_02_mars_globe.png') });
    console.log('✅ Step 2 complete: test_02_mars_globe.png');

    // 3. Select Phobos Moon (Testing Moon Selection & Non-Spherical Geometry)
    console.log('Step 3: Focusing Phobos Moon...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const phobosBtn = buttons.find(b => b.textContent.includes('Phobos'));
      if (phobosBtn) phobosBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_03_phobos_moon.png') });
    console.log('✅ Step 3 complete: test_03_phobos_moon.png');

    // 4. Return to Mars and select Deimos Moon
    console.log('Step 4: Focusing Deimos Moon...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const marsLink = buttons.find(b => b.textContent.trim() === 'Mars');
      if (marsLink) marsLink.click();
    });
    await sleep(1500);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const deimosBtn = buttons.find(b => b.textContent.includes('Deimos'));
      if (deimosBtn) deimosBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_04_deimos_moon.png') });
    console.log('✅ Step 4 complete: test_04_deimos_moon.png');

    // 5. Select Earth & The Moon
    console.log('Step 5: Inspecting Earth 3D Globe & The Moon...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const earthCategory = buttons.find(b => b.textContent.trim() === 'Earth Orbit');
      if (earthCategory) earthCategory.click();
    });
    await sleep(1000);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const focusBtn = buttons.find(b => b.textContent.includes('Focus 3D Globe'));
      if (focusBtn) focusBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_05_earth_globe.png') });
    console.log('✅ Step 5 complete: test_05_earth_globe.png');

    // Focus The Moon from Earth's drawer
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const moonBtn = buttons.find(b => b.textContent.includes('The Moon'));
      if (moonBtn) moonBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_05b_lunar_globe.png') });
    console.log('✅ Step 5b complete: test_05b_lunar_globe.png');

    // 6. Select Jupiter & Europa
    console.log('Step 6: Inspecting Jupiter & Europa Ice Moon...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const jupCategory = buttons.find(b => b.textContent.trim() === 'Jupiter');
      if (jupCategory) jupCategory.click();
    });
    await sleep(1000);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const focusBtn = buttons.find(b => b.textContent.includes('Focus 3D Globe'));
      if (focusBtn) focusBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_06_jupiter_globe.png') });
    console.log('✅ Step 6 complete: test_06_jupiter_globe.png');

    // Focus Europa
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const europaBtn = buttons.find(b => b.textContent.includes('Europa'));
      if (europaBtn) europaBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_06b_europa_ice_globe.png') });
    console.log('✅ Step 6b complete: test_06b_europa_ice_globe.png');

    // 7. Return to Overview
    console.log('Step 7: Returning to Solar System Overview...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const retBtn = buttons.find(b => b.textContent.includes('Return to Solar System'));
      if (retBtn) retBtn.click();
      else {
        const overviewBtn = buttons.find(b => b.textContent.includes('Overview'));
        if (overviewBtn) overviewBtn.click();
      }
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_07_returned_overview.png') });
    console.log('✅ Step 7 complete: test_07_returned_overview.png');

    // 8. Select Voyager 1 (Testing Authentic NASA GLB Model)
    console.log('Step 8: Selecting Voyager 1 with Authentic NASA GLB 3D Model...');
    await page.evaluate(() => {
      const allFilter = document.getElementById('filter-all-btn');
      if (allFilter) allFilter.click();
      const input = document.querySelector('input[placeholder*="Search"]');
      if (input) input.value = '';
    });
    await sleep(500);
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type('Voyager 1');
      await sleep(1000);
    }
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, div'));
      const voyager = items.find(el => el.textContent.includes('Voyager 1') && el.classList.contains('cursor-pointer'));
      if (voyager) voyager.click();
    });
    await sleep(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_08_voyager1_authentic_model.png') });
    console.log('✅ Step 8 complete: test_08_voyager1_authentic_model.png');

    // 9. Select Perseverance Rover (Testing Authentic NASA Rover Model)
    console.log('Step 9: Selecting Perseverance Rover with Authentic NASA GLB Model...');
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search"]');
      if (input) input.value = '';
    });
    await sleep(500);
    const searchInput2 = await page.$('input[placeholder*="Search"]');
    if (searchInput2) {
      await searchInput2.type('Perseverance');
      await sleep(1000);
    }
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, div'));
      const rover = items.find(el => el.textContent.includes('Perseverance Rover') && el.classList.contains('cursor-pointer'));
      if (rover) rover.click();
    });
    await sleep(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_09_perseverance_authentic_model.png') });
    console.log('✅ Step 9 complete: test_09_perseverance_authentic_model.png');

    // 10. Select James Webb Space Telescope (JWST)
    console.log('Step 10: Selecting JWST with Authentic NASA GLB Model...');
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search"]');
      if (input) input.value = '';
    });
    await sleep(500);
    const searchInput3 = await page.$('input[placeholder*="Search"]');
    if (searchInput3) {
      await searchInput3.type('James Webb');
      await sleep(1000);
    }
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, div'));
      const jwst = items.find(el => el.textContent.includes('James Webb') && el.classList.contains('cursor-pointer'));
      if (jwst) jwst.click();
    });
    await sleep(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_10_jwst_authentic_model.png') });
    console.log('✅ Step 10 complete: test_10_jwst_authentic_model.png');

    // 11. Select New Horizons (Illustrative Procedural Fallback)
    console.log('Step 11: Selecting New Horizons (Illustrative Procedural Fallback)...');
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search"]');
      if (input) input.value = '';
    });
    await sleep(500);
    const searchInput4 = await page.$('input[placeholder*="Search"]');
    if (searchInput4) {
      await searchInput4.type('New Horizons');
      await sleep(1000);
    }
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, div'));
      const nh = items.find(el => el.textContent.includes('New Horizons') && el.classList.contains('cursor-pointer'));
      if (nh) nh.click();
    });
    await sleep(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_11_new_horizons_fallback.png') });
    console.log('✅ Step 11 complete: test_11_new_horizons_fallback.png');

    // 12. Mars Surface Landing Site Mode
    console.log('Step 12: Exploring Mars Surface Landing Site Mode...');
    // Search Perseverance
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search"]');
      if (input) input.value = '';
    });
    await sleep(500);
    const searchInput5 = await page.$('input[placeholder*="Search"]');
    if (searchInput5) {
      await searchInput5.type('Perseverance');
      await sleep(1000);
    }
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, div'));
      const rover = items.find(el => el.textContent.includes('Perseverance Rover') && el.classList.contains('cursor-pointer'));
      if (rover) rover.click();
    });
    await sleep(1500);
    await page.evaluate(() => {
      const surfaceBtn = document.getElementById('drawer-surface-btn') || 
        Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Explore Surface Landing Site'));
      if (surfaceBtn) surfaceBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_12_mars_surface_landing_site.png') });
    console.log('✅ Step 12 complete: test_12_mars_surface_landing_site.png');

    // Exit Surface Mode
    await page.evaluate(() => {
      const exitBtn = document.getElementById('exit-surface-btn');
      if (exitBtn) exitBtn.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_13_returned_from_surface.png') });
    console.log('✅ Step 13 complete: test_13_returned_from_surface.png');

  } catch (err) {
    console.error('❌ Test execution error:', err);
  } finally {
    await browser.close();
    console.log('\n--- Console Errors Encountered (' + errors.length + ') ---');
    errors.forEach(e => console.log('  ! ' + e));
    console.log('--- QA Test Suite Finished ---\n');
  }
}

runTestSuite();
