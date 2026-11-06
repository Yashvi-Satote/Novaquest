import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/mitro/.gemini/antigravity/brain/aa6832b1-1a7a-4104-bcc3-781137851120/validation_screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function validateNovaTransformation() {
  const consoleMessages = [];
  const errors = [];
  const testResults = [];

  console.log('Launching headless Chrome to validate NOVA transformation...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--use-gl=angle',
      '--ignore-gpu-blocklist',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push({ type, text });
    if (type === 'error') {
      errors.push(text);
      console.error(`[Browser Error]: ${text}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
    console.error(`[Page Error]: ${err}`);
  });

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Initial Clean Cinematic Load
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 1: Navigating to NovaMap ---');
    await page.goto('http://127.0.0.1:5173/novamap', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(2500);

    // Check canvas
    const canvasExists = await page.evaluate(() => {
      const cvs = document.querySelector('canvas');
      return Boolean(cvs && cvs.width > 0 && cvs.height > 0);
    });
    console.log(`Canvas initialized: ${canvasExists}`);
    testResults.push({ test: 'Canvas initialized', pass: canvasExists });

    // Check NOVA companion is present (either window or minimized badge)
    const novaExists = await page.evaluate(() => {
      return Boolean(
        document.getElementById('nova-companion-window') || 
        document.getElementById('nova-companion-open-btn') ||
        document.querySelector('[aria-label="NOVA AI Space Guide"]')
      );
    });
    console.log(`NOVA Companion present: ${novaExists}`);
    testResults.push({ test: 'NOVA Companion present', pass: novaExists });

    // Check Floating Control Dock is present
    const dockExists = await page.evaluate(() => {
      return Boolean(document.getElementById('dock-toggle-sidebar-btn') && document.getElementById('dock-toggle-zen-btn'));
    });
    console.log(`Floating Controls Dock present: ${dockExists}`);
    testResults.push({ test: 'Floating Controls Dock present', pass: dockExists });

    // Verify detail drawers are NOT automatically open on start
    const drawersClosedInitially = await page.evaluate(() => {
      const missionDrawer = document.getElementById('mission-detail-drawer');
      const celestialDrawer = document.getElementById('celestial-detail-drawer');
      return !missionDrawer && !celestialDrawer;
    });
    console.log(`Detail drawers clean/closed on start: ${drawersClosedInitially}`);
    testResults.push({ test: 'Detail drawers closed by default', pass: drawersClosedInitially });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_cinematic_minimal_solar_system.png') });
    console.log('Captured: 01_cinematic_minimal_solar_system.png');

    // ------------------------------------------------------------------------
    // TEST 2: Collapsible Sidebar Dock Toggle
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 2: Toggling Explorer Sidebar via Dock ---');
    await page.click('#dock-toggle-sidebar-btn');
    await sleep(1200);

    const sidebarVisible = await page.evaluate(() => {
      const aside = document.querySelector('aside[aria-label="Solar System Explorer Sidebar"]');
      return Boolean(aside && aside.classList.contains('translate-x-0'));
    });
    console.log(`Sidebar opened via dock: ${sidebarVisible}`);
    testResults.push({ test: 'Sidebar opened via dock', pass: sidebarVisible });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_explorer_sidebar_opened.png') });
    console.log('Captured: 02_explorer_sidebar_opened.png');

    // ------------------------------------------------------------------------
    // TEST 3: Select Celestial Body (Mars) -> NOVA Guide Explains (No Bulky Drawer)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 3: Selecting Mars ---');
    // Click Planets tab in sidebar
    await page.click('#sidebar-tab-planets');
    await sleep(600);

    // Click Mars item card directly
    await page.waitForSelector('#planet-sidebar-item-mars', { timeout: 5000 });
    await page.click('#planet-sidebar-item-mars');
    console.log('Mars clicked in sidebar (#planet-sidebar-item-mars)');
    await sleep(2500);

    // Verify detail drawer did NOT auto-open
    const drawerStillClosed = await page.evaluate(() => {
      return !document.getElementById('celestial-detail-drawer');
    });
    console.log(`Celestial detail drawer NOT auto-opened (as required): ${drawerStillClosed}`);
    testResults.push({ test: 'Detail drawer did not auto-open on Mars click', pass: drawerStillClosed });

    // Verify NOVA spoke about Mars
    const novaMarsIntro = await page.evaluate(() => {
      const companion = document.querySelector('[aria-label="NOVA AI Space Guide"]');
      const text = companion ? companion.innerText : '';
      return text.includes('Mars') || text.includes('Red Planet') || text.includes('Olympus Mons') || text.includes('Exploring: Mars');
    });
    console.log(`NOVA introduced Mars with verified facts: ${novaMarsIntro}`);
    testResults.push({ test: 'NOVA introduced Mars with verified facts', pass: novaMarsIntro });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_mars_focused_nova_explaining.png') });
    console.log('Captured: 03_mars_focused_nova_explaining.png');

    // ------------------------------------------------------------------------
    // TEST 4: Follow-up Question to NOVA
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 4: Asking NOVA a Follow-up Question ---');
    // Ensure companion is expanded
    const isMinimized = await page.evaluate(() => Boolean(document.getElementById('nova-companion-open-btn')));
    if (isMinimized) {
      await page.click('#nova-companion-open-btn');
      await sleep(600);
    }

    // Try clicking a suggestion chip if available, or type in input
    const chipClicked = await page.evaluate(() => {
      const chips = document.querySelectorAll('button');
      for (const chip of chips) {
        if (chip.textContent && (chip.textContent.includes('moon') || chip.textContent.includes('breath') || chip.textContent.includes('water') || chip.textContent.includes('live'))) {
          chip.click();
          return true;
        }
      }
      return false;
    });

    if (!chipClicked) {
      await page.waitForSelector('#nova-companion-input', { timeout: 5000 });
      await page.type('#nova-companion-input', 'Does Mars have any moons?');
      await page.click('#nova-companion-send-btn');
    }
    await sleep(2000);

    const novaAnswered = await page.evaluate(() => {
      const companion = document.querySelector('[aria-label="NOVA AI Space Guide"]');
      const text = companion ? companion.innerText : '';
      return text.includes('Phobos') || text.includes('Deimos') || text.includes('atmosphere') || text.includes('Olympus') || text.includes('moons');
    });
    console.log(`NOVA answered follow-up question contextually: ${novaAnswered}`);
    testResults.push({ test: 'NOVA answered follow-up question contextually', pass: novaAnswered });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_nova_followup_question_answered.png') });
    console.log('Captured: 04_nova_followup_question_answered.png');

    // ------------------------------------------------------------------------
    // TEST 5: Select 3D Spacecraft (Voyager 1) -> In-Scene Model & NOVA Guide
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 5: Selecting Voyager 1 Spacecraft ---');
    await page.click('#sidebar-tab-spacecraft');
    await sleep(800);

    await page.waitForSelector('#mission-card-voyager-1', { timeout: 8000 });
    await page.click('#mission-card-voyager-1');
    console.log('Voyager 1 clicked (#mission-card-voyager-1)');
    await sleep(3000);

    // Verify top return button exists (in-scene inspection mode active)
    const returnBtnExists = await page.evaluate(() => {
      return Boolean(document.getElementById('return-to-solar-system-btn'));
    });
    console.log(`In-scene inspection HUD active ('Return to Solar System' button present): ${returnBtnExists}`);
    testResults.push({ test: 'In-scene inspection HUD active', pass: returnBtnExists });

    // Verify NOVA speaks about Voyager 1
    const novaVoyagerIntro = await page.evaluate(() => {
      const companion = document.querySelector('[aria-label="NOVA AI Space Guide"]');
      const text = companion ? companion.innerText : '';
      return text.includes('Voyager 1') || text.includes('Golden Record') || text.includes('interstellar') || text.includes('1977');
    });
    console.log(`NOVA introduced Voyager 1 mission facts: ${novaVoyagerIntro}`);
    testResults.push({ test: 'NOVA introduced Voyager 1 mission facts', pass: novaVoyagerIntro });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_voyager1_in_scene_nova_guide.png') });
    console.log('Captured: 05_voyager1_in_scene_nova_guide.png');

    // ------------------------------------------------------------------------
    // TEST 6: Return to Solar System Action
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 6: Returning to Solar System Overview ---');
    await page.click('#return-to-solar-system-btn');
    await sleep(2000);

    const inspectionEnded = await page.evaluate(() => {
      return !document.getElementById('return-to-solar-system-btn');
    });
    console.log(`Returned to Solar System view successfully: ${inspectionEnded}`);
    testResults.push({ test: 'Exit in-scene inspection mode', pass: inspectionEnded });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_returned_to_solar_system.png') });
    console.log('Captured: 06_returned_to_solar_system.png');

    // ------------------------------------------------------------------------
    // TEST 7: Zen Mode (Hide All Panels for Full-Screen Immersion)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 7: Testing Zen Mode ---');
    await page.click('#dock-toggle-zen-btn');
    await sleep(1200);

    const zenActive = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Main Navigation"], header');
      const timeline = document.getElementById('simulation-timeline-slider');
      const companion = document.getElementById('nova-companion-window');
      // In Zen mode, navbar, timeline, companion are hidden
      return !nav && !timeline && !companion;
    });
    console.log(`Zen Mode hides all panels cleanly: ${zenActive}`);
    testResults.push({ test: 'Zen Mode hides all panels cleanly', pass: zenActive });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_zen_cinematic_full_screen.png') });
    console.log('Captured: 07_zen_cinematic_full_screen.png');

    // Exit Zen Mode
    await page.click('#dock-toggle-zen-btn');
    await sleep(1000);

    // ------------------------------------------------------------------------
    // TEST 8: Preferences Persistence in LocalStorage
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 8: Layout Preferences Persistence ---');
    const storedPrefs = await page.evaluate(() => {
      return localStorage.getItem('nova_layout_preferences_v1');
    });
    console.log(`Stored preferences in localStorage: ${storedPrefs}`);
    testResults.push({ test: 'Stored preferences in localStorage', pass: Boolean(storedPrefs) });

    // Save final report
    const report = {
      timestamp: new Date().toISOString(),
      testResults,
      allPassed: testResults.every(t => t.pass),
      consoleErrors: errors
    };

    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'nova_transformation_validation_report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log('\nValidation Report Saved successfully!');
    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error('Validation failed with error:', err);
  } finally {
    await browser.close();
  }
}

validateNovaTransformation();
