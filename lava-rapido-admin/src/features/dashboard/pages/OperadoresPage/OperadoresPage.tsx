import "./OperadoresPage.css";
import { useState } from "react";
import { OperadorModal } from "../../components/OperadorModal/OperadorModal";

interface Operador {
  id:       number;
  nombre:   string;
  correo:   string;
  telefono: string;
  estado:   boolean;
}

const operadoresMock: Operador[] = [
  { id: 1, nombre: "Carlos Rojas",  correo: "carlos@correo.com",  telefono: "3101234567", estado: true  },
  { id: 2, nombre: "María Torres",  correo: "maria@correo.com",   telefono: "3209876543", estado: true  },
  { id: 3, nombre: "Andrés López",  correo: "andres@correo.com",  telefono: "3154567890", estado: false },
];

export const OperadoresPage = () => {
  const [operadores, setOperadores] = useState<Operador[]>(operadoresMock);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleEstado = (id: number) => {
    setOperadores(prev =>
      prev.map(op => op.id === id ? { ...op, estado: !op.estado } : op)
    );
  };

  const handleAgregar = (nuevo: Omit<Operador, "id" | "estado">) => {
    setOperadores(prev => [
      ...prev,
      { ...nuevo, id: Date.now(), estado: true },
    ]);
    setModalVisible(false);
  };

  const activos   = operadores.filter(o => o.estado).length;
  const inactivos = operadores.filter(o => !o.estado).length;

  return (
    <div className="op-page">

      <div className="op-header">
        <div>
          <h2 className="op-titulo">Operadores</h2>
          <p className="op-subtitulo">Gestión del personal de lavado</p>
        </div>
        <button
          className="op-btn-nuevo"
          onClick={() => setModalVisible(true)}
        >
          + Nuevo operador
        </button>
      </div>

      {/* ── Estadísticas rápidas ── */}
      <div className="op-stats">
        <div className="op-stat">
          <p className="op-stat__valor">{operadores.length}</p>
          <p className="op-stat__label">Total</p>
        </div>
        <div className="op-stat op-stat--activo">
          <p className="op-stat__valor">{activos}</p>
          <p className="op-stat__label">Activos</p>
        </div>
        <div className="op-stat op-stat--inactivo">
          <p className="op-stat__valor">{inactivos}</p>
          <p className="op-stat__label">Inactivos</p>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="op-tabla-wrapper">
        <table className="op-tabla">
          <thead>
            <tr>
              {["#", "Nombre", "Correo", "Teléfono", "Estado", "Acciones"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operadores.map((op, i) => (
              <tr key={op.id}>
                <td className="op-col-num">{i + 1}</td>
                <td className="op-col-nombre">{op.nombre}</td>
                <td className="op-col-dato">{op.correo}</td>
                <td className="op-col-dato">{op.telefono}</td>
                <td>
                  <span className={`op-badge ${op.estado ? "op-badge--activo" : "op-badge--inactivo"}`}>
                    {op.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <button
                    className={`op-btn-toggle ${op.estado ? "op-btn-toggle--desactivar" : "op-btn-toggle--activar"}`}
                    onClick={() => toggleEstado(op.id)}
                  >
                    {op.estado ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalVisible && (
        <OperadorModal
          onGuardar={handleAgregar}
          onCancelar={() => setModalVisible(false)}
        />
      )}

    </div>
  );
};
