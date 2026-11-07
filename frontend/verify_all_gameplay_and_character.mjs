import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/mitro/.gemini/antigravity/brain/aa6832b1-1a7a-4104-bcc3-781137851120/character_validation';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function runValidation() {
  console.log('================================================================');
  console.log('VALIDATING ALIEN HERO CHARACTER, E-KEY INTERACTION & OPEN WORLD');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--use-gl=angle',
      '--ignore-gpu-blocklist',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.message);
    errors.push(err.message);
  });

  try {
    console.log('1. Navigating to http://127.0.0.1:5173/play/surveyor-5 ...');
    await page.goto('http://127.0.0.1:5173/play/surveyor-5', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2500);

    // 2. Click Skip to Moon
    console.log('2. Clicking #skip-to-moon-btn ...');
    await page.waitForSelector('#skip-to-moon-btn', { timeout: 10000 });
    await page.click('#skip-to-moon-btn');
    await sleep(2000);

    // 3. Capture Initial Moon Landing Site View
    const p1 = path.join(SCREENSHOT_DIR, '01_moon_deep_space_sky.png');
    await page.screenshot({ path: p1 });
    console.log(`✓ 01 Captured Moon Landing Site: ${p1}`);

    // 4. Orbit camera 180 degrees to face the Alien Astronaut
    console.log('3. Orbiting camera 180 degrees to face the Alien Hero Astronaut ...');
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const evtDown = new MouseEvent('mousedown', { clientX: 960, clientY: 540, button: 0 });
        const evtMove = new MouseEvent('mousemove', { clientX: 1410, clientY: 540, movementX: 450, movementY: 0 });
        const evtUp = new MouseEvent('mouseup', { clientX: 1410, clientY: 540 });
        canvas.dispatchEvent(evtDown);
        canvas.dispatchEvent(evtMove);
        canvas.dispatchEvent(evtUp);
      }
    });
    await sleep(1500);

    // Zoom in with mouse wheel
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const wheelEvt = new WheelEvent('wheel', { deltaY: -550 });
        canvas.dispatchEvent(wheelEvt);
      }
    });
    await sleep(1500);

    // 5. Capture Alien Character Closeup
    const p2 = path.join(SCREENSHOT_DIR, '02_alien_character_front_closeup.png');
    await page.screenshot({ path: p2 });
    console.log(`✓ 02 Captured Alien Character Closeup: ${p2}`);

    // 6. Test Suit Switcher -> Switch to Apollo Astronaut Leo Stoolman
    console.log('4. Testing Suit Switcher: Toggle to Apollo Astronaut ...');
    const suitBtn = await page.$('#suit-switch-btn');
    if (suitBtn) {
      await suitBtn.click();
      await sleep(1200);
      const p3 = path.join(SCREENSHOT_DIR, '03_apollo_human_astronaut_suit.png');
      await page.screenshot({ path: p3 });
      console.log(`✓ 03 Captured Apollo Human Astronaut: ${p3}`);

      // Toggle back to Alien Explorer
      console.log('Switching back to Alien Explorer ...');
      await suitBtn.click();
      await sleep(1200);
      const p4 = path.join(SCREENSHOT_DIR, '04_switched_back_to_alien.png');
      await page.screenshot({ path: p4 });
      console.log(`✓ 04 Switched back to Alien Explorer: ${p4}`);
    }

    // 7. Reset camera behind character to navigate and collect component
    console.log('5. Navigating towards nearest lost component ...');
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const evtDown = new MouseEvent('mousedown', { clientX: 960, clientY: 540, button: 0 });
        const evtMove = new MouseEvent('mousemove', { clientX: 510, clientY: 540, movementX: -450, movementY: 0 });
        const evtUp = new MouseEvent('mouseup', { clientX: 510, clientY: 540 });
        canvas.dispatchEvent(evtDown);
        canvas.dispatchEvent(evtMove);
        canvas.dispatchEvent(evtUp);
      }
    });
    await sleep(1000);

    // Press W and Shift to walk / sprint towards the component
    console.log('Walking towards beacon...');
    await page.keyboard.down('KeyW');
    await page.keyboard.down('ShiftLeft');
    await sleep(3500); // Walk forward
    await page.keyboard.up('ShiftLeft');
    await page.keyboard.up('KeyW');
    await sleep(1000);

    // Check if interaction prompt is visible
    let promptEl = await page.$('#interact-action-btn');
    console.log('Interaction prompt found after walking:', !!promptEl);

    if (!promptEl) {
      // Walk a bit more or turn
      console.log('Adjusting walk trajectory...');
      await page.keyboard.down('KeyD');
      await sleep(1000);
      await page.keyboard.up('KeyD');
      await page.keyboard.down('KeyW');
      await sleep(2500);
      await page.keyboard.up('KeyW');
      await sleep(1000);
      promptEl = await page.$('#interact-action-btn');
    }

    const p5 = path.join(SCREENSHOT_DIR, '05_open_world_walking_terrain.png');
    await page.screenshot({ path: p5 });
    console.log(`✓ 05 Captured Walking on Lunar Terrain: ${p5}`);

    // Test E key interaction
    console.log('6. Testing [E] Key interaction...');
    await page.keyboard.press('KeyE');
    await sleep(1500);

    const recoveredCount = await page.evaluate(() => {
      return document.body.innerText.includes('COMPONENTS RECOVERED');
    });
    console.log('Recovered section visible:', recoveredCount);

    const p6 = path.join(SCREENSHOT_DIR, '06_component_collection_feedback.png');
    await page.screenshot({ path: p6 });
    console.log(`✓ 06 Captured Collection State: ${p6}`);

  } catch (err) {
    console.error('Validation error:', err);
  } finally {
    await browser.close();
    console.log('Validation finished! Total console errors:', errors.length);
  }
}

runValidation();
