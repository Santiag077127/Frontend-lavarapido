import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { apiCopy } from '../i18n/apiCopy.ts';
import { paymentCopy } from '../i18n/paymentCopy.ts';
import { passwordCopy } from '../i18n/passwordCopy.ts';
import { recoveryCopy } from '../i18n/recoveryCopy.ts';

test('the Spanish connection copy distinguishes transport and server failures', () => {
  assert.equal(
    apiCopy.es.apiErrors.network,
    'No pudimos conectarnos. Revisa tu conexión e inténtalo nuevamente.',
  );
  assert.equal(
    apiCopy.es.apiErrors.server_unavailable,
    'El servicio no está disponible. Inténtalo más tarde.',
  );
  assert.equal(
    apiCopy.es.apiErrors.timeout,
    'La solicitud tardó demasiado. Revisa tu conexión e inténtalo nuevamente.',
  );
  assert.equal(
    apiCopy.es.apiErrors.server,
    'Ocurrió un problema inesperado. Inténtalo más tarde.',
  );
});

test('Spanish user copy contains readable UTF-8 words and no encoding artifacts', () => {
  const spanish = JSON.parse(readFileSync(new URL('../i18n/locales/es.json', import.meta.url), 'utf8')) as {
    mobile: { reservation: Record<string, unknown>; paymentFlow: Record<string, unknown> };
    vehicles: { title: string };
    map: { address: string };
  };
  const visibleCopy = JSON.stringify(spanish);
  assert.match(visibleCopy, /contraseña/i);
  assert.match(visibleCopy, /confirmación/i);
  assert.match(visibleCopy, /vehículo/i);
  assert.match(visibleCopy, /dirección/i);
  assert.match(visibleCopy, /sesión/i);
  assert.match(paymentCopy.es.paymentFlow.exitMessage, /¿Deseas continuar\?/);
  assert.doesNotMatch(visibleCopy, /Ãƒ|Ã‚|ï¿½|\p{L}\?\p{L}/u);
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
