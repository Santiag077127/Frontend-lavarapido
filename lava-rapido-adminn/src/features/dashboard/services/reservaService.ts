export type EstadoReserva =
  | "pendiente"
  | "asignada"
  | "en_proceso"
  | "finalizada"
  | "cancelada";

export interface OperadorOption {
  id: string;
  nombre: string;
}

export interface Reserva {
  id: string;
  cliente: {
    nombre: string;
    telefono: string;
  };
  vehiculo: {
    placa: string;
    tipo: string;
  };
  servicio: {
    nombre: string;
    precio: number;
    duracionMinutos: number;
  };
  hora: string;
  estado: EstadoReserva;
  operador: OperadorOption | null;
  pago: {
    estado: "aprobado" | "pendiente" | "rechazado";
    metodo?: "en_linea" | "efectivo";
  };
}

const operadoresMock: OperadorOption[] = [
  { id: "op-1", nombre: "Carlos Rojas" },
  { id: "op-2", nombre: "Maria Torres" },
  { id: "op-3", nombre: "Andres Lopez" },
];

let reservasMock: Reserva[] = [
  {
    id: "res-1",
    cliente: {
      nombre: "Laura Gomez",
      telefono: "3101234567",
    },
    vehiculo: {
      placa: "ABC123",
      tipo: "Automovil",
    },
    servicio: {
      nombre: "Lavado completo",
      precio: 35000,
      duracionMinutos: 45,
    },
    hora: "09:30 AM",
    estado: "pendiente",
    operador: null,
    pago: {
      estado: "pendiente",
      metodo: "efectivo",
    },
  },
  {
    id: "res-2",
    cliente: {
      nombre: "Miguel Perez",
      telefono: "3209876543",
    },
    vehiculo: {
      placa: "XYZ789",
      tipo: "Camioneta",
    },
    servicio: {
      nombre: "Lavado premium",
      precio: 55000,
      duracionMinutos: 70,
    },
    hora: "10:15 AM",
    estado: "asignada",
    operador: operadoresMock[0],
    pago: {
      estado: "aprobado",
      metodo: "en_linea",
    },
  },
  {
    id: "res-3",
    cliente: {
      nombre: "Sofia Ramirez",
      telefono: "3154567890",
    },
    vehiculo: {
      placa: "JKL456",
      tipo: "Moto",
    },
    servicio: {
      nombre: "Lavado basico",
      precio: 18000,
      duracionMinutos: 25,
    },
    hora: "11:00 AM",
    estado: "en_proceso",
    operador: operadoresMock[1],
    pago: {
      estado: "aprobado",
      metodo: "efectivo",
    },
  },
  {
    id: "res-4",
    cliente: {
      nombre: "Andres Castillo",
      telefono: "3001112233",
    },
    vehiculo: {
      placa: "QWE321",
      tipo: "Automovil",
    },
    servicio: {
      nombre: "Lavado completo",
      precio: 35000,
      duracionMinutos: 45,
    },
    hora: "08:40 AM",
    estado: "finalizada",
    operador: operadoresMock[2],
    pago: {
      estado: "aprobado",
      metodo: "en_linea",
    },
  },
];

const clonarReserva = (reserva: Reserva): Reserva => ({
  ...reserva,
  cliente: { ...reserva.cliente },
  vehiculo: { ...reserva.vehiculo },
  servicio: { ...reserva.servicio },
  operador: reserva.operador ? { ...reserva.operador } : null,
  pago: { ...reserva.pago },
});

export const getReservas = async (): Promise<Reserva[]> => {
  return reservasMock.map(clonarReserva);
};

export const getOperadoresDisponibles = async (): Promise<OperadorOption[]> => {
  return operadoresMock.map((operador) => ({ ...operador }));
};

export const asignarOperador = async (
  reservaId: string,
  operador: OperadorOption
): Promise<Reserva> => {
  const reserva = reservasMock.find((item) => item.id === reservaId);

  if (!reserva) {
    throw new Error("Reserva no encontrada");
  }

  const actualizada: Reserva = {
    ...reserva,
    estado: reserva.estado === "pendiente" ? "asignada" : reserva.estado,
    operador: { ...operador },
  };

  reservasMock = reservasMock.map((item) => (item.id === reservaId ? actualizada : item));

  return clonarReserva(actualizada);
};

export const cancelarTurno = async (reservaId: string): Promise<Reserva> => {
  const reserva = reservasMock.find((item) => item.id === reservaId);

  if (!reserva) {
    throw new Error("Reserva no encontrada");
  }

  const actualizada: Reserva = {
    ...reserva,
    estado: "cancelada",
  };

  reservasMock = reservasMock.map((item) => (item.id === reservaId ? actualizada : item));

  return clonarReserva(actualizada);
};
