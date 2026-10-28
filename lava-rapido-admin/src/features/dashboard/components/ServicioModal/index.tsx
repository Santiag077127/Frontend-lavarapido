// Recoge y valida datos al crear o editar un servicio.
import "./ServicioModal.css";

import { useEffect, useState } from "react";
import { localizeMessage, useTranslations } from "@/theme/theme";
import type { Servicio, ServicioForm } from "../../types";

interface Props {
  servicio: Servicio | null;
  error?: string | null;
  onGuardar: (form: ServicioForm) => void;
  onCerrar: () => void;
}

type ServiceField = "nombre" | "precio" | "duracionMinutos" | "descripcion";
type ServiceDraft = Record<ServiceField, string>;
const emptyDraft: ServiceDraft = { nombre: "", precio: "", duracionMinutos: "", descripcion: "" };

const draftFor = (service: Servicio | null): ServiceDraft => service ? {
  nombre: service.nombre,
  precio: String(service.precio),
  duracionMinutos: String(service.duracionMinutos),
  descripcion: service.descripcion ?? "",
} : { ...emptyDraft };

const decimalIdentity = (value: string): string | null => {
  const match = /^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(value);
  if (!match) return null;
  let digits = `${match[1]}${match[2] ?? ""}`.replace(/^0+/, "") || "0";
  let scale = (match[2]?.length ?? 0) - Number(match[3] ?? 0);
  if (scale < 0) { digits += "0".repeat(-scale); scale = 0; }
  while (scale > 0 && digits.endsWith("0")) { digits = digits.slice(0, -1); scale -= 1; }
  return `${digits}:${scale}`;
};

export const validateServiceDraft = (draft: ServiceDraft): Partial<Record<ServiceField, string>> => {
  const errors: Partial<Record<ServiceField, string>> = {};
  const name = draft.nombre.trim();
  if (!name) errors.nombre = "services.validation.nameRequired";
  else if (name.length > 100) errors.nombre = "services.validation.nameTooLong";

  const priceText = draft.precio.trim();
  const normalizedPrice = priceText.replace(",", ".");
  const price = Number(normalizedPrice);
  const parsedPrice = Number.isFinite(price) ? JSON.stringify(price) : undefined;
  if (!/^(?:\d+)(?:[.,]\d+)?$/.test(priceText) || !Number.isFinite(price) || price < 0.01
    || !parsedPrice || decimalIdentity(normalizedPrice) !== decimalIdentity(parsedPrice)) {
    errors.precio = "services.validation.priceInvalid";
  }

  const durationText = draft.duracionMinutos.trim();
  const duration = Number(durationText);
  if (!/^\d+$/.test(durationText) || !Number.isInteger(duration) || duration < 15 || duration > 180) {
    errors.duracionMinutos = "services.validation.durationInvalid";
  }
  if (draft.descripcion.length > 300) errors.descripcion = "services.validation.descriptionTooLong";
  return errors;
};

export const ServicioModal = ({ servicio, error, onGuardar, onCerrar }: Props) => {
  const t = useTranslations();
  const [draft, setDraft] = useState<ServiceDraft>(() => draftFor(servicio));
  const [touched, setTouched] = useState<Partial<Record<ServiceField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setDraft(draftFor(servicio));
    setTouched({});
    setSubmitted(false);
  }, [servicio]);

  const errors = validateServiceDraft(draft);
  const changeField = (field: ServiceField, value: string) => {
    const next = { ...draft, [field]: value };
    setDraft(next);
    setTouched((current) => ({ ...current, [field]: true }));
  };
  const blurField = (field: ServiceField) => setTouched((current) => ({ ...current, [field]: true }));
  const visibleError = (field: ServiceField) => (touched[field] || submitted) && errors[field];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setTouched({ nombre: true, precio: true, duracionMinutos: true, descripcion: true });
    if (Object.keys(errors).length) return;
    onGuardar({
      nombre: draft.nombre.trim(),
      precio: Number(draft.precio),
      duracionMinutos: Number(draft.duracionMinutos),
      descripcion: draft.descripcion.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <h3 className="modal-title">{servicio ? t("services.edit") : t("services.new")}</h3>
        {error && <p className="modal-error" role="alert">{localizeMessage(error, t)}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-field">
            <label htmlFor="service-name">{t("services.name")}</label>
            <input id="service-name" name="nombre" value={draft.nombre} onChange={(event) => changeField("nombre", event.target.value)} onBlur={() => blurField("nombre")} maxLength={100} aria-invalid={Boolean(visibleError("nombre"))} aria-describedby={visibleError("nombre") ? "service-name-error" : undefined} />
            {visibleError("nombre") && <p id="service-name-error" className="modal-field-error">{t(errors.nombre!)}</p>}
          </div>
          <div className="modal-field">
            <label htmlFor="service-price">{t("common.price")} ($)</label>
            <input id="service-price" name="precio" type="text" inputMode="decimal" autoComplete="off" value={draft.precio} onChange={(event) => changeField("precio", event.target.value)} onBlur={() => blurField("precio")} aria-invalid={Boolean(visibleError("precio"))} aria-describedby={visibleError("precio") ? "service-price-error" : undefined} />
            {visibleError("precio") && <p id="service-price-error" className="modal-field-error">{t(errors.precio!)}</p>}
          </div>
          <div className="modal-field">
            <label htmlFor="service-duration">{t("common.duration")} {t("ui.min")}</label>
            <input id="service-duration" name="duracionMinutos" type="number" min={15} max={180} step={1} value={draft.duracionMinutos} onChange={(event) => changeField("duracionMinutos", event.target.value)} onBlur={() => blurField("duracionMinutos")} aria-invalid={Boolean(visibleError("duracionMinutos"))} aria-describedby={visibleError("duracionMinutos") ? "service-duration-error" : undefined} />
            {visibleError("duracionMinutos") && <p id="service-duration-error" className="modal-field-error">{t(errors.duracionMinutos!)}</p>}
          </div>
          <div className="modal-field">
            <label htmlFor="service-description">{t("common.description")}</label>
            <textarea id="service-description" name="descripcion" value={draft.descripcion} onChange={(event) => changeField("descripcion", event.target.value)} onBlur={() => blurField("descripcion")} maxLength={300} rows={3} aria-invalid={Boolean(visibleError("descripcion"))} aria-describedby={visibleError("descripcion") ? "service-description-error" : undefined} />
            {visibleError("descripcion") && <p id="service-description-error" className="modal-field-error">{t(errors.descripcion!)}</p>}
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn-cancelar" onClick={onCerrar}>{t("common.cancel")}</button>
            <button type="submit" className="modal-btn-guardar">{t("common.save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
