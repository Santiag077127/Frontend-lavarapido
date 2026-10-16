// Presenta servicios y sus acciones en una tabla.
import { useContext } from "react";
import type { Servicio } from "@/features/dashboard/types";
import { ThemeContext, useLocale, useTranslations } from "@/theme/theme";
import "./ServiciosTable.css";

interface ServiciosTableProps {
  servicios: Servicio[];
  onEditar: (servicio: Servicio) => void;
}

export const ServiciosTable = ({
  servicios,
  onEditar,
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
            <td>
              <button className="btn-editar" onClick={() => onEditar(servicio)}>
                {t("common.edit")}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
