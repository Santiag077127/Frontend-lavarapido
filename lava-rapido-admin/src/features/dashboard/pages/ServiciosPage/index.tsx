import { useEffect, useMemo, useState } from "react";
import { ServiciosTable } from "@/features/dashboard/components/ServiciosTable";
import { ServicioModal } from "@/features/dashboard/components/ServicioModal";
import {
  getServicios,
  createServicio,
  updateServicio,
  cambiarEstadoServicio,
} from "@/features/dashboard/services/servicioService";
import type { Servicio, ServicioForm } from "@/features/dashboard/types";
import "./ServiciosPage.css";

export const ServiciosPage = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);

  const cargarServicios = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getServicios();
      setServicios(data);
    } catch {
      setError("No se pudieron cargar los servicios. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const serviciosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return servicios;
    return servicios.filter((s) => s.nombre.toLowerCase().includes(termino));
  }, [servicios, busqueda]);

  const handleNuevo = () => {
    setServicioEditando(null);
    setModalAbierto(true);
  };

  const handleEditar = (servicio: Servicio) => {
    setServicioEditando(servicio);
    setModalAbierto(true);
  };

  const handleGuardar = async (form: ServicioForm) => {
    setError(null);
    try {
      if (servicioEditando) {
        await updateServicio(servicioEditando.idServicio, form);
      } else {
        await createServicio(form);
      }
      setModalAbierto(false);
      await cargarServicios();
    } catch {
      setError("No se pudo guardar el servicio. Verifica los datos.");
    }
  };

  const handleCambiarEstado = async (servicio: Servicio) => {
    setError(null);
    try {
      await cambiarEstadoServicio(servicio.idServicio, !servicio.estado);
      await cargarServicios();
    } catch {
      setError("No se pudo cambiar el estado del servicio.");
    }
  };

  return (
    <div className="page-servicios">
      <div className="page-header">
        <h1>Servicios</h1>
        <button className="btn-nuevo" onClick={handleNuevo}>
          + Nuevo Servicio
        </button>
      </div>

      <div className="page-buscador">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="page-error">{error}</p>}

      {cargando ? (
        <p>Cargando servicios...</p>
      ) : serviciosFiltrados.length === 0 ? (
        <p className="page-vacio">No se encontraron resultados.</p>
      ) : (
        <div className="tabla-wrapper">
          <ServiciosTable
            servicios={serviciosFiltrados}
            onEditar={handleEditar}
            onCambiarEstado={handleCambiarEstado}
          />
        </div>
      )}

      {modalAbierto && (
        <ServicioModal
          servicio={servicioEditando}
          onGuardar={handleGuardar}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
};
