import { Servicio } from "../types";

interface Props {
  servicios:  Servicio[];
  onEditar:   (servicio: Servicio) => void;
  onEliminar: (id: string) => void;
}

export const ServiciosTable = ({ servicios, onEditar, onEliminar }: Props) => {
  return (
    <div className="tabla-wrapper">
      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Duración</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.length === 0 ? (
            <tr>
              <td colSpan={5} className="tabla-vacia">No hay servicios registrados</td>
            </tr>
          ) : (
            servicios.map((s) => (
              <tr key={s.id}>
                <td>{s.nombre}</td>
                <td>${s.precio.toLocaleString("es-CO")}</td>
                <td>{s.duracion}</td>
                <td>{s.descripcion}</td>
                <td className="tabla-acciones">
                  <button className="btn-editar"   onClick={() => onEditar(s)}>Editar</button>
                  <button className="btn-eliminar" onClick={() => onEliminar(s.id)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};