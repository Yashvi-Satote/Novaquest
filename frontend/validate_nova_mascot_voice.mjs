import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/mitro/.gemini/antigravity/brain/aa6832b1-1a7a-4104-bcc3-781137851120/validation_screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMascotValidation() {
  console.log('================================================================');
  console.log('NOVAQUEST — ANIMATED ASTRONAUT MASCOT & VOICE NARRATION TEST');
  console.log('================================================================');

  const testResults = [];
  const errors = [];

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--use-gl=angle',
      '--ignore-gpu-blocklist',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
      console.error(`[Browser Error]: ${text}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
    console.error(`[Page Error]: ${err}`);
  });

  try {
    // ------------------------------------------------------------------------
    // SETUP: Open NovaMap and wrap SpeechSynthesis to inspect spoken words
    // ------------------------------------------------------------------------
    await page.evaluateOnNewDocument(() => {
      window.__speechLog = [];
      window.__cancelCount = 0;

      const wrap = () => {
        if (window.speechSynthesis && !window.__speechWrapped) {
          window.__speechWrapped = true;
          const origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
          const origCancel = window.speechSynthesis.cancel.bind(window.speechSynthesis);

          window.speechSynthesis.speak = (utt) => {
            window.__speechLog.push({
              text: utt.text,
              time: Date.now()
            });
            if (utt.onstart) setTimeout(() => utt.onstart(), 50);
            try { origSpeak(utt); } catch (e) {}
          };

          window.speechSynthesis.cancel = () => {
            window.__cancelCount++;
            try { origCancel(); } catch (e) {}
          };
        }
      };

      wrap();
      window.addEventListener('DOMContentLoaded', wrap);
    });

    console.log('\nNavigating to http://127.0.0.1:5173/novamap ...');
    await page.goto('http://127.0.0.1:5173/novamap', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(2500);

    // ------------------------------------------------------------------------
    // TEST 1: Strict Verification of ZERO CHAT INTERFACE
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 1: Zero Chat Interface Verification ---');
    const chatAudit = await page.evaluate(() => {
      return {
        hasChatWindow: Boolean(document.getElementById('nova-companion-window')),
        hasChatInput: Boolean(document.getElementById('nova-companion-input')),
        hasSendBtn: Boolean(document.getElementById('nova-companion-send-btn')),
        hasSuggestedQuestions: Boolean(document.querySelector('.suggested-question-btn')),
        hasChatBubbles: Boolean(document.querySelector('.nova-chat-bubble')),
        containerPresent: Boolean(document.getElementById('nova-companion-container')),
        hasMascotSvg: Boolean(document.getElementById('nova-mascot-character') || document.querySelector('.nova-mascot-float') || document.querySelector('img[alt*="NOVA"]')),
        hasMuteBtn: Boolean(document.getElementById('nova-mute-btn')),
        hasReplayBtn: Boolean(document.getElementById('nova-replay-btn')),
        hasHideBtn: Boolean(document.getElementById('nova-hide-btn'))
      };
    });

    console.log('Chat Audit Results:', chatAudit);
    const zeroChatPassed = !chatAudit.hasChatWindow && !chatAudit.hasChatInput && !chatAudit.hasSendBtn;
    const mascotPresent = chatAudit.containerPresent && chatAudit.hasMascotSvg && chatAudit.hasMuteBtn;

    testResults.push({
      test: 'Zero Chatbox / Pure Mascot Layout',
      passed: zeroChatPassed && mascotPresent,
      details: chatAudit
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_pure_mascot_solar_system.png') });
    console.log('Saved: 01_pure_mascot_solar_system.png');

    // ------------------------------------------------------------------------
    // TEST 2: Select Mars -> Object-Aware Voice Narration & Gestures
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 2: Select Mars -> Object-Aware Voice Narration ---');
    // Open sidebar via dock
    await page.click('#dock-toggle-sidebar-btn');
    await sleep(800);

    // Click Planets Tab in Sidebar
    await page.click('#sidebar-tab-planets');
    await sleep(800);

    // Scroll to & Click Mars
    await page.evaluate(() => {
      const el = document.getElementById('planet-sidebar-item-mars');
      if (el) {
        el.scrollIntoView();
        el.click();
      }
    });
    await sleep(2500);

    const marsSpeechStatus = await page.evaluate(() => {
      const log = window.__speechLog || [];
      const lastSpoken = log[log.length - 1];
      const hasGesture = Boolean(document.querySelector('.nova-arm-right-gesture') || document.querySelector('.nova-mouth-speech'));
      return {
        speechCallsCount: log.length,
        lastSpokenText: lastSpoken?.text || null,
        isMarsGrounded: lastSpoken ? (lastSpoken.text.includes('Mars') || lastSpoken.text.includes('Red Planet') || lastSpoken.text.includes('Olympus Mons')) : false,
        hasActiveGesturesOrSpeech: hasGesture
      };
    });

    console.log('Mars Voice Status:', marsSpeechStatus);
    testResults.push({
      test: 'Mars Object-Aware Voice Narration & Mascot Reaction',
      passed: marsSpeechStatus.isMarsGrounded,
      details: marsSpeechStatus
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_mascot_mars_narration.png') });
    console.log('Saved: 02_mascot_mars_narration.png');

    // ------------------------------------------------------------------------
    // TEST 3: Select Saturn -> Immediate Speech Cancellation & New Narration
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 3: Select Saturn -> Speech Cancellation & Switching ---');
    const cancelCountBeforeSaturn = await page.evaluate(() => window.__cancelCount);

    // Scroll to & Click Saturn
    await page.evaluate(() => {
      const el = document.getElementById('planet-sidebar-item-saturn');
      if (el) {
        el.scrollIntoView();
        el.click();
      }
    });
    await sleep(2500);

    const saturnSpeechStatus = await page.evaluate((beforeCount) => {
      const log = window.__speechLog || [];
      const lastSpoken = log[log.length - 1];
      const cancels = window.__cancelCount;
      return {
        speechCallsCount: log.length,
        lastSpokenText: lastSpoken?.text || null,
        isSaturnGrounded: lastSpoken ? (lastSpoken.text.includes('Saturn') || lastSpoken.text.includes('rings')) : false,
        speechWasCancelledFirst: cancels > beforeCount
      };
    }, cancelCountBeforeSaturn);

    console.log('Saturn Voice Status:', saturnSpeechStatus);
    testResults.push({
      test: 'Saturn Voice Narration with Immediate Cancellation',
      passed: saturnSpeechStatus.isSaturnGrounded && saturnSpeechStatus.speechWasCancelledFirst,
      details: saturnSpeechStatus
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_mascot_saturn_narration.png') });
    console.log('Saved: 03_mascot_saturn_narration.png');

    // ------------------------------------------------------------------------
    // TEST 4: Select Voyager 1 -> Main 3D Spacecraft Inspection & Narration
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 4: Select Voyager 1 -> Main 3D Spacecraft Inspection & Narration ---');
    // Switch tab to Spacecraft Missions
    await page.click('#sidebar-tab-spacecraft');
    await sleep(1000);

    // Scroll to & Click Voyager 1 card
    await page.evaluate(() => {
      const el = document.getElementById('mission-card-voyager-1');
      if (el) {
        el.scrollIntoView();
        el.click();
      }
    });
    await sleep(4000);

    const voyagerStatus = await page.evaluate(() => {
      const log = window.__speechLog || [];
      const lastSpoken = log[log.length - 1];
      const returnBtn = document.getElementById('return-to-solar-system-btn');
      return {
        hasReturnBtn: Boolean(returnBtn),
        lastSpokenText: lastSpoken?.text || null,
        isVoyagerGrounded: lastSpoken ? (lastSpoken.text.includes('Voyager') || lastSpoken.text.includes('1977') || lastSpoken.text.includes('Golden Record') || lastSpoken.text.includes('interstellar')) : false
      };
    });

    console.log('Voyager 1 Status:', voyagerStatus);
    testResults.push({
      test: 'Voyager 1 Main-Scene 3D Inspection & Companion Narration',
      passed: voyagerStatus.hasReturnBtn && voyagerStatus.isVoyagerGrounded,
      details: voyagerStatus
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_mascot_voyager1_narration.png') });
    console.log('Saved: 04_mascot_voyager1_narration.png');

    // ------------------------------------------------------------------------
    // TEST 5: Minimize and Restore Mascot Character
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 5: Minimize and Restore Mascot Controls ---');
    // Click hide button
    await page.click('#nova-hide-btn');
    await sleep(600);

    const minimizedStatus = await page.evaluate(() => {
      return {
        hasExpandBtn: Boolean(document.getElementById('nova-expand-btn')),
        hasControlsPill: Boolean(document.getElementById('nova-companion-controls'))
      };
    });
    console.log('Minimized state:', minimizedStatus);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_mascot_minimized.png') });
    console.log('Saved: 05_mascot_minimized.png');

    // Click expand button to restore
    await page.click('#nova-expand-btn');
    await sleep(600);

    const restoredStatus = await page.evaluate(() => {
      return {
        hasExpandBtn: Boolean(document.getElementById('nova-expand-btn')),
        hasControlsPill: Boolean(document.getElementById('nova-companion-controls')),
        hasMascotSvg: Boolean(document.getElementById('nova-mascot-character') || document.querySelector('.nova-mascot-float') || document.querySelector('img[alt*="NOVA"]'))
      };
    });
    console.log('Restored state:', restoredStatus);

    testResults.push({
      test: 'Minimize / Expand Mascot Controls',
      passed: minimizedStatus.hasExpandBtn && !minimizedStatus.hasControlsPill && restoredStatus.hasControlsPill && restoredStatus.hasMascotSvg,
      details: { minimized: minimizedStatus, restored: restoredStatus }
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_mascot_restored.png') });
    console.log('Saved: 06_mascot_restored.png');

    // ------------------------------------------------------------------------
    // TEST 6: Return to Solar System View
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 6: Return to Solar System ---');
    const returnBtn = await page.$('#return-to-solar-system-btn');
    if (returnBtn) {
      await returnBtn.click();
      await sleep(2000);
    }

    const finalState = await page.evaluate(() => {
      return {
        hasReturnBtn: Boolean(document.getElementById('return-to-solar-system-btn')),
        hasChatWindow: Boolean(document.getElementById('nova-companion-window')),
        hasChatInput: Boolean(document.getElementById('nova-companion-input')),
        hasMascot: Boolean(document.getElementById('nova-mascot-character') || document.querySelector('.nova-mascot-float') || document.querySelector('img[alt*="NOVA"]'))
      };
    });

    testResults.push({
      test: 'Safe Return to Solar System Overview',
      passed: !finalState.hasReturnBtn && !finalState.hasChatWindow && finalState.hasMascot,
      details: finalState
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_solar_system_final.png') });
    console.log('Saved: 07_solar_system_final.png');

    // Write JSON report
    const summaryReport = {
      timestamp: new Date().toISOString(),
      testsRun: testResults.length,
      testsPassed: testResults.filter(t => t.passed).length,
      testsFailed: testResults.filter(t => !t.passed).length,
      testResults,
      errors
    };

    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'nova_mascot_validation_report.json'),
      JSON.stringify(summaryReport, null, 2)
    );

    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${summaryReport.testsPassed}/${summaryReport.testsRun} PASSED`);
    console.log('================================================================');

  } catch (err) {
    console.error('Validation test encountered fatal error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runMascotValidation().catch(e => {
  console.error(e);
  process.exit(1);
});
