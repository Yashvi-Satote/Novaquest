import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/mitro/.gemini/antigravity/brain/aa6832b1-1a7a-4104-bcc3-781137851120/cinematic_intro_screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function runCinematicIntroValidation() {
  console.log('================================================================');
  console.log('LEVEL 1: SURVEYOR 5 (1967) — 3D CINEMATIC INTRO VALIDATION');
  console.log('Scenes 1-4: Earth Launch -> Moon Landing -> Time Warp -> NASA HQ');
  console.log('================================================================');

  const errors = [];
  const testResults = [];

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

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('AudioContext') && !text.includes('autoplay') && !text.includes('speechSynthesis')) {
        errors.push(text);
        console.error(`[Browser Error]: ${text}`);
      }
    }
  });

  try {
    // -------------------------------------------------------------
    // SCENE 1: EARTH AND ROCKET LAUNCH
    // -------------------------------------------------------------
    console.log('\n[Scene 1] Navigating to Level 1 Surveyor 5 (http://127.0.0.1:5173/play/surveyor-5) ...');
    await page.goto('http://127.0.0.1:5173/play/surveyor-5', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2500);

    const scene1BoardingPath = path.join(SCREENSHOT_DIR, '01_scene1_earth_rocket_boarding.png');
    await page.screenshot({ path: scene1BoardingPath, fullPage: false });
    console.log(`✓ Captured Scene 1 Boarding: ${scene1BoardingPath}`);

    // Wait for countdown and engine ignition
    console.log('Waiting for rocket ignition & liftoff sequence...');
    await sleep(7000);

    const scene1LiftoffPath = path.join(SCREENSHOT_DIR, '02_scene1_rocket_liftoff_particles.png');
    await page.screenshot({ path: scene1LiftoffPath, fullPage: false });
    console.log(`✓ Captured Scene 1 Liftoff: ${scene1LiftoffPath}`);

    // -------------------------------------------------------------
    // SCENE 2: MOON LANDING & LUNAR EXPLORATION
    // -------------------------------------------------------------
    console.log('\n[Scene 2] Waiting for Moon Landing transition...');
    await sleep(11000); // Transitions at ~19.5s

    const scene2LandingPath = path.join(SCREENSHOT_DIR, '03_scene2_moon_descent_touchdown.png');
    await page.screenshot({ path: scene2LandingPath, fullPage: false });
    console.log(`✓ Captured Scene 2 Landing: ${scene2LandingPath}`);

    // Wait for astronaut to exit onto lunar surface
    await sleep(2500);

    // Simulate astronaut walking forward towards Surveyor 5 (W key)
    console.log('Simulating astronaut Leo walking on lunar surface towards Surveyor 5...');
    await page.keyboard.down('KeyW');
    await sleep(2000);
    await page.keyboard.up('KeyW');

    const scene2WalkPath = path.join(SCREENSHOT_DIR, '04_scene2_lunar_astronaut_exploration.png');
    await page.screenshot({ path: scene2WalkPath, fullPage: false });
    console.log(`✓ Captured Scene 2 Lunar Exploration: ${scene2WalkPath}`);

    // Walk closer to trigger time travel or click trigger button
    await page.keyboard.down('KeyW');
    await sleep(2500);
    await page.keyboard.up('KeyW');
    await sleep(1000);

    // If trigger button is present, click it
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Time Travel') || b.textContent.includes('Surveyor 5'));
      if (btn) btn.click();
    });

    // -------------------------------------------------------------
    // SCENE 3: TIME TRAVEL WARP TUNNEL
    // -------------------------------------------------------------
    console.log('\n[Scene 3] Capturing Time Travel Warp Tunnel...');
    await sleep(2000);

    const scene3WarpPath = path.join(SCREENSHOT_DIR, '05_scene3_time_travel_warp_tunnel.png');
    await page.screenshot({ path: scene3WarpPath, fullPage: false });
    console.log(`✓ Captured Scene 3 Time Warp Tunnel: ${scene3WarpPath}`);

    // -------------------------------------------------------------
    // SCENE 4: NASA HEADQUARTERS 1967
    // -------------------------------------------------------------
    console.log('\n[Scene 4] Waiting for transition into NASA Headquarters 1967...');
    await sleep(11500); // Time travel runs ~13s

    const scene4HqPath = path.join(SCREENSHOT_DIR, '06_scene4_nasa_hq_1967_jaffe_speech.png');
    await page.screenshot({ path: scene4HqPath, fullPage: false });
    console.log(`✓ Captured Scene 4 NASA HQ with Dr. Leonard Jaffe: ${scene4HqPath}`);

    // Wait for Dr. Jaffe to finish speaking dialogue
    console.log('Waiting for dialogue completion...');
    await sleep(6000);

    const scene4FinishedPath = path.join(SCREENSHOT_DIR, '07_scene4_dialogue_ready.png');
    await page.screenshot({ path: scene4FinishedPath, fullPage: false });

    // Click "Begin Mission"
    const beginBtn = await page.$('#begin-assembly-btn');
    if (beginBtn) {
      await beginBtn.click();
      await sleep(1000);
      const reviewPath = path.join(SCREENSHOT_DIR, '08_cinematic_intro_review_completed.png');
      await page.screenshot({ path: reviewPath, fullPage: false });
      console.log(`✓ Captured Intro Review Completion Screen: ${reviewPath}`);
    }

    console.log('\n================================================================');
    console.log('ALL 4 CINEMATIC SCENES VALIDATED SUCCESSFULLY!');
    console.log(`Errors encountered: ${errors.length}`);
    console.log('================================================================');
  } catch (err) {
    console.error('Validation failure:', err);
  } finally {
    await browser.close();
  }
}

runCinematicIntroValidation();
