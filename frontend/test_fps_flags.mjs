import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testFpsFlags() {
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
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const client = await page.target().createCDPSession();
  let frames = 0;

  client.on('Page.screencastFrame', ({ sessionId }) => {
    frames++;
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  await new Promise(r => setTimeout(r, 3000));
  await client.send('Page.stopScreencast').catch(() => {});
  await browser.close();

  console.log(`With GPU flags: ${frames} frames in 3 seconds (${(frames / 3).toFixed(1)} fps)`);
}

testFpsFlags().catch(console.error);
