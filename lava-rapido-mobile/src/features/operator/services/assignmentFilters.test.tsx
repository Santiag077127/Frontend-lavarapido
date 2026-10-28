import type { Assignment } from '../../../services/assignmentService'
import { getFilteredAssignments } from './assignmentFilters'

const assignment = (id: string, estado: Assignment['estado'], updatedAt = '2026-01-01T10:00:00'): Assignment => ({
  idAsignacion: id,
  idReserva: `reservation-${id}`,
  idOperador: 'operator-1',
  nombreOperador: 'Operator',
  estado,
  fechaAsignacion: updatedAt,
  nombreCliente: 'Customer',
  placa: 'ABC123',
  color: 'Blue',
  tipoVehiculo: 'CARRO',
  idServicio: 'service-1',
  nombreServicio: 'Wash',
  descripcionServicio: '',
  precioServicio: 10000,
  duracionMinutos: 30,
  fechaReserva: '2026-11-01',
  horaReserva: '10:00:00',
  createdAt: updatedAt,
  updatedAt,
})

test.each([
  ['assigned', 'asignada'],
  ['inProgress', 'en_proceso'],
  ['completed', 'completada'],
] as const)('filters to the %s state', (filter, status) => {
  const items = [assignment('a', 'asignada'), assignment('b', 'en_proceso'), assignment('c', 'completada')]
  expect(getFilteredAssignments(items, filter).map((item) => item.estado)).toEqual([status])
})

test('does not include cancelled assignments in active status filters', () => {
  expect(getFilteredAssignments([assignment('cancelled', 'cancelada')], 'assigned')).toEqual([])
  expect(getFilteredAssignments([assignment('cancelled', 'cancelada')], 'inProgress')).toEqual([])
})

test('keeps only the latest assignment for a reservation', () => {
  const older = { ...assignment('old', 'cancelada'), idReserva: 'same-reservation' }
  const newer = { ...assignment('new', 'asignada', '2026-01-02T10:00:00'), idReserva: 'same-reservation' }
  expect(getFilteredAssignments([older, newer], 'assigned')).toEqual([newer])
})
