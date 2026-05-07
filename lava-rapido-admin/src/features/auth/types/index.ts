// Datos enviados al backend para login
export interface LoginRequest {
  // Correo del usuario
  email: string;
  // Contraseña del usuario
  password: string;
}
// Respuesta del backend después del login
export interface LoginResponse {
  // Token JWT de autenticación
  token: string;
  // Información del usuario autenticado
  user: {
    // Identificador único
    userId: string;
    // Nombre del usuario
    firstName: string;
    // Correo del usuario
    email: string;
    // Rol permitido en el sistema
    role: "ADMIN" | "USER" | "OPERATOR";
  };
}