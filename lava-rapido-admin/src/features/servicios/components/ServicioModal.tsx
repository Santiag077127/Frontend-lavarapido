import { useState, useEffect } from "react";
import { Servicio, ServicioForm } from "../types";

interface Props {
  servicio:  Servicio | null; // null = crear, Servicio = editar
  onGuardar: (form: ServicioForm) => void;
  onCerrar:  () => void;
}

export const ServicioModal = ({ servicio, onGuardar, onCerrar }: Props) => {

  const [form, setForm] = useState<ServicioForm>({
    nombre: "", precio: 0, duracion: "", descripcion: "",
  });

  // Precarga los campos al editar
  useEffect(() => {
    if (servicio) {
      setForm({ nombre: servicio.nombre, precio: servicio.precio, duracion: servicio.duracion, descripcion: servicio.descripcion });
    } else {
      setForm({ nombre: "", precio: 0, duracion: "", descripcion: "" });
    }
  }, [servicio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "precio" ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(form);
  };

  return (
    // Clic en el fondo oscuro cierra el modal
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        <h3 className="modal-title">
          {servicio ? "Editar Servicio" : "Nuevo Servicio"}
        </h3>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-field">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="modal-field">
            <label>Precio ($)</label>
            <input name="precio" type="number" value={form.precio} onChange={handleChange} required />
          </div>
          <div className="modal-field">
            <label>Duración</label>
            <input name="duracion" value={form.duracion} onChange={handleChange} placeholder="ej: 30 min" required />
          </div>
          <div className="modal-field">
            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} />
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn-cancelar" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="modal-btn-guardar">Guardar</button>
          </div>
        </form>

      </div>
    </div>
  );
};