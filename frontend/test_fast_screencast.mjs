import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testFastScreencast() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--window-size=1920,1080',
      '--disable-gpu-sandbox',
      '--no-sandbox',
      '--hide-scrollbars',
      '--mute-audio',
      '--enable-begin-frame-control'
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
  const frames = [];

  client.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    frames.push(Buffer.from(data, 'base64'));
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  console.log('Starting fast screencast...');
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  await new Promise(r => setTimeout(r, 3000));

  await client.send('Page.stopScreencast');
  console.log(`Stopped fast screencast. In-memory frames: ${frames.length}`);

  await browser.close();
}

testFastScreencast().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
