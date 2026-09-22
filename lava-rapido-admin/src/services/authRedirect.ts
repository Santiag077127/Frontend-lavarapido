const RETURN_PATH_KEY = "auth-return-path";

export const esRutaInternaSegura = (ruta: string) => ruta.startsWith("/") && !ruta.startsWith("//") && !ruta.includes("\\");

export const guardarDestinoTrasLogin = (ruta: string) => {
  if (esRutaInternaSegura(ruta) && ruta !== "/login") sessionStorage.setItem(RETURN_PATH_KEY, ruta);
};

export const consumirDestinoTrasLogin = () => {
  const ruta = sessionStorage.getItem(RETURN_PATH_KEY);
  sessionStorage.removeItem(RETURN_PATH_KEY);
  return ruta && esRutaInternaSegura(ruta) ? ruta : null;
};
