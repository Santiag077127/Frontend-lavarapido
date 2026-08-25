import { useEffect, useMemo, useState } from "react";
import { getMarcas, cambiarEstadoMarca } from "@/features/dashboard/services/marcaService";
import type { Marca } from "@/features/dashboard/types";
import "./MarcasPage.css";

type FiltroEstado = "todos" | "activos" | "inactivos";

const FILTROS: { label: string; value: FiltroEstado }[] = [
  { label: "Todos", value: "todos" },
  { label: "Activos", value: "activos" },
  { label: "Inactivos", value: "inactivos" },
];

export const MarcasPage = () => {
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
          <h1>Marcas</h1>
          <p>Administración de marcas asociadas a los vehículos.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat--azul">
          <p className="stat-card__valor">{stats.total}</p>
          <p className="stat-card__label">Total</p>
        </div>
        <div className="stat-card stat--verde">
          <p className="stat-card__valor">{stats.activos}</p>
          <p className="stat-card__label">Activas</p>
        </div>
        <div className="stat-card stat--amarillo">
          <p className="stat-card__valor">{stats.inactivos}</p>
          <p className="stat-card__label">Inactivas</p>
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
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="page-buscador"
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="page-error">{error}</p>}

      {cargando ? (
        <p>Cargando marcas...</p>
      ) : marcasFiltradas.length === 0 ? (
        <p className="page-vacio">No hay marcas para mostrar.</p>
      ) : (
        <div className="tabla-wrapper">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {marcasFiltradas.map((marca) => (
                <tr key={marca.idMarca}>
                  <td>{marca.nombre}</td>
                  <td>
                    <span className={`badge ${marca.estado ? "badge--activo" : "badge--inactivo"}`}>
                      {marca.estado ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td>
                    <button className="btn-toggle" onClick={() => handleCambiarEstado(marca)}>
                      {marca.estado ? "Desactivar" : "Activar"}
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
