import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTests() {
  console.log('🚀 Starting NovaMap Onboarding & Guided Tutorial automated test suite...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const results = [];
  const record = (name, passed, detail = '') => {
    results.push({ name, passed, detail });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} ${detail ? '(' + detail + ')' : ''}`);
  };

  try {
    // -------------------------------------------------------------------------
    // TEST 1: First-time visit displays Welcome Modal
    // -------------------------------------------------------------------------
    await page.goto('http://localhost:5173/novamap', { waitUntil: 'domcontentloaded' });
    // Clear localStorage to simulate brand new user
    await page.evaluate(() => {
      localStorage.removeItem('novamap_onboarding_status_v1');
      sessionStorage.removeItem('novamap_onboarding_session_deferred');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    const welcomeModal = await page.$('#novamap-welcome-screen');
    const welcomeTitle = await page.$eval('#novamap-welcome-title', el => el?.textContent?.trim()).catch(() => null);
    record('Test 1: First-time NovaMap visit displays Welcome Modal', Boolean(welcomeModal) && welcomeTitle === 'WELCOME TO NOVAMAP', `Title: ${welcomeTitle}`);

    // Check the 3 buttons
    const startTourBtn = await page.$('#onboarding-start-tour-btn');
    const exploreBtn = await page.$('#onboarding-explore-btn');
    const maybeLaterBtn = await page.$('#onboarding-maybe-later-btn');
    record('Test 1b: Welcome modal contains 3 required choice buttons', Boolean(startTourBtn && exploreBtn && maybeLaterBtn));

    // -------------------------------------------------------------------------
    // TEST 2: "EXPLORE ON MY OWN" stores 'completed' in localStorage and closes modal
    // -------------------------------------------------------------------------
    await page.click('#onboarding-explore-btn');
    await new Promise(r => setTimeout(r, 600));
    const isWelcomeClosed = await page.$eval('#novamap-welcome-screen', el => !el || el.offsetParent === null).catch(() => true);
    const storedStatusAfterExplore = await page.evaluate(() => localStorage.getItem('novamap_onboarding_status_v1'));
    record('Test 2: "EXPLORE ON MY OWN" closes modal & sets status=completed', isWelcomeClosed && storedStatusAfterExplore === 'completed', `localStorage: ${storedStatusAfterExplore}`);

    // Reload page to verify it does NOT automatically show again
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    const welcomeStillHidden = await page.$eval('#novamap-welcome-screen', el => !el || el.offsetParent === null).catch(() => true);
    record('Test 2b: Modal does not re-appear on subsequent visits after explore', welcomeStillHidden);

    // -------------------------------------------------------------------------
    // TEST 3: Replay Tutorial using Floating Dock Help Button
    // -------------------------------------------------------------------------
    const dockHelpBtn = await page.$('#dock-start-tutorial-btn');
    record('Test 3a: Dock Help / Start Tutorial button exists', Boolean(dockHelpBtn));
    if (dockHelpBtn) {
      await page.click('#dock-start-tutorial-btn');
      await new Promise(r => setTimeout(r, 600));
      const welcomeReopened = await page.$('#novamap-welcome-screen');
      record('Test 3b: Clicking Dock Help button re-triggers tutorial welcome modal', Boolean(welcomeReopened));
    }

    // -------------------------------------------------------------------------
    // TEST 4: "MAYBE LATER" defers for session
    // -------------------------------------------------------------------------
    await page.click('#onboarding-maybe-later-btn');
    await new Promise(r => setTimeout(r, 600));
    const deferredInSession = await page.evaluate(() => sessionStorage.getItem('novamap_onboarding_session_deferred'));
    record('Test 4: "MAYBE LATER" sets sessionStorage deferred flag', deferredInSession === 'deferred');

    // -------------------------------------------------------------------------
    // TEST 5: Guided Tour 7 Steps Flow
    // -------------------------------------------------------------------------
    // Re-open tutorial
    await page.click('#dock-start-tutorial-btn');
    await new Promise(r => setTimeout(r, 600));
    await page.click('#onboarding-start-tour-btn');
    await new Promise(r => setTimeout(r, 800));

    // STEP 1: EXPLORE THE SOLAR SYSTEM
    let stepTitle = await page.$eval('#novamap-guided-tutorial-overlay h2', el => el.textContent.trim()).catch(() => '');
    record('Test 5a: Step 1 (EXPLORE THE SOLAR SYSTEM) active', stepTitle.includes('EXPLORE THE SOLAR SYSTEM'), `Title: ${stepTitle}`);

    // Verify SVG mask spotlight exists
    const spotlightMask = await page.$('#tutorial-spotlight-mask');
    record('Test 5b: SVG Spotlight mask active in DOM', Boolean(spotlightMask));

    // Advance to STEP 2
    await page.click('#tutorial-next-btn');
    await new Promise(r => setTimeout(r, 600));
    stepTitle = await page.$eval('#novamap-guided-tutorial-overlay h2', el => el.textContent.trim()).catch(() => '');
    record('Test 5c: Step 2 (CAMERA NAVIGATION) active', stepTitle.includes('CAMERA NAVIGATION'), `Title: ${stepTitle}`);

    // Simulate drag interaction in Step 2 to test auto-action detection
    const canvas = await page.$('.novamap-viewport-canvas-area');
    if (canvas) {
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + 300, box.y + 300);
      await page.mouse.down();
      await page.mouse.move(box.x + 400, box.y + 350, { steps: 5 });
      await page.mouse.up();
      await new Promise(r => setTimeout(r, 400));
    }
    const actionDetectedStep2 = await page.$eval('#novamap-guided-tutorial-overlay', el => el.textContent.includes('Action Detected')).catch(() => false);
    record('Test 5d: Step 2 detects real mouse drag camera movement', actionDetectedStep2);

    // Advance to STEP 3: ZOOM CONTROLS
    await page.click('#tutorial-next-btn');
    await new Promise(r => setTimeout(r, 600));
    stepTitle = await page.$eval('#novamap-guided-tutorial-overlay h2', el => el.textContent.trim()).catch(() => '');
    record('Test 5e: Step 3 (ZOOM CONTROLS) active', stepTitle.includes('ZOOM CONTROLS'), `Title: ${stepTitle}`);

    // Simulate wheel zoom in Step 3
    await page.mouse.wheel({ deltaY: -50 });
    await new Promise(r => setTimeout(r, 400));
    const actionDetectedStep3 = await page.$eval('#novamap-guided-tutorial-overlay', el => el.textContent.includes('Action Detected')).catch(() => false);
    record('Test 5f: Step 3 detects real mouse wheel zoom', actionDetectedStep3);

    // Advance to STEP 4: SELECT A PLANET
    await page.click('#tutorial-next-btn');
    await new Promise(r => setTimeout(r, 600));
    stepTitle = await page.$eval('#novamap-guided-tutorial-overlay h2', el => el.textContent.trim()).catch(() => '');
    record('Test 5g: Step 4 (SELECT A PLANET) active', stepTitle.includes('SELECT A PLANET'), `Title: ${stepTitle}`);

    // Click interactive "Focus Mars" button in Step 4
    const focusMarsBtn = await page.$('#tutorial-focus-mars-btn');
    record('Test 5h: Step 4 "Focus Mars" action button present', Boolean(focusMarsBtn));
    if (focusMarsBtn) {
      await page.click('#tutorial-focus-mars-btn');
      await new Promise(r => setTimeout(r, 1000));
    }

    // Advance to STEP 5: PLANET INFORMATION
    await page.click('#tutorial-next-btn');
    await new Promise(r => setTimeout(r, 800));
    stepTitle = await page.$eval('#novamap-guided-tutorial-overlay h2', el => el.textContent.trim()).catch(() => '');
    record('Test 5i: Step 5 (PLANET INFORMATION) active', stepTitle.includes('PLANET INFORMATION'), `Title: ${stepTitle}`);

    // Check if CelestialDetailDrawer is visibly rendered with real Mars facts
    const drawer = await page.$('#celestial-detail-drawer');
    const drawerText = drawer ? await page.$eval('#celestial-detail-drawer', el => el.textContent) : '';
    const hasMarsDetails = drawerText.includes('Mars') || drawerText.includes('Diameter') || drawerText.includes('Distance');
    record('Test 5j: Step 5 highlights real CelestialDetailDrawer with planetary telemetry', Boolean(drawer && hasMarsDetails));

    // Advance to STEP 6: SOLAR SYSTEM CONTROLS
    await page.click('#tutorial-next-btn');
    await new Promise(r => setTimeout(r, 600));
    stepTitle = await page.$eval('#novamap-guided-tutorial-overlay h2', el => el.textContent.trim()).catch(() => '');
    record('Test 5k: Step 6 (SOLAR SYSTEM CONTROLS) active', stepTitle.includes('SOLAR SYSTEM CONTROLS'), `Title: ${stepTitle}`);

    // Advance to STEP 7: FREE EXPLORATION
    await page.click('#tutorial-next-btn');
    await new Promise(r => setTimeout(r, 600));
    stepTitle = await page.$eval('#novamap-guided-tutorial-overlay h2', el => el.textContent.trim()).catch(() => '');
    const startExploringBtn = await page.$('#tutorial-start-exploring-btn');
    record('Test 5l: Step 7 (FREE EXPLORATION) with "START EXPLORING" button', stepTitle.includes('FREE EXPLORATION') && Boolean(startExploringBtn));

    // Click "START EXPLORING"
    await page.click('#tutorial-start-exploring-btn');
    await new Promise(r => setTimeout(r, 600));
    const tutorialFinished = await page.$eval('#novamap-guided-tutorial-overlay', el => !el || el.offsetParent === null).catch(() => true);
    const finalStoredStatus = await page.evaluate(() => localStorage.getItem('novamap_onboarding_status_v1'));
    record('Test 5m: "START EXPLORING" finishes tour and marks status=completed', tutorialFinished && finalStoredStatus === 'completed');

    // -------------------------------------------------------------------------
    // TEST 6: Keyboard Navigation (Enter, Escape, Left/Right arrows)
    // -------------------------------------------------------------------------
    await page.click('#dock-start-tutorial-btn');
    await new Promise(r => setTimeout(r, 500));
    // Press Enter on welcome screen to start tour
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 600));
    let currentStepNum = await page.$eval('#novamap-guided-tutorial-overlay', el => el.textContent.includes('Step 1 of 7')).catch(() => false);
    record('Test 6a: Enter key starts guided tour from welcome modal', currentStepNum);

    // ArrowRight advances to step 2
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 500));
    currentStepNum = await page.$eval('#novamap-guided-tutorial-overlay', el => el.textContent.includes('Step 2 of 7')).catch(() => false);
    record('Test 6b: ArrowRight key advances to next step', currentStepNum);

    // ArrowLeft goes back to step 1
    await page.keyboard.press('ArrowLeft');
    await new Promise(r => setTimeout(r, 500));
    currentStepNum = await page.$eval('#novamap-guided-tutorial-overlay', el => el.textContent.includes('Step 1 of 7')).catch(() => false);
    record('Test 6c: ArrowLeft key returns to previous step', currentStepNum);

    // Escape closes tutorial
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
    const closedViaEsc = await page.$eval('#novamap-guided-tutorial-overlay', el => !el || el.offsetParent === null).catch(() => true);
    record('Test 6d: Escape key closes/skips guided tour', closedViaEsc);

    // -------------------------------------------------------------------------
    // TEST 7: Mobile Viewport (< 768px) Bottom-Sheet Layout
    // -------------------------------------------------------------------------
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.click('#dock-start-tutorial-btn');
    await new Promise(r => setTimeout(r, 500));
    await page.click('#onboarding-start-tour-btn');
    await new Promise(r => setTimeout(r, 600));

    // Check if bottom-sheet classes are applied
    const isBottomSheet = await page.evaluate(() => {
      const tooltip = document.querySelector('#novamap-guided-tutorial-overlay .pointer-events-auto');
      if (!tooltip) return false;
      const rect = tooltip.getBoundingClientRect();
      // Should be docked to bottom
      return rect.bottom >= window.innerHeight - 5 && rect.width >= 350;
    });
    record('Test 7: Mobile viewport (<768px) displays bottom-sheet layout', isBottomSheet);

    // Close tutorial
    await page.click('#novamap-guided-tutorial-overlay button[aria-label="Close tutorial"]');
    await new Promise(r => setTimeout(r, 500));

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------
    const passedCount = results.filter(r => r.passed).length;
    console.log(`\n========================================`);
    console.log(`TEST SUITE RESULTS: ${passedCount}/${results.length} PASSED`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
  }
}

runTests();
