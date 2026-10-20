import assert from 'node:assert/strict';
import test from 'node:test';

import { isValidEmail, normalizeEmail } from './validators.ts';

test('acepta correos válidos con subdominios y caracteres permitidos', () => {
  assert.equal(isValidEmail('usuario@gmail.com'), true);
  assert.equal(isValidEmail('nombre.apellido@empresa.com.co'), true);
  assert.equal(isValidEmail('usuario+test@gmail.com'), true);
  assert.equal(isValidEmail('  usuario_test-1@empresa.co  '), true);
});

test('rechaza formatos inválidos, espacios internos y emojis', () => {
  for (const email of [
    'usuario@gmail',
    'usuario@',
    'usuariogmail.com',
    'usuario@@gmail.com',
    'usuario gmail@gmail.com',
    'usuario😀@gmail.com',
  ]) {
    assert.equal(isValidEmail(email), false, email);
  }
});

test('normaliza únicamente los espacios externos antes de validar', () => {
  assert.equal(normalizeEmail('  usuario@gmail.com  '), 'usuario@gmail.com');
  assert.equal(isValidEmail('  usuario@gmail.com  '), true);
});
