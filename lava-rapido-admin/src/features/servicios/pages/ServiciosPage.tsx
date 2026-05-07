import { useState } from "react";
import { Servicio, ServicioForm } from "../types";
import { getServicios, createServicio, updateServicio, deleteServicio } from "../services/servicioService";
import { ServiciosTable } from "../components/ServiciosTable";
import { ServicioModal }  from "../components/ServicioModal";

export const ServiciosPage = () => {

  const [servicios,      setServicios]      = useState<Servicio[]>(getServicios());
  const [modalAbierto,   setModalAbierto]   = useState(false);
  const [servicioActivo, setServicioActivo] = useState<Servicio | null>(null);

  const handleNuevo = () => {
    setServicioActivo(null);
    setModalAbierto(true);
  };

  const handleEditar = (servicio: Servicio) => {
    setServicioActivo(servicio);
    setModalAbierto(true);
  };

  const handleEliminar = (id: string) => {
    deleteServicio(id);
    setServicios(getServicios());
  };

  const handleGuardar = (form: ServicioForm) => {
    if (servicioActivo) {
      updateServicio(servicioActivo.id, form);
    } else {
      createServicio(form);
    }
    setServicios(getServicios());
    setModalAbierto(false);
  };

  return (
    <div className="page-wrapper">

      <div className="page-header">
        <h2 className="page-title">Servicios de Lavado</h2>
        <button className="btn-nuevo" onClick={handleNuevo}>+ Nuevo Servicio</button>
      </div>

      <ServiciosTable
        servicios={servicios}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />

      {/* Modal solo existe en el DOM cuando está abierto */}
      {modalAbierto && (
        <ServicioModal
          servicio={servicioActivo}
          onGuardar={handleGuardar}
          onCerrar={() => setModalAbierto(false)}
        />
      )}

    </div>
  );
};