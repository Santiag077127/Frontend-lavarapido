// Lista servicios y permite crearlos, editarlos o cambiar su estado.
import { useContext, useEffect, useMemo, useState } from "react";
import { ServiciosTable } from "@/features/dashboard/components/ServiciosTable";
import { ServicioModal } from "@/features/dashboard/components/ServicioModal";
import { ThemeContext, localizeMessage, useTranslations } from "@/theme/theme";
import {
  getServicios,
  createServicio,
  updateServicio,
  cambiarEstadoServicio,
} from "@/features/dashboard/services/servicioService";
import type { Servicio, ServicioForm } from "@/features/dashboard/types";
import "./ServiciosPage.css";

export const ServiciosPage = () => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
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
      setError("ui.no.se.pudieron.cargar.los.servicios.intenta.de.nuevo");
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

  // El mismo modal crea o actualiza según exista un servicio en edición.
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
      setError("ui.no.se.pudo.guardar.el.servicio.verifica.los.datos");
    }
  };

  const handleCambiarEstado = async (servicio: Servicio) => {
    setError(null);
    try {
      await cambiarEstadoServicio(servicio.idServicio, true);
      await cargarServicios();
    } catch {
      setError("ui.no.se.pudo.cambiar.el.estado.del.servicio");
    }
  };

  return (
    <div className="page-servicios">
      <div className="page-header">
        <h1>{t("services.title")}</h1>
        <button className="btn-nuevo" onClick={handleNuevo}>
          + {t("services.new")}
        </button>
      </div>

      <div className="page-buscador">
        <input
          type="text"
          placeholder={t("common.searchByName")}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="page-error">{localizeMessage(error, t)}</p>}

      {cargando ? (
        <p>{t("services.loading")}</p>
      ) : serviciosFiltrados.length === 0 ? (
        <p className="page-vacio">{t("common.noResults")}</p>
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
