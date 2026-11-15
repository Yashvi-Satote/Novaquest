import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function recordScene1() {
  const sceneDir = 'C:\\Users\\mitro\\project\\NQ\\production\\tutorial_30s\\scene1_frames';
  if (fs.existsSync(sceneDir)) fs.rmSync(sceneDir, { recursive: true, force: true });
  fs.mkdirSync(sceneDir, { recursive: true });

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
  console.log('Opening http://localhost:5173/app ...');
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle2' });
  
  // Wait 1 second for initial render
  await new Promise(r => setTimeout(r, 1000));

  const client = await page.target().createCDPSession();
  let frameCount = 0;
  let recording = true;

  client.on('Page.screencastFrame', ({ data, sessionId }) => {
    if (recording) {
      frameCount++;
      const framePath = path.join(sceneDir, `frame_${frameCount.toString().padStart(5, '0')}.jpg`);
      fs.writeFileSync(framePath, Buffer.from(data, 'base64'));
    }
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  console.log('Recording Scene 1 (4.0s)...');
  const startTime = Date.now();
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  await new Promise(r => setTimeout(r, 4000));
  const elapsedSec = (Date.now() - startTime) / 1000;
  recording = false;
  await client.send('Page.stopScreencast').catch(() => {});
  await browser.close();

  console.log(`Captured ${frameCount} frames in ${elapsedSec.toFixed(2)}s.`);

  const inputFps = frameCount / 4.0;
  const outVideo = 'C:\\Users\\mitro\\project\\NQ\\production\\tutorial_30s\\scene1_raw.mp4';
  
  console.log(`Encoding to ${outVideo} at 30 fps (input rate: ${inputFps.toFixed(2)})...`);
  const cmd = `ffmpeg -y -r ${inputFps.toFixed(2)} -i "${sceneDir}\\frame_%05d.jpg" -t 4.0 -vf "scale=1920:1080,fps=30" -c:v libx264 -pix_fmt yuv420p -preset fast "${outVideo}"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log('Scene 1 encoding complete!');
}

recordScene1().catch(err => {
  console.error(err);
  process.exit(1);
});
