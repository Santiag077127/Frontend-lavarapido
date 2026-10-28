import api from '../../../services/api';
import { vehicleService } from '../../../services/vehicleService';

jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('shared vehicleService API contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists the authenticated user vehicles from the existing endpoint', async () => {
    const response = { data: [] };
    (api.get as jest.Mock).mockResolvedValue(response);

    await expect(vehicleService.getMine()).resolves.toBe(response);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/api/vehiculos/mis-vehiculos');
  });

  it('creates a vehicle using the existing request and response contract', async () => {
    const request = { placa: 'ABC123', tipoVehiculo: 'CARRO' as const, fkIdMarca: 'brand-1' };
    const response = { data: { idVehiculo: 'vehicle-1' } };
    (api.post as jest.Mock).mockResolvedValue(response);

    await expect(vehicleService.create(request)).resolves.toBe(response);
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/api/vehiculos', request);
  });

  it('updates a vehicle using the existing path and payload', async () => {
    const request = { placa: 'ABC123', color: 'Negro', tipoVehiculo: 'CARRO' as const, fkIdMarca: 'brand-1' };
    (api.put as jest.Mock).mockResolvedValue({ data: {} });

    await vehicleService.update('vehicle-1', request);

    expect(api.put).toHaveBeenCalledTimes(1);
    expect(api.put).toHaveBeenCalledWith('/api/vehiculos/vehicle-1', request);
  });

  it('changes vehicle status through the existing patch operation', async () => {
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });

    await vehicleService.changeStatus('vehicle-1', false);

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/api/vehiculos/vehicle-1/estado', null, {
      params: { activo: false },
    });
  });

  it('loads active brands from the existing endpoint', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: [] });

    await vehicleService.getActiveBrands();

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/api/marcas/activas');
  });

  it('propagates provider errors without retrying the request', async () => {
    const failure = { response: { status: 503 } };
    (api.get as jest.Mock).mockRejectedValue(failure);

    await expect(vehicleService.getMine()).rejects.toBe(failure);
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});
