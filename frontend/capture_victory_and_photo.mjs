import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/mitro/.gemini/antigravity/brain/aa6832b1-1a7a-4104-bcc3-781137851120/open_world_screenshots';

async function captureVictory() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto('http://127.0.0.1:5173/play/surveyor-5', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Trigger test complete mission
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('test-complete-mission'));
  });

  await new Promise(r => setTimeout(r, 1200));

  const shotPath = path.join(SCREENSHOT_DIR, '08_mission_accomplished_celebration.png');
  await page.screenshot({ path: shotPath });
  console.log('✓ Captured Victory Modal & 1967 Photo:', shotPath);

  await browser.close();
}

captureVictory();
