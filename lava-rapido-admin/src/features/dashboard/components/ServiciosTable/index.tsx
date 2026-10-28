// Presenta servicios y sus acciones en una tabla.
import { useContext } from "react";
import { Star } from "lucide-react";
import type { Servicio } from "@/features/dashboard/types";
import { ThemeContext, useLocale, useTranslations } from "@/theme/theme";
import "./ServiciosTable.css";

interface ServiciosTableProps {
  servicios: Servicio[];
  onEditar: (servicio: Servicio) => void;
  onCambiarEstado: (servicio: Servicio) => void;
  cambiandoId: string | null;
  onVerCalificaciones: (servicio: Servicio) => void;
}

export const ServiciosTable = ({
  servicios,
  onEditar,
  onCambiarEstado,
  cambiandoId,
  onVerCalificaciones,
}: ServiciosTableProps) => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
  const locale = useLocale();

  return (
    <table className="tabla-servicios">
      <thead>
        <tr>
          <th>{t("common.name")}</th>
          <th>{t("common.description")}</th>
          <th>{t("common.price")}</th>
          <th>{t("common.duration")}</th>
          <th>{t("common.status")}</th>
          <th>{t("common.actions")}</th>
        </tr>
      </thead>
      <tbody>
        {servicios.map((servicio) => (
          <tr key={servicio.idServicio}>
            <td>{servicio.nombre}</td>
            <td className="tabla-descripcion" title={servicio.descripcion}>
              {servicio.descripcion || "—"}
            </td>
            <td>${servicio.precio.toLocaleString(locale)}</td>
            <td>{servicio.duracionMinutos} min</td>
            <td><span className={`badge ${servicio.estado ? "badge--activo" : "badge--inactivo"}`}>{servicio.estado ? t("common.active") : t("common.inactive")}</span></td>
            <td>
              <div className="service-row-actions">
              <button className="btn-calificaciones" onClick={() => onVerCalificaciones(servicio)}>
                <Star size={15} aria-hidden="true" />
                {t("serviceRatings.action")}
              </button>
              <button className="btn-editar" onClick={() => onEditar(servicio)}>
                {t("common.edit")}
              </button>
              <button className={servicio.estado ? "btn-desactivar" : "btn-activar"} onClick={() => onCambiarEstado(servicio)} disabled={cambiandoId === servicio.idServicio}>
                {cambiandoId === servicio.idServicio ? t("profile.saving") : servicio.estado ? t("common.deactivate") : t("common.activate")}
              </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
