import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  defaultViewport: { width: 1920, height: 1080 }
});
const page = await browser.newPage();
await page.goto('http://localhost:5173/app', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1000));
const t0 = Date.now();
for (let i = 0; i < 10; i++) {
  await page.screenshot({ type: 'jpeg', quality: 80 });
}
const elapsed = Date.now() - t0;
console.log('10 screenshots took:', elapsed, 'ms (', (10 / (elapsed / 1000)).toFixed(1), 'fps)');
await browser.close();
