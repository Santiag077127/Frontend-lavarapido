import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { classifyReservationCreationError } from './reservationErrors.ts';

function httpError(status: number, data?: unknown) {
  return Object.assign(new Error('request failed'), {
    isAxiosError: true,
    response: { status, data },
  });
}

describe('reservation creation error classification', () => {
  test('recognizes the backend 400 schedule-conflict contract', () => {
    assert.equal(
      classifyReservationCreationError(
        httpError(400, { error: 'Horario o estado de reserva invalido' }),
      ),
      'overlap',
    );
  });

  test('recognizes legacy overlap text while prioritizing HTTP status', () => {
    assert.equal(
      classifyReservationCreationError(
        httpError(400, { message: 'Existe una reserva solapada' }),
      ),
      'overlap',
    );
    assert.equal(classifyReservationCreationError(httpError(409)), 'conflict');
    assert.equal(
      classifyReservationCreationError(httpError(400, { error: 'Solicitud invalida' })),
      'invalid',
    );
  });

  test('classifies authorization, server, timeout, and connection failures', () => {
    assert.equal(classifyReservationCreationError(httpError(401)), 'unauthorized');
    assert.equal(classifyReservationCreationError(httpError(403)), 'forbidden');
    assert.equal(classifyReservationCreationError(httpError(500)), 'server');

    const timeout = Object.assign(new Error('timeout'), {
      isAxiosError: true,
      code: 'ECONNABORTED',
    });
    const offline = Object.assign(new Error('network'), {
      isAxiosError: true,
      code: 'ERR_NETWORK',
    });
    assert.equal(axios.isAxiosError(timeout), true);
    assert.equal(classifyReservationCreationError(timeout), 'timeout');
    assert.equal(classifyReservationCreationError(offline), 'network');
  });

  test('classifies non-Axios and unexpected errors without exposing their messages', () => {
    assert.equal(
      classifyReservationCreationError(new Error('unexpected')),
      'unknown',
    );
  });
});
