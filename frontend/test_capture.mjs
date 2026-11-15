import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testCapture() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--window-size=1920,1080',
      '--disable-gpu-sandbox',
      '--no-sandbox',
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
  console.log('Navigating to http://localhost:5173/app ...');
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle2', timeout: 15000 });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const testDir = 'C:\\Users\\mitro\\project\\NQ\\production\\tutorial_30s\\test_captures';
  fs.mkdirSync(testDir, { recursive: true });
  
  const shotPath = path.join(testDir, 'test_home.png');
  await page.screenshot({ path: shotPath, type: 'png' });
  console.log(`Saved screenshot to ${shotPath}`);

  await browser.close();
}

testCapture().catch(err => {
  console.error('Error during test capture:', err);
  process.exit(1);
});
