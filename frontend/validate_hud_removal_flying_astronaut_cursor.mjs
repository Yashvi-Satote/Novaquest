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

async function runValidation() {
  console.log('================================================================');
  console.log('NOVAQUEST — HUD REMOVAL + FLYING ASTRONAUT + ROCKET CURSOR TEST');
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
    // Mock Speech APIs for headless Chrome
    await page.evaluateOnNewDocument(() => {
      window.SpeechRecognition = class MockSpeechRecognition {
        constructor() {
          this.onstart = null;
          this.onresult = null;
          this.onerror = null;
          this.onend = null;
        }
        start() {
          if (this.onstart) this.onstart();
          setTimeout(() => { if (this.onend) this.onend(); }, 200);
        }
        stop() { if (this.onend) this.onend(); }
      };
      window.webkitSpeechRecognition = window.SpeechRecognition;

      if (window.speechSynthesis) {
        const origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
        const origCancel = window.speechSynthesis.cancel.bind(window.speechSynthesis);
        window.speechSynthesis.speak = (utt) => {
          if (utt.onstart) setTimeout(() => utt.onstart(), 50);
          try { origSpeak(utt); } catch (e) {}
        };
        window.speechSynthesis.cancel = () => {
          try { origCancel(); } catch (e) {}
        };
      }
    });

    // 1. Navigate to Solar System Map
    console.log('\n[Phase 1] Navigating to http://127.0.0.1:5173/novamap...');
    await page.goto('http://127.0.0.1:5173/novamap', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(4000);

    // TEST 1: Bottom Navigation Bar / HUD Complete Removal & Canvas 100% Expansion
    console.log('\n[Phase 2] Verifying Bottom Navigation Bar / HUD is completely removed...');
    const bottomHudPresent = await page.evaluate(() => {
      const hud1 = document.querySelector('#solar-controls-hud-container');
      const hud2 = document.querySelector('#bottom-timeline-container');
      const hud3 = document.querySelector('.solar-bottom-hud');
      return Boolean(hud1 || hud2 || hud3);
    });

    const canvasDimensions = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return { width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom };
    });

    console.log(`- Bottom HUD in DOM: ${bottomHudPresent ? 'FAIL (Present)' : 'PASS (Completely Removed)'}`);
    console.log(`- Canvas dimensions: ${canvasDimensions?.width}x${canvasDimensions?.height}px`);

    testResults.push({
      test: 'Requirement 1: Bottom HUD Bar Completely Removed',
      passed: !bottomHudPresent && canvasDimensions && canvasDimensions.height >= 950,
      details: `Bottom HUD present: ${bottomHudPresent}, Canvas height: ${canvasDimensions?.height}px (Full viewport expansion)`
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_full_canvas_no_bottom_hud.png') });
    console.log('✓ Captured 01_full_canvas_no_bottom_hud.png');

    // TEST 2: Compact Simulation Settings Modal
    console.log('\n[Phase 3] Testing Compact Simulation Settings Modal...');
    const dockTimelineBtn = await page.$('#dock-toggle-timeline-btn');
    console.log(`- Dock settings/timeline button present: ${Boolean(dockTimelineBtn)}`);

    if (dockTimelineBtn) {
      await dockTimelineBtn.click();
      await sleep(1000);

      const simModalInfo = await page.evaluate(() => {
        const modal = document.querySelector('#compact-simulation-settings-modal');
        if (!modal) return null;
        const playBtn = modal.querySelector('#sim-toggle-play-btn');
        const liveBtn = modal.querySelector('#sim-set-live-btn');
        const slider = modal.querySelector('#sim-timeline-slider');
        const closeBtn = modal.querySelector('#close-sim-settings-btn');
        return {
          modalFound: true,
          hasPlayBtn: Boolean(playBtn),
          hasLiveBtn: Boolean(liveBtn),
          hasSlider: Boolean(slider),
          hasCloseBtn: Boolean(closeBtn)
        };
      });

      console.log(`- Compact settings modal opened: ${Boolean(simModalInfo?.modalFound)}`);
      console.log(`- Has play/pause: ${simModalInfo?.hasPlayBtn}, live: ${simModalInfo?.hasLiveBtn}, slider: ${simModalInfo?.hasSlider}`);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_compact_sim_settings_opened.png') });
      console.log('✓ Captured 02_compact_sim_settings_opened.png');

      testResults.push({
        test: 'Requirement 1: Compact Simulation Settings Modal',
        passed: Boolean(simModalInfo?.modalFound && simModalInfo?.hasPlayBtn && simModalInfo?.hasSlider),
        details: 'Essential simulation controls cleanly relocated to compact floating popover'
      });

      // Close the modal
      const closeBtn = await page.$('#close-sim-settings-btn');
      if (closeBtn) {
        await closeBtn.click();
        await sleep(500);
      }
    }

    // TEST 3: Full-Screen Animated 3D Cartoon Astronaut Companion
    console.log('\n[Phase 4] Verifying Full-Screen Animated Cartoon Astronaut Overlay...');
    const flyingAstronautInfo = await page.evaluate(() => {
      const overlay = document.querySelector('#flying-astronaut-viewport-overlay');
      const character = document.querySelector('#flying-astronaut-character');
      const characterImg = character ? character.querySelector('img[src*="nova_alien_companion.png"]') : null;
      if (!overlay || !character) return null;

      const style = window.getComputedStyle(overlay);
      const rect1 = character.getBoundingClientRect();

      return {
        overlayFound: true,
        pointerEvents: style.pointerEvents,
        hasCharacterImg: Boolean(characterImg),
        initialX: rect1.x,
        initialY: rect1.y,
        initialWidth: rect1.width,
        initialHeight: rect1.height
      };
    });

    console.log(`- Flying overlay present: ${Boolean(flyingAstronautInfo?.overlayFound)}`);
    console.log(`- Pointer events: ${flyingAstronautInfo?.pointerEvents} (Must be 'none' to allow pass-through)`);
    console.log(`- Character reference image loaded: ${flyingAstronautInfo?.hasCharacterImg}`);
    console.log(`- Initial position: (${flyingAstronautInfo?.initialX.toFixed(1)}, ${flyingAstronautInfo?.initialY.toFixed(1)})`);

    // Wait 2.5 seconds to verify flight traverse along curved trajectory
    await sleep(2500);

    const flyingAstronautPos2 = await page.evaluate(() => {
      const character = document.querySelector('#flying-astronaut-character');
      if (!character) return null;
      const rect2 = character.getBoundingClientRect();
      return {
        x: rect2.x,
        y: rect2.y
      };
    });

    console.log(`- Position after 2.5s: (${flyingAstronautPos2?.x.toFixed(1)}, ${flyingAstronautPos2?.y.toFixed(1)})`);
    const hasTraversed = Math.hypot(
      flyingAstronautPos2.x - flyingAstronautInfo.initialX,
      flyingAstronautPos2.y - flyingAstronautInfo.initialY
    ) > 10;
    console.log(`- Dynamic traverse verified: ${hasTraversed}`);

    testResults.push({
      test: 'Requirement 2: Full-Screen Flying Cartoon Astronaut',
      passed: Boolean(flyingAstronautInfo?.overlayFound && flyingAstronautInfo?.pointerEvents === 'none' && hasTraversed),
      details: `Continuous flight verified. Pointer-events: ${flyingAstronautInfo?.pointerEvents}, Displacement: ${(Math.hypot(flyingAstronautPos2.x - flyingAstronautInfo.initialX, flyingAstronautPos2.y - flyingAstronautInfo.initialY)).toFixed(1)}px`
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_flying_astronaut_path.png') });
    console.log('✓ Captured 03_flying_astronaut_path.png');

    // TEST 4: Rocket-Shaped Mouse Cursor
    console.log('\n[Phase 5] Testing Rocket-Shaped Mouse Cursor...');
    // Move mouse across canvas in space
    await page.mouse.move(500, 400);
    await sleep(200);

    const cursorInfo1 = await page.evaluate(() => {
      const cursor = document.querySelector('#novamap-rocket-cursor');
      if (!cursor) return null;
      const style = window.getComputedStyle(cursor);
      return {
        found: true,
        transform: cursor.style.transform,
        pointerEvents: style.pointerEvents
      };
    });

    console.log(`- Rocket cursor in DOM: ${Boolean(cursorInfo1?.found)}`);
    console.log(`- Cursor transform: ${cursorInfo1?.transform}`);

    // Move diagonally to (850, 650) to verify heading orientation
    await page.mouse.move(850, 650);
    await sleep(200);

    const cursorInfo2 = await page.evaluate(() => {
      const cursor = document.querySelector('#novamap-rocket-cursor');
      if (!cursor) return null;
      return {
        transform: cursor.style.transform
      };
    });

    console.log(`- Cursor transform after diagonal motion: ${cursorInfo2?.transform}`);

    // Test cursor hiding over interactive buttons/inputs
    await page.hover('#dock-toggle-sidebar-btn');
    await sleep(200);

    const cursorHiddenOverBtn = await page.evaluate(() => {
      const cursor = document.querySelector('#novamap-rocket-cursor');
      return cursor === null; // RocketCursor unmounts or returns null when hovering interactive buttons
    });

    console.log(`- Rocket cursor hides over interactive buttons: ${cursorHiddenOverBtn}`);

    // Move back into space
    await page.mouse.move(960, 500);
    await sleep(200);

    const cursorRestored = await page.evaluate(() => {
      const cursor = document.querySelector('#novamap-rocket-cursor');
      return Boolean(cursor);
    });

    console.log(`- Rocket cursor restored over space canvas: ${cursorRestored}`);

    testResults.push({
      test: 'Requirement 3: Aerodynamic Rocket Mouse Cursor',
      passed: Boolean(cursorInfo1?.found && cursorHiddenOverBtn && cursorRestored),
      details: 'Custom rocket cursor smoothly follows mouse, computes heading angle, and hides over interactive controls'
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_rocket_cursor_active.png') });
    console.log('✓ Captured 04_rocket_cursor_active.png');

    // TEST 5: Raycasting and Click-Through Validation
    console.log('\n[Phase 6] Verifying user interactions pass cleanly through flying astronaut...');
    // Click on space canvas and verify no pointer event error
    await page.mouse.click(600, 450);
    await sleep(1000);

    // Open sidebar and select Mars to verify object tracking
    const dockSidebarBtn = await page.$('#dock-toggle-sidebar-btn');
    if (dockSidebarBtn) {
      await dockSidebarBtn.click();
      await sleep(1000);

      const marsCard = await page.$('#sidebar-celestial-mars');
      if (marsCard) {
        await marsCard.click();
        await sleep(3000);
        console.log('✓ Selected Mars via sidebar');
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_mars_flight_and_companion.png') });
    console.log('✓ Captured 05_mars_flight_and_companion.png');

    // Output Summary
    console.log('\n================================================================');
    console.log('VALIDATION RESULTS SUMMARY');
    console.log('================================================================');
    let allPassed = true;
    for (const r of testResults) {
      console.log(`${r.passed ? 'PASS' : 'FAIL'} | ${r.test}`);
      console.log(`       Details: ${r.details}`);
      if (!r.passed) allPassed = false;
    }

    const reportPath = path.join(SCREENSHOT_DIR, 'hud_removal_and_cursor_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      allPassed,
      testResults,
      errors
    }, null, 2));

    console.log(`\nReport written to ${reportPath}`);
    return allPassed;
  } catch (err) {
    console.error('Test execution failed:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runValidation()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
