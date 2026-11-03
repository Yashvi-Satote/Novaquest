import assert from 'node:assert/strict';
import test from 'node:test';
import { getRedirectTarget, normalizeRedirectTarget } from '../redirect.js';

test('normalizeRedirectTarget keeps safe in-app paths', () => {
  assert.equal(normalizeRedirectTarget('/settings'), '/settings');
  assert.equal(normalizeRedirectTarget('/novamap?focus=earth#orbit'), '/novamap?focus=earth#orbit');
});

test('normalizeRedirectTarget accepts router locations', () => {
  assert.equal(
    normalizeRedirectTarget({ pathname: '/settings', search: '?tab=audio', hash: '#account' }),
    '/settings?tab=audio#account',
  );
});

test('normalizeRedirectTarget rejects unsafe or external targets', () => {
  assert.equal(normalizeRedirectTarget(null), '/app');
  assert.equal(normalizeRedirectTarget('https://example.test/phish'), '/app');
  assert.equal(normalizeRedirectTarget('//example.test/phish'), '/app');
  assert.equal(normalizeRedirectTarget('/login'), '/app');
  assert.equal(normalizeRedirectTarget('/novauser/signin?redirect=/settings'), '/app');
  assert.equal(normalizeRedirectTarget('/novauser/register'), '/app');
});

test('getRedirectTarget prefers state over the query string', () => {
  const location = { state: { from: '/novabase' }, search: '?redirect=/settings' };
  assert.equal(getRedirectTarget(location), '/novabase');
});

test('getRedirectTarget falls back to the query string and then /app', () => {
  assert.equal(getRedirectTarget({ search: '?redirect=/novamap' }), '/novamap');
  assert.equal(getRedirectTarget({ search: '?redirect=https://example.test' }), '/app');
  assert.equal(getRedirectTarget({}), '/app');
  assert.equal(getRedirectTarget(null), '/app');
});
