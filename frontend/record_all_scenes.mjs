import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = 'C:\\Users\\mitro\\project\\NQ\\production\\tutorial_30s';
const RAW_DIR = path.join(OUTPUT_DIR, 'raw_scenes');
const FRAMES_DIR = path.join(OUTPUT_DIR, 'frames');

fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });

async function enableRafInvalidation(page) {
  await page.evaluate(() => {
    let tick = 0;
    function pulse() {
      tick++;
      document.body.dataset.animTick = tick;
      requestAnimationFrame(pulse);
    }
    requestAnimationFrame(pulse);
  });
}

async function captureScene(page, durationMs, sceneName) {
  const sceneFrameDir = path.join(FRAMES_DIR, sceneName);
  if (fs.existsSync(sceneFrameDir)) fs.rmSync(sceneFrameDir, { recursive: true, force: true });
  fs.mkdirSync(sceneFrameDir, { recursive: true });

  const client = await page.target().createCDPSession();
  const frames = [];
  let isRecording = true;

  client.on('Page.screencastFrame', ({ data, sessionId }) => {
    if (isRecording) {
      frames.push(Buffer.from(data, 'base64'));
    }
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  console.log(`[${sceneName}] Capturing for ${(durationMs / 1000).toFixed(1)}s...`);
  const t0 = Date.now();
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  await new Promise(r => setTimeout(r, durationMs));
  isRecording = false;
  await client.send('Page.stopScreencast').catch(() => {});
  const elapsedSec = (Date.now() - t0) / 1000;

  console.log(`[${sceneName}] Captured ${frames.length} frames in ${elapsedSec.toFixed(2)}s.`);

  // Write frames to disk
  for (let i = 0; i < frames.length; i++) {
    const fn = path.join(sceneFrameDir, `frame_${(i + 1).toString().padStart(5, '0')}.jpg`);
    fs.writeFileSync(fn, frames[i]);
  }

  // Encode to MP4 with FFmpeg at 30 fps
  const targetDuration = durationMs / 1000;
  const inputFps = frames.length / targetDuration;
  const outMp4 = path.join(RAW_DIR, `${sceneName}.mp4`);

  console.log(`[${sceneName}] Encoding to ${outMp4} (duration: ${targetDuration}s, 30 fps)...`);
  const cmd = `ffmpeg -y -r ${inputFps.toFixed(2)} -i "${sceneFrameDir}\\frame_%05d.jpg" -t ${targetDuration} -vf "scale=1920:1080,fps=30" -c:v libx264 -pix_fmt yuv420p -preset fast "${outMp4}"`;
  execSync(cmd, { stdio: 'pipe' });
  console.log(`[${sceneName}] Successfully encoded -> ${outMp4}\n`);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--window-size=1920,1080',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--enable-gpu-rasterization',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--hide-scrollbars',
      '--mute-audio'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    }
  });

  const page = await browser.newPage();

  // ==========================================
  // SCENE 1 — Introduction (4.0s)
  // ==========================================
  console.log('=== RECORDING SCENE 1: INTRODUCTION (0-4s) ===');
  await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1800));
  await enableRafInvalidation(page);

  // Mouse animation in background while recording
  const s1 = captureScene(page, 4000, 'scene1_intro');
  for (let i = 0; i < 20; i++) {
    await page.mouse.move(500 + i * 25, 420 + Math.sin(i * 0.3) * 50);
    await new Promise(r => setTimeout(r, 180));
  }
  await s1;

  // ==========================================
  // SCENE 2 — Gameplay & Surveyor 5 (6.0s)
  // ==========================================
  console.log('=== RECORDING SCENE 2: GAMEPLAY (4-10s) ===');
  await page.goto(`${BASE_URL}/play`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  await enableRafInvalidation(page);

  // Teleport player near Surveyor 5 to reveal lander and prompt
  await page.evaluate(() => {
    if (window.__teleportPlayer) {
      window.__teleportPlayer(4.5, 4.5, -2.4);
    }
  });
  await new Promise(r => setTimeout(r, 500));

  const s2 = captureScene(page, 6000, 'scene2_gameplay');
  for (let step = 0; step < 15; step++) {
    await page.keyboard.down('KeyW');
    await page.mouse.move(960 + step * 8, 540 + Math.sin(step * 0.4) * 20);
    await new Promise(r => setTimeout(r, 220));
    await page.keyboard.up('KeyW');
    await new Promise(r => setTimeout(r, 160));
  }
  await s2;

  // ==========================================
  // SCENE 3 — NovaMap Solar System (5.0s)
  // ==========================================
  console.log('=== RECORDING SCENE 3: NOVAMAP (10-15s) ===');
  await page.goto(`${BASE_URL}/novamap`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2500));
  await enableRafInvalidation(page);

  const s3 = captureScene(page, 5000, 'scene3_novamap');
  await page.mouse.move(960, 540);
  await page.mouse.down();
  for (let i = 0; i < 25; i++) {
    await page.mouse.move(960 + i * 16, 540 + Math.sin(i * 0.25) * 35);
    await new Promise(r => setTimeout(r, 120));
  }
  await page.mouse.up();
  await s3;

  // ==========================================
  // SCENE 4 — Novabase Hardware Catalog (5.0s)
  // ==========================================
  console.log('=== RECORDING SCENE 4: NOVABASE (15-20s) ===');
  await page.goto(`${BASE_URL}/novabase`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await enableRafInvalidation(page);

  const s4 = captureScene(page, 5000, 'scene4_novabase');
  await page.click('input').catch(() => {});
  await page.type('input', 'Voyager', { delay: 110 }).catch(() => {});
  await new Promise(r => setTimeout(r, 800));
  await page.mouse.move(480, 500);
  await new Promise(r => setTimeout(r, 1500));
  await s4;

  // ==========================================
  // SCENE 5 — MEMOIR Documentary (6.0s)
  // ==========================================
  console.log('=== RECORDING SCENE 5: MEMOIR (20-26s) ===');
  await page.goto(`${BASE_URL}/memoir`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await enableRafInvalidation(page);

  // Start video playback
  await page.evaluate(() => {
    const v = document.querySelector('video');
    if (v) {
      v.muted = true;
      v.currentTime = 16;
      v.play();
    }
  });

  const s5 = captureScene(page, 6000, 'scene5_memoir');
  await new Promise(r => setTimeout(r, 2500));
  await page.evaluate(() => {
    window.scrollBy({ top: 320, behavior: 'smooth' });
  });
  await new Promise(r => setTimeout(r, 2000));
  await s5;

  // ==========================================
  // SCENE 6 — Final Branding Screen (4.0s)
  // ==========================================
  console.log('=== RECORDING SCENE 6: BRANDING (26-30s) ===');
  await page.goto(`${BASE_URL}/tutorial_branding.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await enableRafInvalidation(page);

  await captureScene(page, 4000, 'scene6_branding');

  await browser.close();
  console.log('\n>>> ALL 6 SCENES SUCCESSFULLY RECORDED AND ENCODED! <<<');
}

run().catch(err => {
  console.error('Recording error:', err);
  process.exit(1);
});
