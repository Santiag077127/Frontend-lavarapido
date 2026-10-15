// Recoge y valida datos al crear o editar un servicio.
import "./ServicioModal.css";

import { useContext, useState, useEffect } from "react";
import { ThemeContext, localizeMessage, useTranslations } from "@/theme/theme";
import type { Servicio, ServicioForm } from "../../types";

interface Props {
  servicio: Servicio | null; // null = crear, Servicio = editar
  onGuardar: (form: ServicioForm) => void;
  onCerrar: () => void;
}

export const ServicioModal = ({ servicio, onGuardar, onCerrar }: Props) => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ServicioForm, string>>>({});
  const [form, setForm] = useState<ServicioForm>({
    nombre: "",
    precio: 0,
    duracionMinutos: 15,
    descripcion: "",
  });

  // Precarga los campos al editar
  useEffect(() => {
    if (servicio) {
      setForm({
        nombre: servicio.nombre,
        precio: servicio.precio,
        duracionMinutos: servicio.duracionMinutos,
        descripcion: servicio.descripcion,
      });
    } else {
      setForm({ nombre: "", precio: 0, duracionMinutos: 15, descripcion: "" });
    }
    setFieldErrors({});
  }, [servicio]);

  const validateForm = (nextForm: ServicioForm) => {
    const errors: Partial<Record<keyof ServicioForm, string>> = {};
    const nombre = nextForm.nombre.trim();

    if (!nombre) errors.nombre = "ui.el.nombre.del.servicio.es.obligatorio";
    else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(nombre)) {
      errors.nombre = "ui.el.nombre.del.servicio.no.puede.contener.numeros.ni.simbolos";
    } else if (nombre.length < 3) errors.nombre = "ui.el.nombre.debe.tener.minimo.3.caracteres";

    if (!Number.isFinite(nextForm.precio) || nextForm.precio <= 0) {
      errors.precio = "ui.el.precio.debe.ser.mayor.que.cero";
    }

    if (!Number.isFinite(nextForm.duracionMinutos) || nextForm.duracionMinutos < 15 || nextForm.duracionMinutos > 180) {
      errors.duracionMinutos = "ui.la.duracion.debe.estar.entre.15.y.180.minutos";
    }

    return errors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const esNumerico = name === "precio" || name === "duracionMinutos";
    const sanitizedValue = name === "nombre"
      ? value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
      : value;
    const nextForm = {
      ...form,
      [name]: esNumerico ? Number(sanitizedValue) : sanitizedValue,
    } as ServicioForm;

    setForm(nextForm);

    const errors = validateForm(nextForm);
    setFieldErrors((current) => ({
      ...current,
      [name]: sanitizedValue !== value
        ? "ui.el.nombre.del.servicio.no.puede.contener.numeros.ni.simbolos"
        : errors[name as keyof ServicioForm] || "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    onGuardar({ ...form, nombre: form.nombre.trim(), descripcion: form.descripcion.trim() });
  };

  return (
    // Clic en el fondo oscuro cierra el modal
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">
          {servicio ? t("services.edit") : t("services.new")}
        </h3>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-field">
            <label>{t("services.name")}</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className={fieldErrors.nombre ? "modal-input-error" : ""}
              maxLength={100}
              required
            />
            {fieldErrors.nombre && <p className="modal-field-error">{localizeMessage(fieldErrors.nombre, t)}</p>}
          </div>
          <div className="modal-field">
            <label>{t("common.price")} ($)</label>
            <input
              name="precio"
              type="number"
              min={1}
              value={form.precio}
              onChange={handleChange}
              className={fieldErrors.precio ? "modal-input-error" : ""}
              required
            />
            {fieldErrors.precio && <p className="modal-field-error">{localizeMessage(fieldErrors.precio, t)}</p>}
          </div>
          <div className="modal-field">
            <label>{t("common.duration")}{" " + t("ui.min")}</label>
            <input
              name="duracionMinutos"
              type="number"
              min={15}
              max={180}
              value={form.duracionMinutos}
              onChange={handleChange}
              className={fieldErrors.duracionMinutos ? "modal-input-error" : ""}
              required
            />
            {fieldErrors.duracionMinutos && <p className="modal-field-error">{localizeMessage(fieldErrors.duracionMinutos, t)}</p>}
          </div>
          <div className="modal-field">
            <label>{t("common.description")}</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              maxLength={300}
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn-cancelar"
              onClick={onCerrar}
            >
              {t("common.cancel")}
            </button>
            <button type="submit" className="modal-btn-guardar">
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
