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
    setError(null);
    setServicioEditando(null);
    setModalAbierto(true);
  };

  const handleEditar = (servicio: Servicio) => {
    setError(null);
    setServicioEditando(servicio);
    setModalAbierto(true);
  };

  const handleCambiarEstado = async (servicio: Servicio) => {
    setCambiandoId(servicio.idServicio);
    setError(null);
    try {
      const actualizado = await cambiarEstadoServicio(servicio.idServicio, !servicio.estado);
      setServicios((actuales) => actuales.map((item) => item.idServicio === servicio.idServicio ? actualizado : item));
    } catch {
      setError("No se pudo cambiar el estado del servicio. Intenta de nuevo.");
    } finally {
      setCambiandoId(null);
    }
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

      {error && !modalAbierto && <p className="page-error">{localizeMessage(error, t)}</p>}

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
