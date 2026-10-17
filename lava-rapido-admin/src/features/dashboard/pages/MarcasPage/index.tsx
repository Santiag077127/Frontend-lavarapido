// Lista y filtra marcas y permite registrar nuevas marcas.
import { useContext, useEffect, useMemo, useState, type FormEvent } from "react";
import { getMarcas, createMarca, updateMarca } from "@/features/dashboard/services/marcaService";
import { ThemeContext, localizeMessage, useTranslations } from "@/theme/theme";
import type { Marca } from "@/features/dashboard/types";
import "./MarcasPage.css";

const limpiarNombre = (valor: string) => valor.trim().replace(/\s+/g, " ");
// Compara nombres sin acentos ni mayúsculas para detectar duplicados visibles.
const compararNombre = (valor: string) => limpiarNombre(valor)
  .normalize("NFD")
  .replace(/\p{M}/gu, "")
  .toLocaleLowerCase("es");
const NOMBRE_VALIDO = /^[\p{L}\p{N} .&'-]+$/u;

export const MarcasPage = () => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marcaEditando, setMarcaEditando] = useState<Marca | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [nombreNueva, setNombreNueva] = useState("");
  const [nombreTocado, setNombreTocado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargarMarcas = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await getMarcas();
      setMarcas(data);
    } catch {
      setError("ui.no.se.pudieron.cargar.las.marcas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMarcas();
  }, []);

  const marcasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return marcas.filter((marca) => {
      const coincideBusqueda =
        texto === "" || marca.nombre.toLowerCase().includes(texto);

      return coincideBusqueda;
    });
  }, [marcas, busqueda]);

  const stats = useMemo(() => ({
    total: marcas.length,
  }), [marcas]);

  const nombreLimpio = limpiarNombre(nombreNueva);
  const nombreDuplicado = marcas.some((marca) => marca.idMarca !== marcaEditando?.idMarca && compararNombre(marca.nombre) === compararNombre(nombreLimpio));
  const nombreError = !nombreLimpio
    ? "ui.escribe.un.nombre.de.marca"
    : !NOMBRE_VALIDO.test(nombreLimpio)
      ? "ui.usa.letras.numeros.espacios.punto.guion.apostrofo.o"
    : nombreLimpio.length > 30
      ? "ui.el.nombre.no.puede.superar.los.30.caracteres"
      : nombreDuplicado
        ? "ui.ya.existe.una.marca.con.ese.nombre"
        : null;
  const nombresSimilares = nombreLimpio.length >= 2
    ? marcas.filter((marca) => compararNombre(marca.nombre).includes(compararNombre(nombreLimpio))).slice(0, 5)
    : [];

  const handleCrear = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nombre = limpiarNombre(nombreNueva);
    if (!nombre || nombreError) {
      setError(nombreError || "ui.escribe.un.nombre.de.marca");
      return;
    }
    try {
      setGuardando(true);
      setError(null);
      setMensaje(null);
      if (marcaEditando) await updateMarca(marcaEditando.idMarca, { nombre });
      else await createMarca({ nombre });
      setNombreNueva("");
      setMarcaEditando(null);
      setNombreTocado(false);
      setFormAbierto(false);
      setMensaje(marcaEditando ? "brands.updated" : "ui.marca.creada.correctamente");
      await cargarMarcas();
    } catch (error) {
      setError(marcaEditando ? "brands.saveFailed" : "ui.no.se.pudo.crear.la.marca");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page-marcas">
      <div className="page-header">
        <div>
          <h1>{t("brands.title")}</h1>
          <p>{t("brands.subtitle")}</p>
        </div>
        <button className="marca-btn-nueva" type="button" onClick={() => { setError(null); setMensaje(null); setNombreTocado(false); setMarcaEditando(null); setNombreNueva(""); setFormAbierto(true); }}>{t("ui.nueva.marca")}</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat--azul">
          <p className="stat-card__valor">{stats.total}</p>
          <p className="stat-card__label">{t("common.total")}</p>
        </div>
      </div>

      <div className="page-filtros">
        <input
          className="page-buscador"
          type="text"
          placeholder={t("common.searchByName")}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="page-error">{localizeMessage(error, t)}</p>}
      {mensaje && <p className="page-exito" role="status">{localizeMessage(mensaje, t)}</p>}

      {formAbierto && (
        <div className="marca-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !guardando) setFormAbierto(false); }}>
          <form className="marca-modal" role="dialog" aria-modal="true" aria-labelledby="marca-modal-titulo" onSubmit={handleCrear}>
            <h2 id="marca-modal-titulo">{marcaEditando ? t("common.edit") : t("ui.nueva.marca.2")}</h2>
            <label htmlFor="marca-nombre">{t("ui.nombre.de.la.marca")}</label>
            <input id="marca-nombre" autoFocus maxLength={30} required value={nombreNueva} onChange={(event) => { setNombreNueva(event.target.value); setNombreTocado(true); setError(null); }} onBlur={() => setNombreTocado(true)} className={nombreTocado && nombreNueva ? nombreError ? "marca-input--error" : "marca-input--valid" : ""} placeholder={t("form.brandExample")} aria-invalid={nombreTocado && Boolean(nombreError)} aria-describedby={nombreTocado && nombreError ? "marca-nombre-ayuda marca-nombre-error" : "marca-nombre-ayuda"} />
            <p id="marca-nombre-ayuda" className="marca-modal-ayuda">{t("ui.se.permiten.nombres.como.mercedes.benz.bmw.o.land.rover")}</p>
            {nombresSimilares.length > 0 && <p className="marca-modal-similares">{t("ui.coincidencias.existentes") + " "}{nombresSimilares.map((marca) => marca.nombre).join(", ")}</p>}
            {nombreTocado && nombreError && <p className="page-error" id="marca-nombre-error" role="alert">{localizeMessage(nombreError, t)}</p>}
            {error && <p className="page-error" role="alert">{localizeMessage(error, t)}</p>}
            <div className="marca-modal-acciones">
              <button type="button" onClick={() => setFormAbierto(false)} disabled={guardando}>{t("common.cancel")}</button>
              <button type="submit" disabled={guardando || !nombreLimpio || Boolean(nombreError)}>{guardando ? t("profile.saving") : marcaEditando ? t("common.save") : t("ui.crear.marca")}</button>
            </div>
          </form>
        </div>
      )}

      {cargando ? (
        <p>{t("brands.loading")}</p>
      ) : marcasFiltradas.length === 0 ? (
        <p className="page-vacio">{t("brands.empty")}</p>
      ) : (
        <div className="tabla-wrapper">
          <table className="tabla">
            <thead>
              <tr>
                <th>{t("common.name")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {marcasFiltradas.map((marca) => (
                <tr key={marca.idMarca}>
                  <td>{marca.nombre}</td>
                  <td><button className="marca-btn-editar" type="button" onClick={() => { setMarcaEditando(marca); setNombreNueva(marca.nombre); setNombreTocado(false); setError(null); setMensaje(null); setFormAbierto(true); }}>{t("common.edit")}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
