import { useContext } from "react";
import type { Servicio } from "@/features/dashboard/types";
import { ThemeContext } from "@/theme/theme";
import "./ServiciosTable.css";

interface ServiciosTableProps {
  servicios: Servicio[];
  onEditar: (servicio: Servicio) => void;
  onCambiarEstado: (servicio: Servicio) => void;
}

export const ServiciosTable = ({
  servicios,
  onEditar,
  onCambiarEstado,
}: ServiciosTableProps) => {
  const theme = useContext(ThemeContext);
  const t = theme?.t ?? ((key: string) => key);

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
            <td>${servicio.precio.toLocaleString("es-CO")}</td>
            <td>{servicio.duracionMinutos} min</td>
            <td>
              <span
                className={
                  servicio.estado
                    ? "badge badge--activo"
                    : "badge badge--inactivo"
                }
              >
                {servicio.estado ? t("common.active") : t("common.inactive")}
              </span>
            </td>
            <td>
              <button className="btn-editar" onClick={() => onEditar(servicio)}>
                {t("common.edit")}
              </button>
              <button
                className={
                  servicio.estado ? "btn-desactivar" : "btn-activar"
                }
                onClick={() => onCambiarEstado(servicio)}
              >
                {servicio.estado ? t("common.deactivate") : t("common.activate")}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
