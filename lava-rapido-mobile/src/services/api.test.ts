import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldAttachAuthorization } from './passwordResetRequest.ts';

test('does not attach Authorization to public password reset endpoints', () => {
  assert.equal(shouldAttachAuthorization('/api/auth/forgot-password'), false);
  assert.equal(shouldAttachAuthorization('/api/auth/reset-password?source=mobile'), false);
});

test('keeps Authorization for authenticated and unrelated requests', () => {
  assert.equal(shouldAttachAuthorization('/api/users/password'), true);
  assert.equal(shouldAttachAuthorization('/api/auth/reset-password/extra'), true);
  assert.equal(shouldAttachAuthorization(undefined), true);
});
