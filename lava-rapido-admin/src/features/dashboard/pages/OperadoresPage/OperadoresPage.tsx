import "./OperadoresPage.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { OperadorModal } from "../../components/OperadorModal/OperadorModal";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { cambiarEstadoOperador, crearOperador, desactivarTodosOperadores, listarOperadores, type Operador } from "../../services/operadorService";

const errorMessage = (error: unknown, fallback: string) => axios.isAxiosError(error) ? error.response?.data?.error ?? fallback : fallback;

export const OperadoresPage = () => {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [cambiandoId, setCambiandoId] = useState<string | null>(null);
  const [confirmarDesactivarTodos, setConfirmarDesactivarTodos] = useState(false);
  const [desactivandoTodos, setDesactivandoTodos] = useState(false);

  const cargarOperadores = async () => {
    setCargando(true); setError(null);
    try { setOperadores(await listarOperadores()); }
    catch (e) { setError(errorMessage(e, "No se pudieron cargar los operadores.")); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargarOperadores(); }, []);

  const toggleEstado = async (operador: Operador) => {
    setCambiandoId(operador.idOperador); setError(null);
    try {
      const actualizado = await cambiarEstadoOperador(operador.idOperador, !operador.estado);
      setOperadores(prev => prev.map(op => op.idOperador === operador.idOperador ? actualizado : op));
    } catch (e) { setError(errorMessage(e, "No se pudo cambiar el estado del operador.")); }
    finally { setCambiandoId(null); }
  };

  const handleAgregar = async (nuevo: { email: string; documentNumber: string }) => {
    try { const creado = await crearOperador(nuevo); setOperadores(prev => [creado, ...prev]); }
    catch (e) { throw new Error(errorMessage(e, "No se pudo crear el operador.")); }
    setModalVisible(false);
  };

  const activos = operadores.filter(o => o.estado).length;
  const inactivos = operadores.filter(o => !o.estado).length;

  const desactivarTodos = async () => {
    if (desactivandoTodos) return;
    const activosAntes = activos;
    setDesactivandoTodos(true); setError(null); setExito(null);
    try {
      await desactivarTodosOperadores();
      const actualizados = await listarOperadores();
      setOperadores(actualizados);
      const desactivados = Math.max(0, activosAntes - actualizados.filter(op => op.estado).length);
      setExito(`Se desactivaron ${desactivados} operador${desactivados === 1 ? "" : "es"}.`);
      setConfirmarDesactivarTodos(false);
    } catch (e) { setError(errorMessage(e, "No se pudieron desactivar los operadores.")); }
    finally { setDesactivandoTodos(false); }
  };

  return <div className="op-page">
    <div className="op-header"><div><h2 className="op-titulo">Operadores</h2><p className="op-subtitulo">Gestión del personal de lavado</p></div><div className="op-header__actions"><button className="op-btn-desactivar-todos" onClick={() => setConfirmarDesactivarTodos(true)} disabled={activos === 0 || cargando}>Desactivar todos</button><button className="op-btn-nuevo" onClick={() => setModalVisible(true)}>+ Nuevo operador</button></div></div>
    {error && <p className="page-error">{error}</p>}
    {exito && <p className="op-success">{exito}</p>}
    <div className="op-stats"><div className="op-stat"><p className="op-stat__valor">{operadores.length}</p><p className="op-stat__label">Total</p></div><div className="op-stat op-stat--activo"><p className="op-stat__valor">{activos}</p><p className="op-stat__label">Activos</p></div><div className="op-stat op-stat--inactivo"><p className="op-stat__valor">{inactivos}</p><p className="op-stat__label">Inactivos</p></div></div>
    <div className="op-tabla-wrapper"><table className="op-tabla"><thead><tr>{["#", "Nombre", "Apellidos", "Correo", "Creado", "Estado", "Acciones"].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>
      {cargando ? <tr><td colSpan={7} className="op-col-dato">Cargando operadores...</td></tr> : operadores.length === 0 ? <tr><td colSpan={7} className="op-col-dato">No hay operadores registrados.</td></tr> : operadores.map((op, i) => <tr key={op.idOperador}><td className="op-col-num">{i + 1}</td><td className="op-col-nombre">{op.nombre}</td><td className="op-col-dato">{op.apellidos}</td><td className="op-col-dato">{op.email}</td><td className="op-col-dato">{op.createdAt ? new Date(op.createdAt).toLocaleDateString("es-CO") : "—"}</td><td><span className={`op-badge ${op.estado ? "op-badge--activo" : "op-badge--inactivo"}`}>{op.estado ? "Activo" : "Inactivo"}</span></td><td><button className={`op-btn-toggle ${op.estado ? "op-btn-toggle--desactivar" : "op-btn-toggle--activar"}`} onClick={() => toggleEstado(op)} disabled={cambiandoId === op.idOperador}>{cambiandoId === op.idOperador ? "Guardando..." : op.estado ? "Desactivar" : "Activar"}</button></td></tr>)}
    </tbody></table></div>
    {modalVisible && <OperadorModal onGuardar={handleAgregar} onCancelar={() => setModalVisible(false)} />}
    {confirmarDesactivarTodos && <ConfirmModal titulo="Desactivar todos los operadores" mensaje="¿Seguro que querés desactivar a todos los operadores activos?" textoConfirmar={desactivandoTodos ? "Desactivando..." : "Sí, desactivar"} textoVolver="Cancelar" onConfirmar={desactivarTodos} onCancelar={() => !desactivandoTodos && setConfirmarDesactivarTodos(false)} />}
  </div>;
};
