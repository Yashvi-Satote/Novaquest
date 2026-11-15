import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: [
    '--window-size=1920,1080',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--enable-gpu-rasterization',
    '--use-gl=angle',
    '--use-angle=d3d11'
  ],
  defaultViewport: { width: 1920, height: 1080 }
});
const page = await browser.newPage();
await page.goto('http://localhost:5173/app', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1000));

await page.evaluate(() => {
  let count = 0;
  function invalidate() {
    count++;
    document.body.dataset.tick = count;
    requestAnimationFrame(invalidate);
  }
  requestAnimationFrame(invalidate);
});

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
await client.send('Page.stopScreencast');
await browser.close();

console.log(`With continuous RAF invalidation: ${frames} frames in 3s (${(frames / 3).toFixed(1)} fps)`);
