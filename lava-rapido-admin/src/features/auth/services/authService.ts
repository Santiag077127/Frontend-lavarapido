// Instancia personalizada de Axios
import { api } from "../../../services/api";

// Tipo de respuesta del backend
import { LoginResponse } from "../types";

// Función para autenticar usuario
export const login = async (

  // Credenciales
  email: string,
  password: string

// Retorna una promesa con LoginResponse
): Promise<LoginResponse> => {

  // Petición POST al backend
  const response = await api.post<LoginResponse>(

    // Endpoint login
    "/users/login",

    // Body enviado al servidor
    {
      email,
      password,
    }
  );

  // Retorna únicamente los datos
  return response.data;
};