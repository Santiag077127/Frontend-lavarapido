import { useContext, useEffect, useMemo, useState } from "react";
import { getMarcas, cambiarEstadoMarca } from "@/features/dashboard/services/marcaService";
import { ThemeContext } from "@/theme/theme";
import type { Marca } from "@/features/dashboard/types";
import "./MarcasPage.css";

type FiltroEstado = "todos" | "activos" | "inactivos";

const FILTROS: { label: string; value: FiltroEstado }[] = [
  { label: "common.all", value: "todos" },
  { label: "common.activePlural", value: "activos" },
  { label: "common.inactivePlural", value: "inactivos" },
];

export const MarcasPage = () => {
  const theme = useContext(ThemeContext);
  const t = theme?.t ?? ((key: string) => key);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroEstado>("todos");
  const [busqueda, setBusqueda] = useState("");

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

  const handleCambiarEstado = async (marca: Marca) => {
    try {
      await cambiarEstadoMarca(marca.idMarca, !marca.estado);
      await cargarMarcas();
    } catch {
      setError("No se pudo actualizar el estado de la marca.");
    }
  };

  return (
    <div className="page-marcas">
      <div className="page-header">
        <div>
          <h1>{t("brands.title")}</h1>
          <p>{t("brands.subtitle")}</p>
        </div>
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
                <th>{t("common.actions")}</th>
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
                  <td>
                    <button className="btn-toggle" onClick={() => handleCambiarEstado(marca)}>
                      {marca.estado ? t("common.deactivate") : t("common.activate")}
                    </button>
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
