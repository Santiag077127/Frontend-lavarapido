// Lista servicios y permite crearlos, editarlos o cambiar su estado.
import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
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

type ServiceStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const errorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && error.response?.status === 409) {
    const message = error.response.data?.error;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

export const ServiciosPage = () => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);
  const [cambiandoId, setCambiandoId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>("ALL");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    return servicios.filter((servicio) => {
      const matchesName = !termino || servicio.nombre.toLowerCase().includes(termino);
      const matchesStatus = statusFilter === "ALL"
        || (statusFilter === "ACTIVE" && servicio.estado)
        || (statusFilter === "INACTIVE" && !servicio.estado);
      return matchesName && matchesStatus;
    });
  }, [servicios, busqueda, statusFilter]);

  const handleNuevo = () => {
    setError(null);
    setSuccessMessage(null);
    setServicioEditando(null);
    setModalAbierto(true);
  };

  const handleEditar = (servicio: Servicio) => {
    setError(null);
    setSuccessMessage(null);
    setServicioEditando(servicio);
    setModalAbierto(true);
  };

  const handleCambiarEstado = async (servicio: Servicio) => {
    setCambiandoId(servicio.idServicio);
    setError(null);
    setSuccessMessage(null);
    try {
      const actualizado = await cambiarEstadoServicio(servicio.idServicio, !servicio.estado);
      setServicios((actuales) => actuales.map((item) => item.idServicio === servicio.idServicio ? actualizado : item));
      setSuccessMessage(actualizado.estado
        ? "Servicio activado correctamente."
        : "Servicio desactivado correctamente.");
    } catch {
      setError("No se pudo cambiar el estado del servicio. Intenta de nuevo.");
    } finally {
      setCambiandoId(null);
    }
  };

  // El mismo modal crea o actualiza según exista un servicio en edición.
  const handleGuardar = async (form: ServicioForm) => {
    setError(null);
    setSuccessMessage(null);
    try {
      if (servicioEditando) {
        await updateServicio(servicioEditando.idServicio, form);
      } else {
        await createServicio(form);
      }
      setModalAbierto(false);
      setSuccessMessage(servicioEditando
        ? "Servicio actualizado correctamente."
        : "Servicio creado correctamente.");
      await cargarServicios();
    } catch (error) {
      setError(errorMessage(error, "ui.no.se.pudo.guardar.el.servicio.verifica.los.datos"));
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

      <div className="services-filters">
        <label htmlFor="service-status-filter">{t("common.status")}</label>
        <select
          id="service-status-filter"
          className="service-status-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ServiceStatusFilter)}
        >
          <option value="ALL">{t("common.all")}</option>
          <option value="ACTIVE">{t("common.activePlural")}</option>
          <option value="INACTIVE">{t("common.inactivePlural")}</option>
        </select>
      </div>

      {error && !modalAbierto && <p className="page-error">{localizeMessage(error, t)}</p>}
      {successMessage && !modalAbierto && <p className="page-success" role="status">{successMessage}</p>}

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
            cambiandoId={cambiandoId}
          />
        </div>
      )}

      {modalAbierto && (
        <ServicioModal
          servicio={servicioEditando}
          error={modalAbierto ? error : null}
          onGuardar={handleGuardar}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
};
