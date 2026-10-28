// Guarda de forma segura la ruta interna a la que se vuelve después del login.
const RETURN_PATH_KEY = "auth-return-path";

// Solo conserva destinos internos para impedir redirecciones a sitios externos.
export const esRutaInternaSegura = (ruta: string) => ruta.startsWith("/") && !ruta.startsWith("//") && !ruta.includes("\\");

export const guardarDestinoTrasLogin = (ruta: string) => {
  if (esRutaInternaSegura(ruta) && ruta !== "/login") sessionStorage.setItem(RETURN_PATH_KEY, ruta);
};

export const consumirDestinoTrasLogin = () => {
  const ruta = sessionStorage.getItem(RETURN_PATH_KEY);
  sessionStorage.removeItem(RETURN_PATH_KEY);
  return ruta && esRutaInternaSegura(ruta) ? ruta : null;
};
