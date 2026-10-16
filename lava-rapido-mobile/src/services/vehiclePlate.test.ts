import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  normalizeVehiclePlateInput,
  validateVehiclePlate,
  vehiclePlateBackendValidationMessage,
} from './vehiclePlate.ts';

describe('vehicle plate validation', () => {
  test('accepts every backend vehicle type with its corresponding format', () => {
    assert.equal(validateVehiclePlate('abc12d', 'MOTO').isValid, true);
    for (const type of ['MOTOCARRO', 'CARRO', 'CAMIONETA', 'FURGONETA', 'PESADO'] as const) {
      assert.equal(validateVehiclePlate('abc123', type).isValid, true);
    }
  });

  test('normalizes only outer whitespace and uppercase characters', () => {
    assert.equal(normalizeVehiclePlateInput(' abc12d '), 'ABC12D');
    assert.equal(validateVehiclePlate('ABC 123', 'CARRO').isValid, false);
    assert.equal(validateVehiclePlate('ABC-123', 'CARRO').isValid, false);
  });

  test('rejects plates when the selected type changes', () => {
    assert.equal(validateVehiclePlate('ABC123', 'MOTO').isValid, false);
    assert.equal(validateVehiclePlate('ABC12D', 'CARRO').isValid, false);
  });

  test('recognizes only the explicit HU-31 validation error contract', () => {
    assert.equal(
      vehiclePlateBackendValidationMessage({ error: 'Para MOTO, la placa debe tener el formato ABC12D' }),
      'Para MOTO, la placa debe tener el formato ABC12D',
    );
    assert.equal(vehiclePlateBackendValidationMessage({ error: 'internal detail' }), null);
  });
});
