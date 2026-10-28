import assert from 'node:assert/strict';
import test from 'node:test';
import { extractPasswordResetToken } from './passwordResetLink.ts';

const resetUrl = 'https://app.example.test/reset-password';

test('extracts a token from the configured reset URL', () => {
  assert.deepEqual(
    extractPasswordResetToken('https://app.example.test/reset-password?token=abc%2B123', resetUrl),
    { valid: true, token: 'abc+123' },
  );
});

test('rejects reset links from another origin, another path, or without a token', () => {
  assert.deepEqual(extractPasswordResetToken('https://evil.example/reset-password?token=abc', resetUrl), { valid: false });
  assert.deepEqual(extractPasswordResetToken('https://app.example.test/other?token=abc', resetUrl), { valid: false });
  assert.deepEqual(extractPasswordResetToken('https://app.example.test/reset-password', resetUrl), { valid: false });
});

test('requires an explicitly configured HTTPS reset URL', () => {
  assert.deepEqual(extractPasswordResetToken('https://app.example.test/reset-password?token=abc', undefined), { valid: false });
  assert.deepEqual(extractPasswordResetToken('https://app.example.test/reset-password?token=abc', 'http://app.example.test/reset-password'), { valid: false });
  assert.deepEqual(extractPasswordResetToken('https://app.example.test/reset-password?token=abc', 'https://app.example.test/other'), { valid: false });
});
