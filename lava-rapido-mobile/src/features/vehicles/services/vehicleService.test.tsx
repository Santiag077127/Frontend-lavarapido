import { vehicleService as sharedVehicleService } from '../../../services/vehicleService';
import { vehicleService } from './vehicleService';

jest.mock('../../../services/vehicleService', () => ({
  vehicleService: {
    getMine: jest.fn(),
    create: jest.fn(),
  },
}));

describe('vehicleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the shared list response data for reservation selection', async () => {
    const vehicles = [{ idVehiculo: 'vehicle-1' }];
    (sharedVehicleService.getMine as jest.Mock).mockResolvedValue({ data: vehicles });

    await expect(vehicleService.getMyVehicles()).resolves.toBe(vehicles);
    expect(sharedVehicleService.getMine).toHaveBeenCalledTimes(1);
  });

  it('returns the shared creation response data', async () => {
    const request = {
      placa: 'ABC123',
      tipoVehiculo: 'CARRO' as const,
      fkIdMarca: 'brand-1',
    };
    const createdVehicle = { idVehiculo: 'vehicle-1' };
    (sharedVehicleService.create as jest.Mock).mockResolvedValue({ data: createdVehicle });

    await expect(vehicleService.create(request)).resolves.toBe(createdVehicle);
    expect(sharedVehicleService.create).toHaveBeenCalledWith(request);
  });
});
