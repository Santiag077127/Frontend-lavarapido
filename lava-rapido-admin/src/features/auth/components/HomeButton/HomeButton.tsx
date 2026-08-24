import { Link } from "react-router-dom";
import "./HomeButton.css";

export const HomeButton = () => (
  <Link to="/" className="auth-home-button">
    ← Volver al inicio
  </Link>
);
