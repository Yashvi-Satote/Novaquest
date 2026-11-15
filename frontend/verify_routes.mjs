import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROUTES = [
  { name: 'scene1_home', url: 'http://localhost:5173/app', wait: 2000 },
  { name: 'scene2_gameplay', url: 'http://localhost:5173/play', wait: 3500 },
  { name: 'scene3_novamap', url: 'http://localhost:5173/novamap', wait: 3000 },
  { name: 'scene4_novabase', url: 'http://localhost:5173/novabase', wait: 2500 },
  { name: 'scene5_memoir', url: 'http://localhost:5173/memoir', wait: 2500 }
];

async function verifyAllRoutes() {
  const testDir = 'C:\\Users\\mitro\\project\\NQ\\production\\tutorial_30s\\route_checks';
  fs.mkdirSync(testDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--window-size=1920,1080',
      '--disable-gpu-sandbox',
      '--no-sandbox',
      '--hide-scrollbars',
      '--mute-audio',
      '--use-gl=angle',
      '--use-angle=d3d11'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    }
  });

  const page = await browser.newPage();

  for (const r of ROUTES) {
    console.log(`Checking ${r.name} (${r.url})...`);
    await page.goto(r.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(res => setTimeout(res, r.wait));
    const shotPath = path.join(testDir, `${r.name}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`  -> OK: Saved ${shotPath}`);
  }

  await browser.close();
  console.log('All 5 core routes verified!');
}

verifyAllRoutes().catch(err => {
  console.error(err);
  process.exit(1);
});
