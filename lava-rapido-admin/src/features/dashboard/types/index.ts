// Estructura de un servicio de lavado
export interface Servicio {
  id:          string;
  nombre:      string;
  precio:      number;
  duracion:    string;
  descripcion: string;
}

// Formulario sin id — lo genera el mock
export type ServicioForm = Omit<Servicio, "id">;