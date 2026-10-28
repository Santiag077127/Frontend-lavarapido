import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidHumanText, sanitizeHumanText } from './inputSanitizers.ts';

test('preserves accented names and ñ while removing numbers and emoji', () => {
  const name = `Mar\u00EDa Jos\u00E9 \u{1F60A}2`;
  assert.equal(sanitizeHumanText(name), 'Mar\u00EDa Jos\u00E9 ');
  assert.equal(isValidHumanText('Mu\u00F1oz \u00C1lvarez'), true);
  assert.equal(isValidHumanText('Ana2'), false);
});

test('accepts legitimate apostrophes and hyphens', () => {
  assert.equal(isValidHumanText("O'Connor-G\u00F3mez"), true);
});
