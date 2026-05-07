import { Servicio, ServicioForm } from "../types";

// Datos de prueba en memoria — reemplazar por axios cuando el backend esté listo
let servicios: Servicio[] = [
  { id: "1", nombre: "Lavado Básico",   precio: 15000, duracion: "20 min", descripcion: "Exterior con agua y jabón" },
  { id: "2", nombre: "Lavado Completo", precio: 30000, duracion: "45 min", descripcion: "Exterior e interior" },
  { id: "3", nombre: "Lavado Premium",  precio: 55000, duracion: "90 min", descripcion: "Detallado completo con encerado" },
];

let nextId = 4;

// READ
export const getServicios = (): Servicio[] => [...servicios];

// CREATE
export const createServicio = (form: ServicioForm): Servicio => {
  const nuevo: Servicio = { id: String(nextId++), ...form };
  servicios.push(nuevo);
  return nuevo;
};

// UPDATE
export const updateServicio = (id: string, form: ServicioForm): Servicio => {
  servicios = servicios.map((s) => (s.id === id ? { id, ...form } : s));
  return { id, ...form };
};

// DELETE
export const deleteServicio = (id: string): void => {
  servicios = servicios.filter((s) => s.id !== id);
};