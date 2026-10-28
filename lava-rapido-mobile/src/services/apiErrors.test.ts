import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { classifyApiError } from './apiErrors.ts';

function httpError(status: number) {
  return Object.assign(new Error('technical detail'), {
    isAxiosError: true,
    response: { status },
  });
}

test('classifies transport failures without exposing technical details', () => {
  assert.equal(classifyApiError(Object.assign(new Error('timeout'), {
    isAxiosError: true,
    code: 'ECONNABORTED',
  })), 'timeout');
  assert.equal(classifyApiError(Object.assign(new Error('offline'), {
    isAxiosError: true,
    code: 'ERR_NETWORK',
  })), 'network');
  assert.equal(classifyApiError(Object.assign(new Error('refused'), {
    isAxiosError: true,
    code: 'ECONNREFUSED',
  })), 'server_unavailable');
  assert.equal(axios.isAxiosError(Object.assign(new Error('offline'), { isAxiosError: true })), true);
});

test('preserves the semantic HTTP status categories used by the UI', () => {
  assert.equal(classifyApiError(httpError(400)), 'bad_request');
  assert.equal(classifyApiError(httpError(401)), 'unauthorized');
  assert.equal(classifyApiError(httpError(403)), 'forbidden');
  assert.equal(classifyApiError(httpError(404)), 'not_found');
  assert.equal(classifyApiError(httpError(409)), 'conflict');
  assert.equal(classifyApiError(httpError(422)), 'validation');
  assert.equal(classifyApiError(httpError(500)), 'server');
  assert.equal(classifyApiError(httpError(502)), 'server');
  assert.equal(classifyApiError(httpError(503)), 'server');
  assert.equal(classifyApiError(httpError(504)), 'server');
});
