import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testPipeToFFmpeg() {
  const outDir = 'C:\\Users\\mitro\\project\\NQ\\production\\tutorial_30s\\test_captures';
  fs.mkdirSync(outDir, { recursive: true });
  const outVideo = path.join(outDir, 'test_piped_output.mp4');

  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '30',
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-vf', 'scale=1920:1080',
    '-r', '30',
    outVideo
  ]);

  ffmpeg.stderr.on('data', data => {
    // console.log(data.toString());
  });

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
  let frameCount = 0;

  client.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    frameCount++;
    const buf = Buffer.from(data, 'base64');
    ffmpeg.stdin.write(buf);
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  console.log('Recording 3 seconds to FFmpeg directly...');
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  await new Promise(r => setTimeout(r, 3000));

  await client.send('Page.stopScreencast');
  console.log(`Finished recording. Sent ${frameCount} frames to FFmpeg.`);

  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', code => {
      console.log(`FFmpeg exited with code ${code}`);
      resolve();
    });
    ffmpeg.on('error', reject);
  });

  await browser.close();
}

testPipeToFFmpeg().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
