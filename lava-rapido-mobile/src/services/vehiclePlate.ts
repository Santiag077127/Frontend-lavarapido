import type { VehicleType } from './vehicleService';

const AUTOMOTIVE_PLATE = /^[A-Z]{3}\d{3}$/;
const MOTORCYCLE_PLATE = /^[A-Z]{3}\d{2}[A-Z]$/;

export type VehiclePlateValidation = {
  normalized: string;
  isValid: boolean;
  expectedFormat: 'ABC123' | 'ABC12D';
};

export function normalizeVehiclePlateInput(value: string): string {
  return value.trim().toUpperCase().slice(0, 6);
}

export function validateVehiclePlate(
  plate: string,
  vehicleType: VehicleType,
): VehiclePlateValidation {
  const normalized = normalizeVehiclePlateInput(plate);
  const expectedFormat = vehicleType === 'MOTO' ? 'ABC12D' : 'ABC123';
  const pattern = vehicleType === 'MOTO' ? MOTORCYCLE_PLATE : AUTOMOTIVE_PLATE;

  return { normalized, expectedFormat, isValid: pattern.test(normalized) };
}

/** Only exposes the explicit, user-safe validation contract returned by HU-31. */
export function vehiclePlateBackendValidationMessage(data: unknown): string | null {
  const message = typeof data === 'string'
    ? data
    : data && typeof data === 'object' && typeof (data as Record<string, unknown>).error === 'string'
      ? (data as Record<string, string>).error
      : null;

  if (!message) return null;

  const match = /^Para (MOTO|MOTOCARRO|CARRO|CAMIONETA|FURGONETA|PESADO), la placa debe tener el formato (ABC12D|ABC123)$/.exec(message);
  if (!match) return null;

  return (match[1] === 'MOTO' && match[2] === 'ABC12D')
    || (match[1] !== 'MOTO' && match[2] === 'ABC123')
    ? message
    : null;
}
