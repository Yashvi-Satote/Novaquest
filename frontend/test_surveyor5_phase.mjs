import puppeteer from 'puppeteer-core';

async function testPage() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating...');
  await page.goto('http://127.0.0.1:5173/play/surveyor-5', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const skipBtn = await page.$('#skip-to-moon-btn');
  console.log('Skip button found:', !!skipBtn);
  if (skipBtn) {
    console.log('Clicking skip button...');
    await skipBtn.click();
    await new Promise(r => setTimeout(r, 2000));
  }

  const phaseText = await page.evaluate(() => {
    return {
      hudTitle: document.querySelector('h1')?.innerText,
      hasCompass: !!document.querySelector('.animate-spin'),
      hasSkipBtn: !!document.querySelector('#skip-to-moon-btn'),
      interactBtn: document.querySelector('#interact-action-btn')?.innerText
    };
  });
  console.log('Phase state in DOM:', phaseText);

  await browser.close();
}

testPage().catch(console.error);

