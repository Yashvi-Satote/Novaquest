import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/mitro/.gemini/antigravity/brain/aa6832b1-1a7a-4104-bcc3-781137851120/validation_screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function validateSolarSystem() {
  const consoleMessages = [];
  const errors = [];

  console.log('Launching Chrome browser...');
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
      console.error(`[Browser Console Error]: ${text}`);
    } else {
      console.log(`[Browser Console ${type}]: ${text.slice(0, 120)}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
    console.error(`[Page Error]: ${err}`);
  });

  console.log('Navigating to http://localhost:5173/novamap ...');
  await page.goto('http://localhost:5173/novamap', { waitUntil: 'networkidle0', timeout: 30000 });

  // 1. Wait for canvas to load
  console.log('Waiting for canvas...');
  await page.waitForSelector('canvas', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 4000)); // Allow Three.js textures & ephemeris to settle

  console.log('Taking Screenshot 1: Full Solar System Overview...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_full_solar_system.png') });

  // 2. Open Sidebar and click Planets tab, focus on Saturn
  console.log('Testing Planet Focus (Saturn)...');
  const planetsTab = await page.$('#sidebar-tab-planets');
  if (planetsTab) await planetsTab.click();
  await new Promise(r => setTimeout(r, 600));

  const saturnItem = await page.$('#planet-sidebar-item-saturn');
  if (saturnItem) {
    await saturnItem.click();
    console.log('Clicked Saturn. Waiting for camera glide...');
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_focused_planet_saturn.png') });
  }

  // 3. Test Small Bodies (Asteroids & Comets) tab, focus on Ceres
  console.log('Testing Small Bodies (Ceres)...');
  const smallBodiesTab = await page.$('#sidebar-tab-smallbodies');
  if (smallBodiesTab) {
    await smallBodiesTab.click();
    await new Promise(r => setTimeout(r, 600));
    const ceresItem = await page.$('#smallbody-sidebar-item-ceres');
    if (ceresItem) {
      await ceresItem.click();
      console.log('Clicked Ceres. Waiting for camera transition...');
      await new Promise(r => setTimeout(r, 2500));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_focused_asteroid_ceres.png') });
    }
  }

  // 4. Test Missions tab and Spacecraft 3D Preview (Voyager 1)
  console.log('Testing Spacecraft 3D Inspector (Voyager 1)...');
  const spacecraftTab = await page.$('#sidebar-tab-spacecraft');
  if (spacecraftTab) {
    await spacecraftTab.click();
    await new Promise(r => setTimeout(r, 1000));

    // Search for voyager
    const searchInput = await page.$('#sidebar-search-input');
    if (searchInput) {
      await searchInput.type('voyager-1');
      await new Promise(r => setTimeout(r, 800));
    }

    // Click Voyager 1 in list
    const craftCards = await page.$$('div[class*="rounded-xl"][class*="cursor-pointer"]');
    for (const card of craftCards) {
      const text = await page.evaluate(el => el.textContent, card);
      if (text && text.includes('Voyager 1')) {
        await card.click();
        console.log('Clicked Voyager 1. Waiting for telemetry drawer and 3D preview...');
        await new Promise(r => setTimeout(r, 3500));
        break;
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_spacecraft_3d_preview_voyager.png') });
  }

  // 5. Test Simulation Controls (Reverse Time, Speed, Step)
  console.log('Testing Simulation Controls HUD...');
  const resetBtn = await page.$('#hud-reset-view-btn');
  if (resetBtn) await resetBtn.click();
  await new Promise(r => setTimeout(r, 1500));

  const playPauseBtn = await page.$('#hud-play-pause-btn');
  if (playPauseBtn) await playPauseBtn.click();

  const reverseBtn = await page.$('#hud-reverse-time-btn');
  if (reverseBtn) await reverseBtn.click();

  const stepFwdBtn = await page.$('#hud-step-fwd-btn');
  if (stepFwdBtn) await stepFwdBtn.click();

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_hud_simulation_controls.png') });

  // 6. Test Comet Tail rendering (focus on 1P/Halley)
  console.log('Testing Comet (1P/Halley)...');
  if (smallBodiesTab) {
    await smallBodiesTab.click();
    await new Promise(r => setTimeout(r, 600));
    const halleyItem = await page.$('#smallbody-sidebar-item-halley');
    if (halleyItem) {
      await halleyItem.click();
      console.log('Clicked Halley. Waiting for camera glide...');
      await new Promise(r => setTimeout(r, 2500));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_comet_halley_focused.png') });
    }
  }

  await browser.close();
  console.log('Browser session closed.');

  const results = {
    totalConsoleMessages: consoleMessages.length,
    errorCount: errors.length,
    errors,
    screenshots: fs.readdirSync(SCREENSHOT_DIR)
  };

  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'validation_report.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('Validation completed successfully:', JSON.stringify(results, null, 2));
}

validateSolarSystem().catch(err => {
  console.error('Fatal validation error:', err);
  process.exit(1);
});

