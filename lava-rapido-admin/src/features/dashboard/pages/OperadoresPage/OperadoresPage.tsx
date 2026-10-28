// Lista operadores y permite crearlos o cambiar su estado.
import "./OperadoresPage.css";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ThemeContext, formatTranslation, localizeMessage, useLocale, useTranslations } from "@/theme/theme";
import { OperadorModal } from "../../components/OperadorModal/OperadorModal";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { cambiarEstadoOperador, crearOperador, desactivarTodosOperadores, listarOperadores, type Operador } from "../../services/operadorService";

const errorMessage = (error: unknown, fallback: string) => axios.isAxiosError(error) && error.response?.status === 403 ? "ui.no.tienes.permiso.para.realizar.esta.accion" : fallback;
const MAX_OPERATORS = 15;

export const OperadoresPage = () => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
  const locale = useLocale();
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<number | null>(null);
  const [cambiandoId, setCambiandoId] = useState<string | null>(null);
  const [confirmarDesactivarTodos, setConfirmarDesactivarTodos] = useState(false);
  const [desactivandoTodos, setDesactivandoTodos] = useState(false);
  const [conteoDisponible, setConteoDisponible] = useState(false);
  const [verificandoCupo, setVerificandoCupo] = useState(false);
  const creandoOperador = useRef(false);

  const cargarOperadores = async () => {
    setCargando(true); setError(null); setConteoDisponible(false);
    try { setOperadores(await listarOperadores()); setConteoDisponible(true); }
    catch (e) { setError(errorMessage(e, "ui.no.se.pudieron.cargar.los.operadores")); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargarOperadores(); }, []);

  const toggleEstado = async (operador: Operador) => {
    setCambiandoId(operador.idOperador); setError(null);
    try {
      const actualizado = await cambiarEstadoOperador(operador.idOperador, !operador.estado);
      setOperadores(prev => prev.map(op => op.idOperador === operador.idOperador ? actualizado : op));
    } catch (e) { setError(errorMessage(e, "ui.no.se.pudo.cambiar.el.estado.del.operador")); }
    finally { setCambiandoId(null); }
  };

  // Convierte en operador una cuenta ya registrada, identificada por correo y documento.
  const handleAgregar = async (nuevo: { email: string; documentNumber: string }) => {
    if (creandoOperador.current) return;
    creandoOperador.current = true;
    setVerificandoCupo(true); setConteoDisponible(false); setError(null);
    try {
      let actuales: Operador[];
      try {
        actuales = await listarOperadores();
      } catch (e) {
        setError(errorMessage(e, "operators.countLoadError"));
        throw new Error("operators.countLoadError");
      }
      setOperadores(actuales);
      setConteoDisponible(true);
      if (actuales.length >= MAX_OPERATORS) {
        setError("operators.limitReached");
        throw new Error("operators.limitReached");
      }

      try {
        const creado = await crearOperador(nuevo);
        setOperadores([creado, ...actuales]);
      } catch (e) {
        throw new Error(errorMessage(e, "ui.no.se.pudo.crear.el.operador"));
      }
      setModalVisible(false);
    } finally {
      creandoOperador.current = false;
      setVerificandoCupo(false);
    }
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
      setExito(desactivados);
      setConfirmarDesactivarTodos(false);
    } catch (e) { setError(errorMessage(e, "ui.no.se.pudieron.desactivar.los.operadores")); }
    finally { setDesactivandoTodos(false); }
  };

  return <div className="op-page">
    <div className="op-header"><div><h2 className="op-titulo">{t("operators.title")}</h2><p className="op-subtitulo">{t("operators.subtitle")}</p></div><div className="op-header__actions"><button className="op-btn-desactivar-todos" onClick={() => setConfirmarDesactivarTodos(true)} disabled={activos === 0 || cargando}>{t("operators.disableAll")}</button><button className="op-btn-nuevo" onClick={() => setModalVisible(true)} disabled={!conteoDisponible || cargando || operadores.length >= MAX_OPERATORS}>+ {t("operators.new")}</button></div></div>
    <div className="op-capacity" aria-live="polite">
      <div className="op-capacity__summary"><p className="op-capacity__count">{conteoDisponible
        ? formatTranslation(t("operators.count"), { count: operadores.length, max: MAX_OPERATORS })
        : t("operators.countUnavailable")}</p>
      {conteoDisponible && operadores.length >= MAX_OPERATORS && <p className="op-capacity__limit" role="status">{t("operators.limitReached")}</p>}
      </div>
    </div>
    {error && <p className="page-error">{localizeMessage(error, t)}</p>}
    {exito !== null && <p className="op-success">{formatTranslation(t(exito === 1 ? "operators.deactivatedOne" : "operators.deactivatedMany"), { count: exito })}</p>}
    <div className="op-stats"><div className="op-stat"><p className="op-stat__valor">{operadores.length}</p><p className="op-stat__label">{t("common.total")}</p></div><div className="op-stat op-stat--activo"><p className="op-stat__valor">{activos}</p><p className="op-stat__label">{t("common.activePlural")}</p></div><div className="op-stat op-stat--inactivo"><p className="op-stat__valor">{inactivos}</p><p className="op-stat__label">{t("common.inactivePlural")}</p></div></div>
    <div className="op-tabla-wrapper"><table className="op-tabla"><thead><tr>{["#", t("common.name"), t("common.lastName"), t("common.email"), t("common.created"), t("common.status"), t("common.actions")].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>
      {cargando ? <tr><td colSpan={7} className="op-col-dato">{t("operators.loading")}</td></tr> : operadores.length === 0 ? <tr><td colSpan={7} className="op-col-dato">{t("operators.empty")}</td></tr> : operadores.map((op, i) => <tr key={op.idOperador}><td className="op-col-num">{i + 1}</td><td className="op-col-nombre">{op.nombre}</td><td className="op-col-dato">{op.apellidos}</td><td className="op-col-dato">{op.email}</td><td className="op-col-dato">{op.createdAt ? new Date(op.createdAt).toLocaleDateString(locale) : "—"}</td><td><span className={`op-badge ${op.estado ? "op-badge--activo" : "op-badge--inactivo"}`}>{op.estado ? t("common.active") : t("common.inactive")}</span></td><td><button className={`op-btn-toggle ${op.estado ? "op-btn-toggle--desactivar" : "op-btn-toggle--activar"}`} onClick={() => toggleEstado(op)} disabled={cambiandoId === op.idOperador}>{cambiandoId === op.idOperador ? t("profile.saving") : op.estado ? t("common.deactivate") : t("common.activate")}</button></td></tr>)}
    </tbody></table></div>
    {modalVisible && <OperadorModal onGuardar={handleAgregar} onCancelar={() => setModalVisible(false)} canSubmit={conteoDisponible && !verificandoCupo && operadores.length < MAX_OPERATORS} />}
    {confirmarDesactivarTodos && <ConfirmModal titulo={t("ui.desactivar.todos.los.operadores")} mensaje={t("ui.seguro.que.queres.desactivar.a.todos.los.operadores.activos")} textoConfirmar={desactivandoTodos ? t("ui.desactivando") : t("ui.si.desactivar")} textoVolver={t("common.cancel")} onConfirmar={desactivarTodos} onCancelar={() => !desactivandoTodos && setConfirmarDesactivarTodos(false)} />}
  </div>;
};
