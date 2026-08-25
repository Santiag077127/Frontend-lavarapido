import { useEffect, useMemo, useState } from "react";
import { getVehiculos, cambiarEstadoVehiculo } from "@/features/dashboard/services/vehiculoService";
import type { Vehiculo } from "@/features/dashboard/types";
import "./VehiculosPage.css";

type FiltroEstado = "todos" | "activos" | "inactivos";

const FILTROS: { label: string; value: FiltroEstado }[] = [
  { label: "Todos", value: "todos" },
  { label: "Activos", value: "activos" },
  { label: "Inactivos", value: "inactivos" },
];

export const VehiculosPage = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroEstado>("todos");
  const [busqueda, setBusqueda] = useState("");

  const cargarVehiculos = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await getVehiculos();
      setVehiculos(data);
    } catch {
      setError("No se pudieron cargar los vehículos. Verifica que tu sesión tenga rol ADMIN.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const vehiculosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return vehiculos.filter((vehiculo) => {
      const coincideEstado =
        filtro === "todos" ||
        (filtro === "activos" && vehiculo.estado) ||
        (filtro === "inactivos" && !vehiculo.estado);

      const coincideBusqueda =
        texto === "" ||
        vehiculo.placa.toLowerCase().includes(texto) ||
        vehiculo.nombreMarca.toLowerCase().includes(texto) ||
        vehiculo.nombreUsuario.toLowerCase().includes(texto) ||
        vehiculo.emailUsuario.toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }, [vehiculos, filtro, busqueda]);

  const stats = useMemo(() => ({
    activos: vehiculos.filter((v) => v.estado).length,
    inactivos: vehiculos.filter((v) => !v.estado).length,
    total: vehiculos.length,
  }), [vehiculos]);

  const handleCambiarEstado = async (vehiculo: Vehiculo) => {
    try {
      await cambiarEstadoVehiculo(vehiculo.idVehiculo, !vehiculo.estado);
      await cargarVehiculos();
    } catch {
      setError("No se pudo actualizar el estado del vehículo.");
    }
  };

  return (
    <div className="page-vehiculos">
      <div className="page-header">
        <div>
          <h1>Vehículos</h1>
          <p>Gestión de vehículos, propietarios y estado operativo.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat--azul">
          <p className="stat-card__valor">{stats.total}</p>
          <p className="stat-card__label">Total</p>
        </div>
        <div className="stat-card stat--verde">
          <p className="stat-card__valor">{stats.activos}</p>
          <p className="stat-card__label">Activos</p>
        </div>
        <div className="stat-card stat--amarillo">
          <p className="stat-card__valor">{stats.inactivos}</p>
          <p className="stat-card__label">Inactivos</p>
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
          placeholder="Buscar por placa, marca, propietario o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="page-error">{error}</p>}

      {cargando ? (
        <p>Cargando vehículos...</p>
      ) : vehiculosFiltrados.length === 0 ? (
        <p className="page-vacio">No hay vehículos para mostrar.</p>
      ) : (
        <div className="tabla-wrapper">
          <table className="tabla">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Propietario</th>
                <th>Email</th>
                <th>Color</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculosFiltrados.map((vehiculo) => (
                <tr key={vehiculo.idVehiculo}>
                  <td>{vehiculo.placa}</td>
                  <td>{vehiculo.tipoVehiculo}</td>
                  <td>
                    {vehiculo.nombreMarca}
                    {!vehiculo.marcaAprobada && (
                      <span className="badge badge--pendiente" style={{ marginLeft: 6 }}>
                        No aprobada
                      </span>
                    )}
                  </td>
                  <td>{vehiculo.nombreUsuario}</td>
                  <td>{vehiculo.emailUsuario}</td>
                  <td>{vehiculo.color || "—"}</td>
                  <td>
                    <span className={`badge ${vehiculo.estado ? "badge--activo" : "badge--inactivo"}`}>
                      {vehiculo.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <button className="btn-toggle" onClick={() => handleCambiarEstado(vehiculo)}>
                      {vehiculo.estado ? "Desactivar" : "Activar"}
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