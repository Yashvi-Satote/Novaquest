import test from 'node:test';
import assert from 'node:assert/strict';
import { LAUNCH_VIDEO, HELIUM_T } from '../../../src/config/launchVideo.js';
import { TASK3_DATA } from '../../../src/config/task3Data.js';

test('LAUNCH_VIDEO configuration matches requirements', () => {
  assert.ok(
    LAUNCH_VIDEO.src === '/videos/surveyor5-launch.m4v' ||
    LAUNCH_VIDEO.src === '/videos/surveyor5-launch.mp4',
  );
  assert.equal(LAUNCH_VIDEO.part1.start, 0);
  assert.equal(LAUNCH_VIDEO.part1.end, 71);
  assert.equal(LAUNCH_VIDEO.part2.start, 71);
  assert.equal(LAUNCH_VIDEO.part2.end, HELIUM_T);
  assert.equal(LAUNCH_VIDEO.part3.start, HELIUM_T);
  assert.equal(LAUNCH_VIDEO.part3.end, null);
  assert.equal(typeof HELIUM_T, 'number');
});

test('TASK3_DATA has exactly 4 solution cards and exactly 1 correct solution', () => {
  const cards = TASK3_DATA.stepB.cards;
  assert.equal(cards.length, 4);

  const correctCards = cards.filter((c) => c.isCorrect);
  assert.equal(correctCards.length, 1);
  assert.ok(correctCards[0].text.includes('Change the landing plan'));

  // Ensure kid-friendly explanation and real NASA history fact are present
  assert.ok(TASK3_DATA.stepA.explanation.includes('Surveyor 5 uses helium gas like air in a balloon'));
  assert.ok(TASK3_DATA.stepC.funFact.includes('Real NASA engineers on Earth sent new instructions to Surveyor 5'));
});
