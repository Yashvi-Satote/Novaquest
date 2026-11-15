import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testScreencast() {
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
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const frameDir = 'C:\\Users\\mitro\\project\\NQ\\production\\tutorial_30s\\test_screencast';
  fs.mkdirSync(frameDir, { recursive: true });

  const client = await page.target().createCDPSession();
  let frameCount = 0;

  client.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    frameCount++;
    const frameFile = path.join(frameDir, `frame_${frameCount.toString().padStart(5, '0')}.jpg`);
    fs.writeFileSync(frameFile, Buffer.from(data, 'base64'));
    await client.send('Page.screencastFrameAck', { sessionId });
  });

  console.log('Starting screencast...');
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    everyNthFrame: 1
  });

  // Let it record for 3 seconds while Moon spins
  await new Promise(r => setTimeout(r, 3000));

  await client.send('Page.stopScreencast');
  console.log(`Stopped screencast. Total frames captured: ${frameCount}`);

  await browser.close();
}

testScreencast().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
