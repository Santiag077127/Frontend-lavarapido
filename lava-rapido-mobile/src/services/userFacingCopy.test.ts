import assert from 'node:assert/strict';
import test from 'node:test';
import { apiCopy } from '../i18n/apiCopy.ts';
import { passwordCopy } from '../i18n/passwordCopy.ts';
import { recoveryCopy } from '../i18n/recoveryCopy.ts';

test('the Spanish connection copy distinguishes transport and server failures', () => {
  assert.equal(
    apiCopy.es.apiErrors.network,
    'Error de conexión. Verifica tu conexión a internet e inténtalo nuevamente.',
  );
  assert.equal(
    apiCopy.es.apiErrors.server_unavailable,
    'Servidor no disponible. Inténtalo nuevamente más tarde.',
  );
  assert.equal(
    apiCopy.es.apiErrors.timeout,
    'La conexión tardó demasiado. Inténtalo nuevamente.',
  );
  assert.equal(
    apiCopy.es.apiErrors.server,
    'El servidor está presentando problemas. Inténtalo nuevamente más tarde.',
  );
});

test('password and recovery copy never expose byte or encoding terminology', () => {
  const visibleCopy = [
    ...Object.values(passwordCopy.es.register),
    ...Object.values(passwordCopy.es.changePassword),
    ...Object.values(passwordCopy.es.resetPassword),
    ...Object.values(recoveryCopy.es.forgotPassword),
    ...Object.values(recoveryCopy.es.resetPassword),
  ].join(' ');
  assert.doesNotMatch(visibleCopy, /72 bytes|UTF-8|unidades|token/i);
  assert.equal(passwordCopy.es.register.passwordRequirements, 'Mínimo 8 caracteres.');
  assert.equal(passwordCopy.es.register.passwordTooLong, 'La contraseña es demasiado larga. Prueba con una más corta.');
  assert.equal(recoveryCopy.es.resetPassword.token, 'Código de recuperación');
  assert.match(recoveryCopy.es.forgotPassword.subtitle, /instrucciones/);
});
