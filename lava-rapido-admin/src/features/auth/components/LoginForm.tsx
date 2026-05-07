// Hooks de React y router
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Servicio que llama al endpoint POST /users/login
import { login } from "../services/authService";

// Store global de autenticación (Zustand)
import { useAuthStore } from "../../../store/authStore";

export const LoginForm = () => {
  // Valores de los inputs controlados
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");

  // Controla el spinner y deshabilita el botón durante la petición
  const [isLoading, setIsLoading] = useState(false);

  // Mensaje de error visible en pantalla
  const [error, setError]         = useState("");

  const navigate = useNavigate();

  // Solo traemos setAuth del store, no todo el estado
  const setAuth = useAuthStore((state) => state.setAuth);

  // Valida formato de email antes de llamar al backend
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Evita que el form recargue la página
    e.preventDefault();
    setError("");

    // Validaciones del lado cliente — evitan peticiones innecesarias
    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }
    if (!password.trim()) {
      setError("Por favor ingresa tu contraseña");
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(email, password);

      // Persiste token y usuario en Zustand + localStorage
      setAuth(data.token, data.user);

      // Redirige según el rol devuelto por el backend
      if (data.user.role === "ADMIN") {
        navigate("/dashboard");
      } else {
        // TODO: cambiar "/" por la ruta real del usuario USER
        navigate("/");
      }

    } catch (error: any) {
      // Mensajes legibles según código HTTP
      if (error.response?.status === 401) {
        setError("Credenciales incorrectas");
      } else if (error.response?.status >= 500) {
        setError("Error del servidor. Inténtalo de nuevo más tarde");
      } else {
        setError("Error de conexión. Verifica tu internet");
      }

    } finally {
      // Siempre apaga el spinner, haya error o no
      setIsLoading(false);
    }
  };

  return (
    <div className="lf-wrapper">
      <h2 className="lf-title">Bienvenido</h2>
      <p className="lf-subtitle">Ingresa tus credenciales para continuar</p>

      {/* Solo se renderiza si hay un mensaje de error */}
      {error && (
        <div className="lf-error" role="alert" aria-live="polite">
          <span className="lf-error-icon">⚠</span>
          {error}
        </div>
      )}

      {/* noValidate desactiva la validación nativa del navegador */}
      <form onSubmit={handleSubmit} noValidate>

        <div className="lf-field">
          <label className="lf-label" htmlFor="lf-email">Correo electrónico</label>
          <input
            id="lf-email"
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="lf-input"
            autoComplete="email"
            aria-required="true"
          />
        </div>

        <div className="lf-field">
          <label className="lf-label" htmlFor="lf-password">Contraseña</label>
          <input
            id="lf-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="lf-input"
            autoComplete="current-password"
            aria-required="true"
          />
        </div>

        {/* Deshabilitado durante la petición para evitar doble envío */}
        <button
          className="lf-btn"
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {/* Spinner visible solo durante carga */}
          {isLoading && (
            <svg className="lf-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
            </svg>
          )}
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>

      </form>
    </div>
  );
};