import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiUrl } from './apiUrl.ts';

test('exige una API HTTPS pública configurable', () => {
  assert.equal(resolveApiUrl('https://api.example.test/', false), 'https://api.example.test');
  assert.throws(() => resolveApiUrl(undefined, false));
  assert.throws(() => resolveApiUrl('http://api.example.test', false));
  assert.throws(() => resolveApiUrl('https://usuario:clave@api.example.test', false));
  assert.throws(() => resolveApiUrl('https://api.example.test/api', false));
});

test('permite HTTP local solamente en desarrollo', () => {
  assert.equal(resolveApiUrl('http://10.0.2.2:8081', true), 'http://10.0.2.2:8081');
  assert.throws(() => resolveApiUrl('http://10.0.2.2:8081', false));
});
