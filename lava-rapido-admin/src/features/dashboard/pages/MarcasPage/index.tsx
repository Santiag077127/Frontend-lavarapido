import { useContext, useEffect, useMemo, useState, type FormEvent } from "react";
import { getMarcas, createMarca } from "@/features/dashboard/services/marcaService";
import { ThemeContext } from "@/theme/theme";
import type { Marca } from "@/features/dashboard/types";
import "./MarcasPage.css";

type FiltroEstado = "todos" | "activos" | "inactivos";

const FILTROS: { label: string; value: FiltroEstado }[] = [
  { label: "common.all", value: "todos" },
  { label: "common.activePlural", value: "activos" },
  { label: "common.inactivePlural", value: "inactivos" },
];

const limpiarNombre = (valor: string) => valor.trim().replace(/\s+/g, " ");
const compararNombre = (valor: string) => limpiarNombre(valor)
  .normalize("NFD")
  .replace(/\p{M}/gu, "")
  .toLocaleLowerCase("es");
const NOMBRE_VALIDO = /^[\p{L}\p{N} .&'-]+$/u;

export const MarcasPage = () => {
  const theme = useContext(ThemeContext);
  const t = theme?.t ?? ((key: string) => key);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroEstado>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [nombreNueva, setNombreNueva] = useState("");
  const [nombreTocado, setNombreTocado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargarMarcas = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await getMarcas();
      setMarcas(data);
    } catch {
      setError("No se pudieron cargar las marcas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMarcas();
  }, []);

  const marcasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return marcas.filter((marca) => {
      const coincideEstado =
        filtro === "todos" ||
        (filtro === "activos" && marca.estado) ||
        (filtro === "inactivos" && !marca.estado);

      const coincideBusqueda =
        texto === "" || marca.nombre.toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }, [marcas, filtro, busqueda]);

  const stats = useMemo(() => ({
    activos: marcas.filter((m) => m.estado).length,
    inactivos: marcas.filter((m) => !m.estado).length,
    total: marcas.length,
  }), [marcas]);

  const nombreLimpio = limpiarNombre(nombreNueva);
  const nombreDuplicado = marcas.some((marca) => compararNombre(marca.nombre) === compararNombre(nombreLimpio));
  const nombreError = !nombreLimpio
    ? "Escribe un nombre de marca."
    : !NOMBRE_VALIDO.test(nombreLimpio)
      ? "Usa letras, números, espacios, punto, guion, apóstrofo o &."
    : nombreLimpio.length > 30
      ? "El nombre no puede superar los 30 caracteres."
      : nombreDuplicado
        ? "Ya existe una marca con ese nombre."
        : null;
  const nombresSimilares = nombreLimpio.length >= 2
    ? marcas.filter((marca) => compararNombre(marca.nombre).includes(compararNombre(nombreLimpio))).slice(0, 5)
    : [];

  const handleCrear = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nombre = limpiarNombre(nombreNueva);
    if (!nombre || nombreError) {
      setError(nombreError || "Escribe un nombre de marca.");
      return;
    }
    try {
      setGuardando(true);
      setError(null);
      setMensaje(null);
      await createMarca({ nombre });
      setNombreNueva("");
      setNombreTocado(false);
      setFormAbierto(false);
      setMensaje("Marca creada correctamente.");
      await cargarMarcas();
    } catch (error) {
      const response = (error as { response?: { data?: unknown } }).response?.data;
      setError(typeof response === "string" && response ? response : "No se pudo crear la marca.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page-marcas">
      <div className="page-header">
        <div>
          <h1>{t("brands.title")}</h1>
          <p>{t("brands.subtitle")}</p>
        </div>
        <button className="marca-btn-nueva" type="button" onClick={() => { setError(null); setMensaje(null); setNombreTocado(false); setFormAbierto(true); }}>
          + Nueva marca
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat--azul">
          <p className="stat-card__valor">{stats.total}</p>
          <p className="stat-card__label">{t("common.total")}</p>
        </div>
        <div className="stat-card stat--verde">
          <p className="stat-card__valor">{stats.activos}</p>
          <p className="stat-card__label">{t("common.activePlural")}</p>
        </div>
        <div className="stat-card stat--amarillo">
          <p className="stat-card__valor">{stats.inactivos}</p>
          <p className="stat-card__label">{t("common.inactivePlural")}</p>
        </div>
      </div>

      <div className="page-filtros">
        <div className="filtros-group">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              className={`filtro-btn ${filtro === f.value ? "filtro-activo" : ""}`}
              onClick={() => setFiltro(f.value)}
            >
              {t(f.label)}
            </button>
          ))}
        </div>
        <input
          className="page-buscador"
          type="text"
          placeholder={t("common.searchByName")}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="page-error">{error}</p>}
      {mensaje && <p className="page-exito" role="status">{mensaje}</p>}

      {formAbierto && (
        <div className="marca-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !guardando) setFormAbierto(false); }}>
          <form className="marca-modal" role="dialog" aria-modal="true" aria-labelledby="marca-modal-titulo" onSubmit={handleCrear}>
            <h2 id="marca-modal-titulo">Nueva marca</h2>
            <p>La nueva marca quedará activa en el catálogo.</p>
            <label htmlFor="marca-nombre">Nombre de la marca</label>
            <input id="marca-nombre" autoFocus maxLength={30} required value={nombreNueva} onChange={(event) => { setNombreNueva(event.target.value); setNombreTocado(true); setError(null); }} onBlur={() => setNombreTocado(true)} className={nombreTocado && nombreNueva ? nombreError ? "marca-input--error" : "marca-input--valid" : ""} placeholder="Ej. Toyota" aria-invalid={nombreTocado && Boolean(nombreError)} aria-describedby={nombreTocado && nombreError ? "marca-nombre-ayuda marca-nombre-error" : "marca-nombre-ayuda"} />
            <p id="marca-nombre-ayuda" className="marca-modal-ayuda">Se permiten nombres como Mercedes-Benz, BMW o Land Rover.</p>
            {nombresSimilares.length > 0 && <p className="marca-modal-similares">Coincidencias existentes: {nombresSimilares.map((marca) => marca.nombre).join(", ")}</p>}
            {nombreTocado && nombreError && <p className="page-error" id="marca-nombre-error" role="alert">{nombreError}</p>}
            {error && <p className="page-error" role="alert">{error}</p>}
            <div className="marca-modal-acciones">
              <button type="button" onClick={() => setFormAbierto(false)} disabled={guardando}>Cancelar</button>
              <button type="submit" disabled={guardando || !nombreLimpio || Boolean(nombreError)}>{guardando ? "Guardando..." : "Crear marca"}</button>
            </div>
          </form>
        </div>
      )}

      {cargando ? (
        <p>{t("brands.loading")}</p>
      ) : marcasFiltradas.length === 0 ? (
        <p className="page-vacio">{t("brands.empty")}</p>
      ) : (
        <div className="tabla-wrapper">
          <table className="tabla">
            <thead>
              <tr>
                <th>{t("common.name")}</th>
                <th>{t("common.status")}</th>
              </tr>
            </thead>
            <tbody>
              {marcasFiltradas.map((marca) => (
                <tr key={marca.idMarca}>
                  <td>{marca.nombre}</td>
                  <td>
                    <span className={`badge ${marca.estado ? "badge--activo" : "badge--inactivo"}`}>
                      {marca.estado ? t("common.active") : t("common.inactive")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
