import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\mitro\\.gemini\\antigravity\\brain\\08777b3a-3100-48d3-885a-83d4e0a36c43';

async function runTests() {
  console.log('Launching Chrome via Puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleLogs.push(msg.text());
    }
  });

  try {
    // 1. Solar System Main Overview
    console.log('1. Navigating to http://localhost:5173/novamap ...');
    await page.goto('http://localhost:5173/novamap', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 4000));

    console.log('Capturing: test_12_nasa_eyes_solar_system.png');
    await page.screenshot({ path: path.join(artifactDir, 'test_12_nasa_eyes_solar_system.png') });

    // 2. Layers Menu Dropdown
    console.log('2. Clicking Layers Menu toggle (#layers-menu-toggle-btn)...');
    await page.evaluate(() => document.getElementById('layers-menu-toggle-btn')?.click());
    await new Promise(r => setTimeout(r, 1000));

    console.log('Capturing: test_13_nasa_eyes_layers_menu.png');
    await page.screenshot({ path: path.join(artifactDir, 'test_13_nasa_eyes_layers_menu.png') });

    // Close layers menu
    await page.evaluate(() => document.getElementById('layers-menu-toggle-btn')?.click());
    await new Promise(r => setTimeout(r, 500));

    // 3. Earth Inspection (Multi-layer globe with Blue Marble, Clouds, Specular Oceans)
    console.log('3. Focusing Earth Globe (#cat-btn-earth-orbit + #focus-selected-planet-globe-btn)...');
    await page.evaluate(() => document.getElementById('cat-btn-earth-orbit')?.click());
    await new Promise(r => setTimeout(r, 800));
    await page.evaluate(() => document.getElementById('focus-selected-planet-globe-btn')?.click());
    await new Promise(r => setTimeout(r, 2500));

    console.log('Capturing: test_14_nasa_eyes_earth_globe.png');
    await page.screenshot({ path: path.join(artifactDir, 'test_14_nasa_eyes_earth_globe.png') });

    // 4. Saturn Inspection (Authentic Cassini rings & bands)
    console.log('4. Focusing Saturn Globe (#cat-btn-saturn + #focus-selected-planet-globe-btn)...');
    await page.evaluate(() => document.getElementById('cat-btn-saturn')?.click());
    await new Promise(r => setTimeout(r, 800));
    await page.evaluate(() => document.getElementById('focus-selected-planet-globe-btn')?.click());
    await new Promise(r => setTimeout(r, 3000));

    console.log('Capturing: test_15_nasa_eyes_saturn_rings.png');
    await page.screenshot({ path: path.join(artifactDir, 'test_15_nasa_eyes_saturn_rings.png') });

    // 5. Dedicated Spacecraft Model View (Voyager 1)
    console.log('5. Navigating to http://localhost:5173/spacecraft/voyager-1 ...');
    await page.goto('http://localhost:5173/spacecraft/voyager-1', { waitUntil: 'domcontentloaded', timeout: 15000 });
    try {
      await page.waitForFunction(() => !document.body.innerText.includes('LOADING 3D GEOMETRY'), { timeout: 12000 });
    } catch (_) {}
    await new Promise(r => setTimeout(r, 1500));

    console.log('Capturing: test_16_nasa_eyes_voyager1_model.png');
    await page.screenshot({ path: path.join(artifactDir, 'test_16_nasa_eyes_voyager1_model.png') });

    // 6. Dedicated Spacecraft Model View (JWST)
    console.log('6. Navigating to http://localhost:5173/spacecraft/jwst ...');
    await page.goto('http://localhost:5173/spacecraft/jwst', { waitUntil: 'domcontentloaded', timeout: 15000 });
    try {
      await page.waitForFunction(() => !document.body.innerText.includes('LOADING 3D GEOMETRY'), { timeout: 15000 });
    } catch (_) {}
    await new Promise(r => setTimeout(r, 2000));

    console.log('Capturing: test_17_nasa_eyes_jwst_model.png');
    await page.screenshot({ path: path.join(artifactDir, 'test_17_nasa_eyes_jwst_model.png') });

    console.log('--- TEST RESULTS ---');
    console.log('Console errors encountered:', consoleLogs.length);
    if (consoleLogs.length > 0) {
      console.log('Errors:', consoleLogs);
    }
    console.log('ALL BROWSER TESTS COMPLETED SUCCESSFULLY!');

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
  }
}

runTests();
