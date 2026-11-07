import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/mitro/.gemini/antigravity/brain/aa6832b1-1a7a-4104-bcc3-781137851120/open_world_screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function captureAlienHero() {
  console.log('================================================================');
  console.log('CAPTURING HIGH-FIDELITY ALIEN HERO ASTRONAUT 3D CHARACTER');
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

  try {
    console.log('Navigating to http://127.0.0.1:5173/play/surveyor-5 ...');
    await page.goto('http://127.0.0.1:5173/play/surveyor-5', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2500);

    // Click "Skip to Moon" to instantly enter open-world lunar surface
    console.log('Clicking #skip-to-moon-btn ...');
    await page.waitForSelector('#skip-to-moon-btn', { timeout: 10000 });
    await page.click('#skip-to-moon-btn');
    await sleep(3500);

    // 1. Capture Third-Person View from Behind
    const pBehind = path.join(SCREENSHOT_DIR, '04_open_world_lunar_exploration.png');
    await page.screenshot({ path: pBehind });
    console.log(`✓ 04 Captured View from Behind: ${pBehind}`);

    // 2. Orbit Camera around 180 degrees to face the Alien Astronaut
    console.log('Orbiting camera 180 degrees to face Leo ...');
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

    // Zoom in closer with mouse wheel
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const wheelEvt = new WheelEvent('wheel', { deltaY: -500 });
        canvas.dispatchEvent(wheelEvt);
      }
    });
    await sleep(1200);

    // 3. Capture Front Closeup of the Alien Astronaut
    const pCloseup = path.join(SCREENSHOT_DIR, '04b_hero_astronaut_character_closeup.png');
    await page.screenshot({ path: pCloseup });
    console.log(`✓ 04b Captured Front Closeup: ${pCloseup}`);

    // 4. Orbit slightly to a 3/4 dynamic perspective angle
    console.log('Orbiting to 3/4 perspective angle ...');
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const evtDown = new MouseEvent('mousedown', { clientX: 960, clientY: 540, button: 0 });
        const evtMove = new MouseEvent('mousemove', { clientX: 1080, clientY: 520, movementX: 120, movementY: -20 });
        const evtUp = new MouseEvent('mouseup', { clientX: 1080, clientY: 520 });
        canvas.dispatchEvent(evtDown);
        canvas.dispatchEvent(evtMove);
        canvas.dispatchEvent(evtUp);
      }
    });
    await sleep(1200);

    const pPerspective = path.join(SCREENSHOT_DIR, '04c_hero_astronaut_perspective.png');
    await page.screenshot({ path: pPerspective });
    console.log(`✓ 04c Captured 3/4 Perspective: ${pPerspective}`);

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    console.log('Capture completed successfully!');
  }
}

captureAlienHero();

