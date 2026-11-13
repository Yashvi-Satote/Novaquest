import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--enable-unsafe-swiftshader',
    '--window-size=1280,800',
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

const logs = [];
page.on('console', (msg) => {
  const text = msg.text();
  logs.push(`[console:${msg.type()}] ${text}`);
  console.log(`[console:${msg.type()}] ${text}`);
});
page.on('pageerror', (err) => {
  logs.push(`[pageerror] ${err.message}`);
  console.log(`[pageerror] ${err.message}`);
});
page.on('requestfailed', (req) => {
  const text = `[requestfailed] ${req.url()} :: ${req.failure()?.errorText}`;
  logs.push(text);
  console.log(text);
});

const assetResponses = [];
page.on('response', (res) => {
  const url = res.url();
  if (/\/models\/|\/basis\/|\/draco\//.test(url)) {
    assetResponses.push(`${res.status()} ${url}`);
  }
});

await page.goto('http://127.0.0.1:5199/old-lunar-map', {
  waitUntil: 'networkidle2',
  timeout: 120000,
});

// Let the chapter finish its sequential model loads and print memory stats.
await new Promise((resolve) => setTimeout(resolve, 15000));

const state = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  return {
    hasCanvas: Boolean(canvas),
    canvasSize: canvas ? `${canvas.width}x${canvas.height}` : null,
    bodyText: document.body.innerText.slice(0, 500),
    heap: performance.memory
      ? {
          usedJSHeapMB: Math.round(performance.memory.usedJSHeapSize / 1048576),
          totalJSHeapMB: Math.round(performance.memory.totalJSHeapSize / 1048576),
        }
      : null,
  };
});

console.log('\nASSET RESPONSES:\n' + assetResponses.join('\n'));
console.log('\nSTATE:\n' + JSON.stringify(state, null, 2));

await page.screenshot({ path: '../.tmp/lunar-map.png', fullPage: false });
await browser.close();
