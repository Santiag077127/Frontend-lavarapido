// src/features/dashboard/components/TurnoDetailModal/index.tsx
//
// Modal de detalle de un turno. Permite asignar/reasignar operador
// y cancelar el turno (con confirmación vía ConfirmModal).

import { useState } from "react";
import { ConfirmModal } from "../ConfirmModal/ConfirmModal";
import { OperadorOption, Reserva } from "../../services/reservaService";
import "./TurnoDetailModal.css";

interface TurnoDetailModalProps {
  reserva: Reserva;
  operadoresDisponibles: OperadorOption[];
  onClose: () => void;
  onAsignarOperador: (reservaId: string, operador: OperadorOption) => void | Promise<void>;
  onCancelarTurno: (reservaId: string) => void | Promise<void>;
}

const ESTADO_LABEL: Record<Reserva["estado"], string> = {
  pendiente: "Pendiente",
  asignada: "Asignada",
  en_proceso: "En proceso",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const PAGO_LABEL: Record<Reserva["pago"]["estado"], string> = {
  aprobado: "Pagado",
  pendiente: "Pago pendiente",
  rechazado: "Pago rechazado",
};

export const TurnoDetailModal = ({
  reserva,
  operadoresDisponibles,
  onClose,
  onAsignarOperador,
  onCancelarTurno,
}: TurnoDetailModalProps) => {
  const [operadorSeleccionado, setOperadorSeleccionado] = useState("");
  const [mostrarConfirmCancelar, setMostrarConfirmCancelar] = useState(false);

  const puedeAsignar = reserva.estado === "pendiente" || reserva.estado === "asignada";
  const puedeCancelar = reserva.estado !== "finalizada" && reserva.estado !== "cancelada";

  function handleAsignar() {
    const operador = operadoresDisponibles.find((op) => op.id === operadorSeleccionado);
    if (!operador) return;
    onAsignarOperador(reserva.id, operador);
    setOperadorSeleccionado("");
  }

  return (
    <>
      <div className="tdm-overlay" onClick={onClose}>
        <div className="tdm-card" onClick={(e) => e.stopPropagation()}>
          <div className="tdm-header">
            <h2>Detalle del turno</h2>
            <span className={`badge gt-badge-${reserva.estado}`}>
              {ESTADO_LABEL[reserva.estado]}
            </span>
          </div>

          <div className="tdm-seccion">
            <h3>Cliente</h3>
            <p>{reserva.cliente.nombre}</p>
            <p className="tdm-secundario">{reserva.cliente.telefono}</p>
          </div>

          <div className="tdm-seccion">
            <h3>Vehículo</h3>
            <p>
              {reserva.vehiculo.placa} · {reserva.vehiculo.tipo}
            </p>
          </div>

          <div className="tdm-seccion">
            <h3>Servicio</h3>
            <p>{reserva.servicio.nombre}</p>
            <p className="tdm-secundario">
              ${reserva.servicio.precio.toLocaleString("es-CO")} · {reserva.servicio.duracionMinutos} min ·{" "}
              {reserva.hora}
            </p>
          </div>

          <div className="tdm-seccion">
            <h3>Pago</h3>
            <p className="tdm-secundario">
              {PAGO_LABEL[reserva.pago.estado]}
              {reserva.pago.metodo
                ? ` · ${reserva.pago.metodo === "en_linea" ? "En línea" : "Efectivo"}`
                : ""}
            </p>
          </div>

          <div className="tdm-seccion">
            <h3>Operador asignado</h3>
            <p>{reserva.operador ? reserva.operador.nombre : "Sin asignar"}</p>

            {puedeAsignar && (
              <div className="tdm-asignar">
                <select
                  value={operadorSeleccionado}
                  onChange={(e) => setOperadorSeleccionado(e.target.value)}
                >
                  <option value="">Seleccionar operador...</option>
                  {operadoresDisponibles.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nombre}
                    </option>
                  ))}
                </select>
                <button
                  className="tdm-btn-asignar"
                  disabled={!operadorSeleccionado}
                  onClick={handleAsignar}
                >
                  {reserva.operador ? "Reasignar" : "Asignar"}
                </button>
              </div>
            )}
          </div>

          <div className="tdm-acciones">
            {puedeCancelar && (
              <button
                className="tdm-btn-cancelar"
                onClick={() => setMostrarConfirmCancelar(true)}
              >
                Cancelar turno
              </button>
            )}
            <button className="tdm-btn-cerrar" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {mostrarConfirmCancelar && (
        <ConfirmModal
          titulo="Cancelar turno"
          mensaje={`¿Seguro que quieres cancelar el turno de ${reserva.cliente.nombre}? Esta acción no se puede deshacer.`}
          textoConfirmar="Sí, cancelar"
          textoVolver="Volver"
          onConfirmar={() => {
            onCancelarTurno(reserva.id);
            setMostrarConfirmCancelar(false);
          }}
          onCancelar={() => setMostrarConfirmCancelar(false)}
        />
      )}
    </>
  );
};
