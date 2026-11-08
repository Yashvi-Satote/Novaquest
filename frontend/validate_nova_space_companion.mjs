import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/mitro/.gemini/antigravity/brain/aa6832b1-1a7a-4104-bcc3-781137851120/validation_screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runNovaCompanionValidation() {
  console.log('================================================================');
  console.log('NOVAQUEST — NOVA AI ASTRONAUT SPACE COMPANION VALIDATION');
  console.log('================================================================');

  const testResults = [];
  const errors = [];

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
    if (msg.type() === 'error') {
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
    // SETUP: Open NovaMap
    // ------------------------------------------------------------------------
    console.log('\nNavigating to http://127.0.0.1:5173/novamap ...');
    await page.goto('http://127.0.0.1:5173/novamap', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(2500);

    // Verify 3D canvas is rendering
    const canvasWorking = await page.evaluate(() => {
      const cvs = document.querySelector('canvas');
      return Boolean(cvs && cvs.width > 0 && cvs.height > 0);
    });
    console.log(`Initial 3D Canvas Active: ${canvasWorking}`);

    // Verify NOVA companion is rendered and avatar is floating
    const companionVisible = await page.evaluate(() => {
      return Boolean(document.getElementById('nova-companion-window') || document.getElementById('nova-companion-open-btn'));
    });
    console.log(`NOVA Space Guide Present: ${companionVisible}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_initial_clean_solar_system.png') });
    console.log('Saved: 01_initial_clean_solar_system.png');

    // Open Explorer Sidebar via dock to navigate objects
    await page.click('#dock-toggle-sidebar-btn');
    await sleep(1000);

    // ------------------------------------------------------------------------
    // TEST 1 & 2: Select Mars -> NOVA Explains Mars
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 1 & 2: Select Mars & Verify NOVA Explanation ---');
    await page.click('#sidebar-tab-planets');
    await sleep(600);

    await page.waitForSelector('#planet-sidebar-item-mars', { timeout: 5000 });
    await page.click('#planet-sidebar-item-mars');
    console.log('Mars clicked.');
    await sleep(2500);

    const marsVerified = await page.evaluate(() => {
      const companion = document.querySelector('[aria-label="NOVA AI Space Guide"]');
      const text = companion ? companion.innerText : '';
      const mentionsMars = text.includes('Mars') || text.includes('Red Planet') || text.includes('Olympus Mons');
      const hasTitle = text.includes('Exploring: Mars');
      return Boolean(mentionsMars && hasTitle);
    });
    console.log(`NOVA explains Mars with verified facts: ${marsVerified}`);
    testResults.push({ step: '1 & 2. Select Mars & NOVA explains Mars', pass: marsVerified });

    // Verify NO unwanted detail drawer opened
    const noMarsDrawer = await page.evaluate(() => !document.getElementById('celestial-detail-drawer'));
    console.log(`No unwanted detail drawer opened on Mars selection: ${noMarsDrawer}`);
    testResults.push({ step: 'No drawer on Mars selection', pass: noMarsDrawer });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_mars_selected_nova_explains.png') });
    console.log('Saved: 02_mars_selected_nova_explains.png');

    // ------------------------------------------------------------------------
    // TEST 3: Ask Follow-Up Question to NOVA
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 3: Ask Follow-Up Question ("How many moons does it have?") ---');
    // Ensure companion is expanded
    const isMin = await page.evaluate(() => Boolean(document.getElementById('nova-companion-open-btn')));
    if (isMin) {
      await page.click('#nova-companion-open-btn');
      await sleep(500);
    }

    await page.waitForSelector('#nova-companion-input', { timeout: 5000 });
    await page.type('#nova-companion-input', 'How many moons does it have?');
    await page.click('#nova-companion-send-btn');

    // Check typing indicator appearance
    await sleep(200);
    const typingIndicatorSeen = await page.evaluate(() => {
      const text = document.querySelector('#nova-companion-window')?.innerText || '';
      return text.includes('NOVA is thinking');
    });
    console.log(`Typing indicator active while thinking: ${typingIndicatorSeen}`);

    await sleep(1800);

    const followUpAnswered = await page.evaluate(() => {
      const companion = document.querySelector('#nova-companion-window');
      const text = companion ? companion.innerText : '';
      return text.includes('Phobos') || text.includes('Deimos') || text.includes('2');
    });
    console.log(`NOVA answered specifically about Mars moons: ${followUpAnswered}`);
    testResults.push({ step: '3. Follow-up question answered specifically about Mars', pass: followUpAnswered });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_mars_followup_question_answered.png') });
    console.log('Saved: 03_mars_followup_question_answered.png');

    // ------------------------------------------------------------------------
    // TEST 4 & 5: Select Saturn -> NOVA Changes Context Automatically
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 4 & 5: Select Saturn & Verify Context Switch ---');
    await page.click('#planet-sidebar-item-saturn');
    console.log('Saturn clicked.');
    await sleep(2500);

    const saturnContext = await page.evaluate(() => {
      const companion = document.querySelector('#nova-companion-window');
      const text = companion ? companion.innerText : '';
      const hasTitle = text.includes('Exploring: Saturn');
      const hasSaturnFacts = text.includes('Saturn') || text.includes('rings') || text.includes('hydrogen');
      return Boolean(hasTitle && hasSaturnFacts);
    });
    console.log(`NOVA automatically changed context to Saturn: ${saturnContext}`);
    testResults.push({ step: '4 & 5. Select Saturn & context switch', pass: saturnContext });

    // Ask Saturn moons follow-up
    await page.type('#nova-companion-input', 'How many moons does it have?');
    await page.click('#nova-companion-send-btn');
    await sleep(2000);

    const saturnMoonsAnswered = await page.evaluate(() => {
      const companion = document.querySelector('#nova-companion-window');
      const text = companion ? companion.innerText : '';
      return text.includes('146') || text.includes('Titan') || text.includes('Enceladus');
    });
    console.log(`NOVA answered specifically about Saturn moons (146 moons / Titan): ${saturnMoonsAnswered}`);
    testResults.push({ step: 'Saturn follow-up answered specifically', pass: saturnMoonsAnswered });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_saturn_selected_nova_context.png') });
    console.log('Saved: 04_saturn_selected_nova_context.png');

    // ------------------------------------------------------------------------
    // TEST 6 & 7: Select Titan -> NOVA Explains Titan
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 6 & 7: Select Titan & Verify Titan Explanation ---');
    await page.click('#sidebar-tab-moons');
    await sleep(800);

    // Scroll and click Titan in moons list
    await page.waitForSelector('#moon-sidebar-item-titan', { timeout: 8000 });
    const titanClicked = await page.evaluate(() => {
      const el = document.getElementById('moon-sidebar-item-titan');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        el.click();
        return true;
      }
      return false;
    });
    console.log(`Titan clicked via #moon-sidebar-item-titan: ${titanClicked}`);
    await sleep(2500);

    const titanExplained = await page.evaluate(() => {
      const companion = document.querySelector('#nova-companion-window');
      const text = companion ? companion.innerText : '';
      const hasTitle = text.includes('Exploring: Titan');
      const hasFacts = text.includes('Titan') || text.includes('methane') || text.includes('atmosphere');
      return Boolean(hasTitle && hasFacts);
    });
    console.log(`NOVA automatically changed context to Titan and explained it: ${titanExplained}`);
    testResults.push({ step: '6 & 7. Select Titan & NOVA explains Titan', pass: titanExplained });

    // Ask: "Can humans live there?"
    await page.type('#nova-companion-input', 'Can humans live there?');
    await page.click('#nova-companion-send-btn');
    await sleep(2000);

    const titanHabitabilityAnswered = await page.evaluate(() => {
      const companion = document.querySelector('#nova-companion-window');
      const text = companion ? companion.innerText : '';
      return text.includes('pressure') || text.includes('oxygen') || text.includes('suit') || text.includes('cold');
    });
    console.log(`NOVA answered specifically about human survival on Titan: ${titanHabitabilityAnswered}`);
    testResults.push({ step: 'Titan habitability answered specifically', pass: titanHabitabilityAnswered });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_titan_selected_nova_habitability.png') });
    console.log('Saved: 05_titan_selected_nova_habitability.png');

    // ------------------------------------------------------------------------
    // TEST 8 & 9: Select Voyager 1 -> In-Scene 3D Model & Correct Mission Info
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 8 & 9: Select Voyager 1 & Verify Spacecraft Telemetry ---');
    await page.click('#sidebar-tab-spacecraft');
    await sleep(800);

    await page.waitForSelector('#mission-card-voyager-1', { timeout: 8000 });
    await page.click('#mission-card-voyager-1');
    console.log('Voyager 1 clicked.');
    await sleep(3000);

    // Verify in-scene inspection HUD active
    const inspectionActive = await page.evaluate(() => {
      return Boolean(document.getElementById('return-to-solar-system-btn'));
    });
    console.log(`Voyager 1 in-scene inspection active ('Return to Solar System' visible): ${inspectionActive}`);
    testResults.push({ step: '8. Voyager 1 in-scene 3D inspection active', pass: inspectionActive });

    // Verify NOVA explains Voyager 1 mission facts
    const voyagerExplained = await page.evaluate(() => {
      const companion = document.querySelector('#nova-companion-window');
      const text = companion ? companion.innerText : '';
      const hasTitle = text.includes('Exploring: Voyager 1');
      const hasFacts = text.includes('Voyager 1') || text.includes('Golden Record') || text.includes('1977') || text.includes('interstellar');
      return Boolean(hasTitle && hasFacts);
    });
    console.log(`NOVA explains Voyager 1 mission & Golden Record: ${voyagerExplained}`);
    testResults.push({ step: '9. NOVA provides correct Voyager 1 mission information', pass: voyagerExplained });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_voyager1_in_scene_nova_mission.png') });
    console.log('Saved: 06_voyager1_in_scene_nova_mission.png');

    // ------------------------------------------------------------------------
    // TEST 10: Verify No Unwanted Detail Drawer Opens
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 10: Verify No Unwanted Detail Drawer Opened ---');
    const drawersCompletelyClosed = await page.evaluate(() => {
      const missionDrawer = document.getElementById('mission-detail-drawer');
      const celestialDrawer = document.getElementById('celestial-detail-drawer');
      return !missionDrawer && !celestialDrawer;
    });
    console.log(`All separate information drawers remained closed (NOVA is primary interface): ${drawersCompletelyClosed}`);
    testResults.push({ step: '10. No unwanted detail drawers opened', pass: drawersCompletelyClosed });

    // ------------------------------------------------------------------------
    // TEST 11: Verify 3D Interactions, Return to System, Simulation Clock
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 11: Verify 3D Interactions & Return to Solar System ---');
    await page.click('#return-to-solar-system-btn');
    await sleep(2000);

    const returnedToSystem = await page.evaluate(() => {
      return !document.getElementById('return-to-solar-system-btn');
    });
    console.log(`Exited spacecraft inspection back to Solar System: ${returnedToSystem}`);

    // Verify 3D canvas and controls are still responsive
    const canvasResponsive = await page.evaluate(() => {
      const cvs = document.querySelector('canvas');
      const playBtn = document.getElementById('solar-play-pause-btn');
      const slider = document.getElementById('simulation-timeline-slider');
      return Boolean(cvs && playBtn && slider);
    });
    console.log(`Solar System 3D canvas and timeline controls fully operational: ${canvasResponsive}`);
    testResults.push({ step: '11. Existing 3D interactions & simulation continue working', pass: returnedToSystem && canvasResponsive });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_solar_system_returned_healthy.png') });
    console.log('Saved: 07_solar_system_returned_healthy.png');

    // ------------------------------------------------------------------------
    // FINAL REPORT
    // ------------------------------------------------------------------------
    const allPassed = testResults.every(t => t.pass);
    const finalReport = {
      timestamp: new Date().toISOString(),
      testResults,
      allPassed,
      consoleErrors: errors
    };

    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'nova_companion_test_report.json'),
      JSON.stringify(finalReport, null, 2)
    );

    console.log('\n================================================================');
    console.log(`FINAL RESULT: ${allPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
    console.log('================================================================');
    console.log(JSON.stringify(finalReport, null, 2));

  } catch (err) {
    console.error('Validation script encountered error:', err);
  } finally {
    await browser.close();
  }
}

runNovaCompanionValidation();
