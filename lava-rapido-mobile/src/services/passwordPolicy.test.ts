import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getPasswordUtf8ByteLength,
  isValidPassword,
  passwordsMatch,
} from './passwordPolicy.ts';

test('password policy enforces the minimum length', () => {
  assert.equal(isValidPassword('1234567'), false);
  assert.equal(isValidPassword('12345678'), true);
});

test('password policy accepts exactly 72 UTF-8 bytes and rejects 73', () => {
  assert.equal(getPasswordUtf8ByteLength('a'.repeat(72)), 72);
  assert.equal(isValidPassword('a'.repeat(72)), true);
  assert.equal(getPasswordUtf8ByteLength('a'.repeat(73)), 73);
  assert.equal(isValidPassword('a'.repeat(73)), false);
});

test('UTF-8 byte count differs from UTF-16 string length for multibyte text', () => {
  const password = 'á'.repeat(36);
  assert.equal(password.length, 36);
  assert.equal(getPasswordUtf8ByteLength(password), 72);
  assert.equal(isValidPassword(password), true);
  assert.equal(getPasswordUtf8ByteLength('😀'.repeat(18)), 72);
});

test('password policy does not require letter case or digits', () => {
  assert.equal(isValidPassword('abcdefgh'), true);
  assert.equal(isValidPassword('ABCDEFGH'), true);
  assert.equal(isValidPassword('!!!!!!!!'), true);
});

test('password confirmation must match and be nonempty', () => {
  assert.equal(passwordsMatch('password', 'different'), false);
  assert.equal(passwordsMatch('password', ''), false);
  assert.equal(passwordsMatch('password', 'password'), true);
});

test('spaces remain part of the password and are not trimmed', () => {
  const password = '  pass  ';
  assert.equal(isValidPassword(password), true);
  assert.equal(getPasswordUtf8ByteLength(password), 8);
});
