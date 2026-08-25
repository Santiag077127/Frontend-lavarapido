import "./PanelPrincipalPage.css";

interface Turno {
  id: number;
  cliente: string;
  vehiculo: string;
  servicio: string;
  estado: "Pendiente" | "En proceso" | "Finalizado";
  hora: string;
}

const turnosMock: Turno[] = [
  { id: 1, cliente: "Carlos Rojas",   vehiculo: "Toyota Corolla · Blanco",  servicio: "Lavado Completo", estado: "En proceso", hora: "10:15 AM" },
  { id: 2, cliente: "María Torres",   vehiculo: "Chevrolet Spark · Rojo",   servicio: "Lavado Básico",   estado: "Pendiente",  hora: "10:30 AM" },
  { id: 3, cliente: "Andrés López",   vehiculo: "Mazda 3 · Gris",           servicio: "Lavado Premium",  estado: "Finalizado", hora: "09:50 AM" },
  { id: 4, cliente: "Laura Gómez",    vehiculo: "Renault Sandero · Negro",  servicio: "Lavado Básico",   estado: "Pendiente",  hora: "10:45 AM" },
];

const estadoConfig = {
  "Pendiente":  { className: "badge badge--pendiente",  label: "Pendiente"  },
  "En proceso": { className: "badge badge--en-proceso", label: "En proceso" },
  "Finalizado": { className: "badge badge--finalizado", label: "Finalizado" },
};

export const PanelPrincipalPage = () => {
  const activos     = turnosMock.filter(t => t.estado === "En proceso").length;
  const pendientes  = turnosMock.filter(t => t.estado === "Pendiente").length;
  const finalizados = turnosMock.filter(t => t.estado === "Finalizado").length;
  const total       = turnosMock.length;

  return (
    <div className="panel-principal">

      <div className="panel-header">
        <h2 className="panel-titulo">Panel principal</h2>
        <p className="panel-subtitulo">Resumen de operaciones del día</p>
      </div>

      {/* ── Tarjetas de estadísticas ── */}
      <div className="stats-grid">
        <StatCard label="Servicios activos" value={activos}     className="stat--azul"    />
        <StatCard label="Pendientes"        value={pendientes}  className="stat--amarillo" />
        <StatCard label="Finalizados hoy"   value={finalizados} className="stat--verde"   />
        <StatCard label="Total del día"     value={total}       className="stat--morado"  />
      </div>

      {/* ── Tabla de turnos ── */}
      <div className="turnos-card">
        <div className="turnos-card__header">
          <h3 className="turnos-card__titulo">Turnos en curso</h3>
        </div>
        <div className="turnos-tabla-wrapper">
          <table className="turnos-tabla">
            <thead>
              <tr>
                {["#", "Cliente", "Vehículo", "Servicio", "Estado", "Hora"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {turnosMock.map((t, i) => (
                <tr key={t.id}>
                  <td className="col-num">{i + 1}</td>
                  <td className="col-cliente">{t.cliente}</td>
                  <td className="col-vehiculo">{t.vehiculo}</td>
                  <td>{t.servicio}</td>
                  <td>
                    <span className={estadoConfig[t.estado].className}>
                      {estadoConfig[t.estado].label}
                    </span>
                  </td>
                  <td className="col-hora">{t.hora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// ── Subcomponente tarjeta ──
interface StatCardProps {
  label: string;
  value: number;
  className: string;
}

const StatCard = ({ label, value, className }: StatCardProps) => (
  <div className={`stat-card ${className}`}>
    <p className="stat-card__valor">{value}</p>
    <p className="stat-card__label">{label}</p>
  </div>
);