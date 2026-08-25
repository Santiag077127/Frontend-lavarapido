import type { Servicio } from "@/features/dashboard/types";
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
  return (
    <table className="tabla-servicios">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Precio</th>
          <th>Duración</th>
          <th>Estado</th>
          <th>Acciones</th>
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
                {servicio.estado ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td>
              <button className="btn-editar" onClick={() => onEditar(servicio)}>
                Editar
              </button>
              <button
                className={
                  servicio.estado ? "btn-desactivar" : "btn-activar"
                }
                onClick={() => onCambiarEstado(servicio)}
              >
                {servicio.estado ? "Desactivar" : "Activar"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};