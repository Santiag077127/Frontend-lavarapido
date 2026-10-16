// Lista vehículos y permite revisar o cambiar su estado.
import { useContext, useEffect, useMemo, useState } from "react";
import { getVehiculos } from "@/features/dashboard/services/vehiculoService";
import { ThemeContext, localizeMessage, useTranslations } from "@/theme/theme";
import type { Vehiculo } from "@/features/dashboard/types";
import "./VehiculosPage.css";

export const VehiculosPage = () => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const cargarVehiculos = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await getVehiculos();
      setVehiculos(data);
    } catch {
      setError("ui.no.se.pudieron.cargar.los.vehiculos.verifica.que.tu.sesion.tenga");
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
      const coincideBusqueda =
        texto === "" ||
        vehiculo.placa.toLowerCase().includes(texto) ||
        vehiculo.nombreMarca.toLowerCase().includes(texto) ||
        vehiculo.nombreUsuario.toLowerCase().includes(texto) ||
        vehiculo.emailUsuario.toLowerCase().includes(texto);

      return coincideBusqueda;
    });
  }, [vehiculos, busqueda]);

  const stats = useMemo(() => ({
    activos: vehiculos.filter((v) => v.estado).length,
    inactivos: vehiculos.filter((v) => !v.estado).length,
    total: vehiculos.length,
  }), [vehiculos]);

  return (
    <div className="page-vehiculos">
      <div className="page-header">
        <div>
          <h1>{t("vehicles.title")}</h1>
          <p>{t("vehicles.subtitle")}</p>
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
        <input
          className="page-buscador"
          type="text"
          placeholder={t("vehicles.search")}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="page-error">{localizeMessage(error, t)}</p>}

      {cargando ? (
        <p>{t("vehicles.loading")}</p>
      ) : vehiculosFiltrados.length === 0 ? (
        <p className="page-vacio">{t("vehicles.empty")}</p>
      ) : (
        <div className="tabla-wrapper">
          <table className="tabla">
            <thead>
              <tr>
                <th>{t("ui.placa")}</th>
                <th>{t("ui.tipo")}</th>
                <th>{t("ui.marca")}</th>
                <th>{t("ui.propietario")}</th>
                <th>{t("ui.email")}</th>
                <th>{t("ui.color")}</th>
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
                      <span className="badge badge--pendiente" style={{ marginLeft: 6 }}>{t("ui.no.aprobada")}</span>
                    )}
                  </td>
                  <td>{vehiculo.nombreUsuario}</td>
                  <td>{vehiculo.emailUsuario}</td>
                  <td>{vehiculo.color || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
