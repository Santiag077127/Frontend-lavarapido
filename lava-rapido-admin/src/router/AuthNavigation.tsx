import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function AuthNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    const unauthorized = () => navigate("/login", { replace: true });
    const forbidden = () => navigate("/access-denied", { replace: true });
    window.addEventListener("api:unauthorized", unauthorized);
    window.addEventListener("api:forbidden", forbidden);
    return () => {
      window.removeEventListener("api:unauthorized", unauthorized);
      window.removeEventListener("api:forbidden", forbidden);
    };
  }, [navigate]);

  return null;
}
