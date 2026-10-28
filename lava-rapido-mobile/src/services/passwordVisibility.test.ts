import assert from 'node:assert/strict';
import test from 'node:test';
import { passwordVisibilityIcon } from './passwordVisibility.ts';

test('uses a crossed eye while hidden and an open eye while visible', () => {
  assert.equal(passwordVisibilityIcon(false), 'eye-off-outline');
  assert.equal(passwordVisibilityIcon(true), 'eye-outline');
});

test('each field can derive its icon independently from its own state', () => {
  const fields = { current: false, next: true, confirmation: false };
  assert.deepEqual(Object.values(fields).map(passwordVisibilityIcon), [
    'eye-off-outline',
    'eye-outline',
    'eye-off-outline',
  ]);
});
