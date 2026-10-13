// Muestra las notificaciones, filtros de lectura y acciones para marcarlas.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { notificacionesApi, type PaginaNotificaciones } from "../../services/notificacionService";
import "./NotificacionesPage.css";

export function NotificacionesPage() {
  const [pagina, setPagina] = useState(0);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [datos, setDatos] = useState<PaginaNotificaciones | null>(null);
  const [count, setCount] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true); setError(false);
    try {
      // Trae la página y el contador de no leídas en paralelo.
      const [lista, pendientes] = await Promise.all([
        notificacionesApi.listar(pagina, soloNoLeidas), notificacionesApi.contar(),
      ]);
      setDatos(lista); setCount(pendientes);
      window.dispatchEvent(new Event("notificaciones:actualizadas"));
    } catch { setError(true); }
    finally { setCargando(false); }
  }, [pagina, soloNoLeidas]);
  useEffect(() => { void cargar(); }, [cargar]);

  const leer = async (id: string) => {
    try { await notificacionesApi.leer(id); await cargar(); }
    catch { setError(true); }
  };
  const leerTodas = async () => {
    try { await notificacionesApi.leerTodas(); await cargar(); }
    catch { setError(true); }
  };

  return <section className="notificaciones-page">
    <h1>Notificaciones</h1>
    <p>{count} sin leer</p>
    <div className="notificaciones-actions">
      <label><input type="checkbox" checked={soloNoLeidas} onChange={e => { setPagina(0); setSoloNoLeidas(e.target.checked); }} /> Solo no leídas</label>
      <button onClick={() => void leerTodas()} disabled={count === 0}>Marcar todas como leídas</button>
    </div>
    {cargando ? <p aria-busy="true">Cargando notificaciones…</p> : error ?
      <div role="alert"><p>No se pudieron cargar las notificaciones.</p><button onClick={() => void cargar()}>Reintentar</button></div> :
      datos?.content.length === 0 ? <p>Aún no hay notificaciones.</p> :
      <ul className="notificaciones-lista">{datos?.content.map(n => <li key={n.id} className={n.leidaAt ? "" : "sin-leer"}>
        <div><strong>{n.titulo}</strong><time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleString("es-CO")}</time></div>
        <p>{n.mensaje}</p>
        <div className="notificaciones-actions">
          {!n.leidaAt && <button onClick={() => void leer(n.id)}>Marcar como leída</button>}
          {n.reservaId && <Link to={`/dashboard/turnos?reserva=${encodeURIComponent(n.reservaId)}`}>{n.tipo === "payment" ? "Ver pago" : "Ver reserva"}</Link>}
        </div>
      </li>)}</ul>}
    {!!datos?.totalPages && datos.totalPages > 1 && <nav aria-label="Páginas de notificaciones" className="notificaciones-actions">
      <button disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>Anterior</button>
      <span>Página {pagina + 1} de {datos.totalPages}</span>
      <button disabled={pagina + 1 >= datos.totalPages} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
    </nav>}
  </section>;
}
