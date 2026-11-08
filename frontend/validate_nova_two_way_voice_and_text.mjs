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

async function runTwoWayValidation() {
  console.log('================================================================');
  console.log('NOVAQUEST — TWO-WAY VOICE + WRITTEN TEXT VALIDATION TEST');
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
    // Wrap SpeechSynthesis and SpeechRecognition to simulate two-way voice in headless browser
    await page.evaluateOnNewDocument(() => {
      window.__speechLog = [];
      window.__cancelCount = 0;
      window.__recognitionSimulatedResult = null;

      // Mock SpeechRecognition for headless chrome test
      window.SpeechRecognition = class MockSpeechRecognition {
        constructor() {
          this.onstart = null;
          this.onresult = null;
          this.onerror = null;
          this.onend = null;
          window.__mockRecognitionInstance = this;
        }
        start() {
          if (this.onstart) this.onstart();
          setTimeout(() => {
            if (window.__triggerMicError) {
              if (this.onerror) this.onerror({ error: 'not-allowed' });
              window.__triggerMicError = false;
            } else if (window.__recognitionSimulatedResult) {
              if (this.onresult) {
                this.onresult({
                  results: [[{ transcript: window.__recognitionSimulatedResult }]]
                });
              }
              window.__recognitionSimulatedResult = null;
            }
            if (this.onend) this.onend();
          }, 350);
        }
        stop() {
          if (this.onend) this.onend();
        }
      };
      window.webkitSpeechRecognition = window.SpeechRecognition;

      // Wrap SpeechSynthesis
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
    // TEST 1: Initial Presentation of White/Blue Astronaut & Written Overlay
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 1: Initial Presentation ---');
    const initAudit = await page.evaluate(() => {
      const overlay = document.getElementById('nova-conversation-overlay');
      const avatarSvg = document.getElementById('nova-astronaut-svg');
      const micBtn = document.getElementById('nova-mic-btn');
      const textInput = document.getElementById('nova-text-input');
      return {
        hasOverlay: Boolean(overlay),
        hasAvatarSvg: Boolean(avatarSvg),
        hasMicBtn: Boolean(micBtn),
        hasTextInput: Boolean(textInput)
      };
    });

    console.log('Initial Audit:', initAudit);
    testResults.push({
      test: 'Astronaut Mascot & Compact Written Overlay Presentation',
      passed: initAudit.hasOverlay && initAudit.hasAvatarSvg && initAudit.hasMicBtn && initAudit.hasTextInput,
      details: initAudit
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_astronaut_companion_initial.png') });
    console.log('Saved: 01_astronaut_companion_initial.png');

    // ------------------------------------------------------------------------
    // TEST 2: Select Mars -> Spoken Voice AND Written Text Introduction
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 2: Select Mars -> Spoken + Written Introduction ---');
    await page.click('#dock-toggle-sidebar-btn');
    await sleep(800);
    await page.click('#sidebar-tab-planets');
    await sleep(800);

    await page.evaluate(() => {
      const el = document.getElementById('planet-sidebar-item-mars');
      if (el) {
        el.scrollIntoView();
        el.click();
      }
    });
    await sleep(2500);

    const marsStatus = await page.evaluate(() => {
      const overlayText = document.getElementById('nova-conversation-overlay')?.innerText || '';
      const speechLog = window.__speechLog || [];
      const lastSpoken = speechLog[speechLog.length - 1]?.text || '';
      return {
        overlayContainsMars: overlayText.includes('Mars') || overlayText.includes('Red Planet'),
        speechContainsMars: lastSpoken.includes('Mars') || lastSpoken.includes('Red Planet'),
        lastSpoken,
        overlayExcerpt: overlayText.slice(0, 150)
      };
    });

    console.log('Mars Status:', marsStatus);
    testResults.push({
      test: 'Mars Selection Voice & Written Introduction',
      passed: marsStatus.overlayContainsMars && marsStatus.speechContainsMars,
      details: marsStatus
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_mars_voice_and_written_intro.png') });
    console.log('Saved: 02_mars_voice_and_written_intro.png');

    // ------------------------------------------------------------------------
    // TEST 3: Ask "Can humans live on Mars?" via Simulated Voice Mic
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 3: Two-Way Voice: "Can humans live on Mars?" ---');
    await page.evaluate(() => {
      window.__recognitionSimulatedResult = 'Can humans live on Mars?';
    });

    // Click mic button
    await page.click('#nova-mic-btn');
    await sleep(2000);

    const marsHabitabilityStatus = await page.evaluate(() => {
      const overlayText = document.getElementById('nova-conversation-overlay')?.innerText || '';
      const speechLog = window.__speechLog || [];
      const lastSpoken = speechLog[speechLog.length - 1]?.text || '';
      return {
        userQuestionShown: overlayText.includes('Can humans live on Mars?'),
        answerContainsMarsHabitability: lastSpoken.includes('Mars') && (lastSpoken.includes('atmosphere') || lastSpoken.includes('carbon dioxide') || lastSpoken.includes('MOXIE') || lastSpoken.includes('habitats')),
        lastSpoken
      };
    });

    console.log('Mars Habitability Answer:', marsHabitabilityStatus);
    testResults.push({
      test: 'Two-Way Voice Question & Answer (Mars Habitability)',
      passed: marsHabitabilityStatus.userQuestionShown && marsHabitabilityStatus.answerContainsMarsHabitability,
      details: marsHabitabilityStatus
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_mars_habitability_voice_and_text.png') });
    console.log('Saved: 03_mars_habitability_voice_and_text.png');

    // ------------------------------------------------------------------------
    // TEST 4: Select Saturn -> Context Updates to Saturn
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 4: Select Saturn -> Context Updates to Saturn ---');
    const cancelCountBeforeSaturn = await page.evaluate(() => window.__cancelCount);

    await page.evaluate(() => {
      const el = document.getElementById('planet-sidebar-item-saturn');
      if (el) {
        el.scrollIntoView();
        el.click();
      }
    });
    await sleep(2500);

    const saturnStatus = await page.evaluate((beforeCancels) => {
      const overlayText = document.getElementById('nova-conversation-overlay')?.innerText || '';
      const speechLog = window.__speechLog || [];
      const lastSpoken = speechLog[speechLog.length - 1]?.text || '';
      return {
        speechWasCancelledFirst: window.__cancelCount > beforeCancels,
        overlayContainsSaturn: overlayText.includes('Saturn') || overlayText.includes('rings'),
        speechContainsSaturn: lastSpoken.includes('Saturn') && lastSpoken.includes('rings'),
        lastSpoken
      };
    }, cancelCountBeforeSaturn);

    console.log('Saturn Status:', saturnStatus);
    testResults.push({
      test: 'Saturn Context Switch & Speech Cancellation',
      passed: saturnStatus.speechWasCancelledFirst && saturnStatus.overlayContainsSaturn && saturnStatus.speechContainsSaturn,
      details: saturnStatus
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_saturn_context_switch.png') });
    console.log('Saved: 04_saturn_context_switch.png');

    // ------------------------------------------------------------------------
    // TEST 5: Follow-Up Question: "How many moons does it have?"
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 5: Follow-Up Question: "How many moons does it have?" ---');
    await page.evaluate(() => {
      window.__recognitionSimulatedResult = 'How many moons does it have?';
    });
    await page.click('#nova-mic-btn');
    await sleep(2000);

    const saturnMoonsStatus = await page.evaluate(() => {
      const overlayText = document.getElementById('nova-conversation-overlay')?.innerText || '';
      const speechLog = window.__speechLog || [];
      const lastSpoken = speechLog[speechLog.length - 1]?.text || '';
      return {
        questionShown: overlayText.includes('How many moons does it have?'),
        answerContains146Moons: lastSpoken.includes('146') || (lastSpoken.includes('moons') && lastSpoken.includes('Titan')),
        lastSpoken
      };
    });

    console.log('Saturn Moons Follow-up:', saturnMoonsStatus);
    testResults.push({
      test: 'Context-Aware Follow-Up Question (Saturn Moons)',
      passed: saturnMoonsStatus.questionShown && saturnMoonsStatus.answerContains146Moons,
      details: saturnMoonsStatus
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_saturn_moons_followup.png') });
    console.log('Saved: 05_saturn_moons_followup.png');

    // ------------------------------------------------------------------------
    // TEST 6: Microphone Permission Error Handling
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 6: Microphone Error Handling ---');
    await page.evaluate(() => {
      window.__triggerMicError = true;
    });
    await page.click('#nova-mic-btn');
    await sleep(800);

    const micErrorStatus = await page.evaluate(() => {
      const overlayText = document.getElementById('nova-conversation-overlay')?.innerText || '';
      return {
        showsPermissionDeniedWarning: overlayText.includes('Microphone permission denied') || overlayText.includes('permission')
      };
    });

    console.log('Mic Error Status:', micErrorStatus);
    testResults.push({
      test: 'Microphone Permission Error Handling Notice',
      passed: micErrorStatus.showsPermissionDeniedWarning,
      details: micErrorStatus
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_mic_error_handling.png') });
    console.log('Saved: 06_mic_error_handling.png');

    // ------------------------------------------------------------------------
    // TEST 7: Minimize and Expand Written Overlay
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 7: Minimize and Expand Written Overlay ---');
    // Minimize card
    await page.click('#nova-card-minimize-btn');
    await sleep(600);

    const cardMinimized = await page.evaluate(() => {
      return !document.getElementById('nova-conversation-overlay');
    });

    // Expand card via pill button
    await page.click('#nova-toggle-card-btn');
    await sleep(600);

    const cardRestored = await page.evaluate(() => {
      return Boolean(document.getElementById('nova-conversation-overlay'));
    });

    testResults.push({
      test: 'Minimize and Expand Written Conversation Overlay',
      passed: cardMinimized && cardRestored,
      details: { cardMinimized, cardRestored }
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_overlay_minimized_and_restored.png') });
    console.log('Saved: 07_overlay_minimized_and_restored.png');

    // ------------------------------------------------------------------------
    // TEST 8: Full 3D Spacecraft Inspection Compatibility (Voyager 1)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 8: Voyager 1 Spacecraft Inspection ---');
    const hasSpacecraftTab = await page.evaluate(() => Boolean(document.getElementById('sidebar-tab-spacecraft')));
    if (!hasSpacecraftTab) {
      await page.click('#dock-toggle-sidebar-btn');
      await sleep(800);
    }
    await page.click('#sidebar-tab-spacecraft');
    await sleep(1000);

    await page.evaluate(() => {
      const el = document.getElementById('mission-card-voyager-1');
      if (el) {
        el.scrollIntoView();
        el.click();
      }
    });
    await sleep(4000);

    const v1Status = await page.evaluate(() => {
      const returnBtn = document.getElementById('return-to-solar-system-btn');
      const overlayText = document.getElementById('nova-conversation-overlay')?.innerText || '';
      return {
        hasReturnBtn: Boolean(returnBtn),
        overlayContainsVoyager: overlayText.includes('Voyager 1') || overlayText.includes('1977')
      };
    });

    testResults.push({
      test: 'Voyager 1 In-Scene 3D Inspection with Companion Synchronization',
      passed: v1Status.hasReturnBtn && v1Status.overlayContainsVoyager,
      details: v1Status
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_voyager1_3d_inspection_and_companion.png') });
    console.log('Saved: 08_voyager1_3d_inspection_and_companion.png');

    // Return to Solar System
    await page.click('#return-to-solar-system-btn');
    await sleep(2000);

    // Write final summary
    const summary = {
      timestamp: new Date().toISOString(),
      testsRun: testResults.length,
      testsPassed: testResults.filter(t => t.passed).length,
      testsFailed: testResults.filter(t => !t.passed).length,
      testResults,
      errors
    };

    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'nova_two_way_voice_report.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${summary.testsPassed}/${summary.testsRun} PASSED`);
    console.log('================================================================');

  } catch (err) {
    console.error('Validation test failed with exception:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runTwoWayValidation().catch(e => {
  console.error(e);
  process.exit(1);
});
