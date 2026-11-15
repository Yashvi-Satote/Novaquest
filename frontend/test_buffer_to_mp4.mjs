import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testBufferToMp4() {
  const outDir = 'C:\\Users\\mitro\\project\\NQ\\production\\tutorial_30s\\test_captures';
  fs.mkdirSync(outDir, { recursive: true });
  const outVideo = path.join(outDir, 'test_buffered_home.mp4');

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
  await new Promise(r => setTimeout(r, 1200));

  const client = await page.target().createCDPSession();
  const frames = [];
  let recording = true;

  client.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    if (recording) {
      frames.push(Buffer.from(data, 'base64'));
    }
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  console.log('Recording frames...');
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 90,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  // Record for 3 seconds
  await new Promise(r => setTimeout(r, 3000));
  recording = false;
  await client.send('Page.stopScreencast').catch(() => {});
  await browser.close();

  console.log(`Buffered ${frames.length} frames. Feeding to FFmpeg...`);

  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '30',
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-vf', 'scale=1920:1080',
    '-r', '30',
    outVideo
  ]);

  for (const buf of frames) {
    ffmpeg.stdin.write(buf);
  }
  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', code => {
      console.log(`FFmpeg encoding finished with exit code ${code}`);
      resolve();
    });
    ffmpeg.on('error', reject);
  });
}

testBufferToMp4().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
