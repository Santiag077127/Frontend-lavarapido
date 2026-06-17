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

// ── nuevo ──
export interface RegisterPayload {
  first_name:      string;
  last_name:       string;
  email:           string;
  phone_number:    string;
  document_type:   "CC" | "TI" | "CE";
  document_number: string;
  password:        string;
}