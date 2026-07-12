// Datos enviados al backend para login
export interface LoginRequest {
  email:    string;
  password: string;
}

// Respuesta del backend después del login
export interface LoginResponse {
  token: string;
  user: {
    userId:    string;
    firstName: string;
    email:     string;
    role:      "ADMIN" | "USER" | "OPERATOR";
  };
}

// ── corregido: el backend (UserRegistrationDTO) espera camelCase,
// no snake_case. Con snake_case estos campos llegaban como null. ──
export interface RegisterPayload {
  firstName:      string;
  lastName:       string;
  email:          string;
  phoneNumber:    string;
  documentType:   "CC" | "TI" | "CE";
  documentNumber: string;
  password:       string;
}

// ── nuevo: recuperar contraseña ──
export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  token:           string;
  nuevaContrasena: string;
}

export interface ResetPasswordResponse {
  message: string;
}