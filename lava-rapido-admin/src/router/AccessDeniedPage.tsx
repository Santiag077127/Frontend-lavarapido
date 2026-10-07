import { Link } from "react-router-dom";

export function AccessDeniedPage() {
  return <main role="alert" style={{ padding: "2rem" }}>
    <h1>Acceso denegado</h1>
    <p>Tu cuenta no tiene permisos de administración vigentes.</p>
    <Link to="/">Volver al inicio</Link>
  </main>;
}
