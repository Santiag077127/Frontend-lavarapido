# Estado de la integración Wompi del frontend

Actualización realizada el 2026-09-21 sobre el frontend React + Vite. La implementación consume el contrato vigente del backend y deja la confirmación financiera exclusivamente en `GET /api/pagos/reserva/{idReserva}`. No se hicieron cobros reales ni pruebas contra Wompi sandbox.

## Cambios realizados

- Se actualizaron los modelos de inicio, pago lógico e intentos. Se eliminaron `metodoPagoPermitido`, `referenciaPago` y `estadoWompi` de los contratos del frontend.
- El Widget se configura únicamente con `moneda`, `montoEnCentavos`, `referencia`, `publicKey`, `firmaIntegridad` y `redirectUrl` recibidos del backend. No se envía `paymentMethod` ni una lista local de métodos.
- El script `https://checkout.wompi.co/widget.js` se comparte entre componentes, detecta carga/error y permite reintentar sin duplicar etiquetas.
- Se bloquean dobles envíos y Widgets simultáneos. Los intentos reutilizados abren la referencia devuelta por el backend.
- Antes de abrir Wompi se guarda en `sessionStorage` solo la asociación `idReserva`/`referencia`, usada exclusivamente para recuperar la consulta después del retorno.
- Se agregó `/pagos/resultado`. El parámetro `id` de Wompi no se interpreta como reserva ni confirma el pago. Si falta contexto, se ofrece volver a reservas.
- El polling es secuencial, cada 4 segundos, durante un máximo de 2 minutos. Cancela timer y petición activa al desmontar o cambiar de reserva. Al agotarse muestra “Pago pendiente de confirmación” y permite consultar otra vez.
- Se soportan pago pendiente, aprobado y rechazado; un rechazo permite iniciar otro intento y una aprobación bloquea nuevos pagos.
- La vista ampliada muestra monto en pesos, referencia, fecha, método abierto, estado financiero e historial de intentos. Valores conocidos se traducen y los desconocidos se muestran como texto válido.
- `aprobado_duplicado` genera una incidencia de posible doble cobro sin prometer reembolso. Una aprobación tardía en reserva cancelada también se presenta como incidencia sin reactivar la reserva.
- El estado financiero se muestra separado del estado operativo; el frontend no cambia una reserva a `ASIGNADA` por aprobarse el pago.
- Para ADMIN se agregó “Verificar con Wompi” solo cuando existe un intento pendiente con `wompiTransactionId`. Después del POST de reconciliación se ejecuta de nuevo el GET.
- Se añadieron mensajes seguros para 401, 403, 404, 409, 422, 500 y 502. Un 409 al iniciar provoca una sola actualización del pago y no repite el POST.
- Al expirar la sesión se conserva una ruta interna validada para retomar la pantalla después del login.

## Archivos relevantes

- `src/features/dashboard/services/pagoService.ts`: contrato y rutas autenticadas.
- `src/features/dashboard/hooks/useWompiWidget.ts`: carga del SDK, configuración y exclusión de flujos simultáneos.
- `src/features/dashboard/services/pagoContext.ts`: contexto mínimo de retorno.
- `src/features/dashboard/components/CobrarReservaButton/`: flujo, estados, polling, historial, incidencias y reconciliación.
- `src/features/dashboard/pages/PagoResultadoPage/`: pantalla de retorno.
- `src/router/AppRouter.tsx`: ruta `/pagos/resultado`.
- `src/services/api.ts`, `src/services/authRedirect.ts` y `LoginForm.tsx`: reanudación segura tras un 401.
- `vitest.config.ts` y archivos `*.test.ts(x)`: pruebas locales con mocks.

## Rutas y contrato consumidos

| Método | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/api/pagos/reserva/{idReserva}` | Inicia (`201`) o reutiliza (`200`) un intento, sin body. |
| `GET` | `/api/pagos/reserva/{idReserva}` | Fuente única del estado financiero y del historial. |
| `POST` | `/api/pagos/reserva/{idReserva}/reconciliar` | Verificación manual exclusiva de ADMIN; no crea cobros. |

El frontend no invoca `POST /api/pagos/webhook` ni consulta directamente la API de transacciones de Wompi.

El uso del SDK se contrastó con la documentación oficial vigente: [Widget & Checkout Web](https://docs.wompi.co/docs/colombia/widget-checkout-web/) y [Transacciones](https://docs.wompi.co/docs/colombia/transacciones/). La documentación confirma los parámetros usados, el callback informativo y que la confirmación debe resolverse en backend mediante eventos/consulta segura.

## Verificaciones ejecutadas

| Comando | Resultado real |
| --- | --- |
| `npm.cmd run typecheck` | Correcto, sin errores de TypeScript. |
| `npm.cmd test -- --reporter=dot` | Correcto: 3 archivos, 14 pruebas, 0 fallos. |
| `npm.cmd run build` | Correcto: 1.995 módulos transformados y bundle generado. Vite advirtió que el chunk JS principal supera 500 kB. |

Las pruebas con mocks cubren configuración sin restricción a Nequi, respuestas de inicio 200/201, callback/redirect sin aprobación local, estados pendiente/aprobado/rechazado, reintento, doble envío, fin y limpieza del polling, campos nuevos, `aprobado_duplicado` y reconciliación administrativa.

El proyecto no tiene un script ni una configuración de lint, por lo que no hubo una comprobación de lint disponible para ejecutar.

La instalación de herramientas de prueba agregó 77 paquetes. `npm` informó 11 vulnerabilidades en el árbol completo (1 baja, 2 moderadas y 8 altas); no se ejecutó `npm audit fix` porque puede introducir cambios de dependencias fuera del alcance.

## Prueba manual breve en sandbox

1. Aplicar primero la migración del backend y configurar llaves sandbox coherentes, webhook `transaction.updated` y redirect hacia `http://localhost:5173/pagos/resultado` (o la URL HTTPS del entorno).
2. Iniciar backend y frontend, autenticarse y abrir una reserva `PENDIENTE`.
3. Pulsar “Pagar con Wompi” y comprobar que el Widget ofrece los métodos habilitados en el comercio, sin selección forzada a Nequi.
4. Completar un pago aprobado y uno rechazado. En ambos casos verificar que la pantalla de retorno espera el GET del backend; el rechazo debe permitir “Reintentar pago”.
5. Cerrar el Widget o interrumpir la red y comprobar que no aparece un rechazo artificial. Tras dos minutos debe mostrarse “Pago pendiente de confirmación” con consulta manual.
6. Recargar la ruta de resultado en la misma pestaña y confirmar que recupera la reserva desde el contexto mínimo.
7. Como ADMIN, usar “Verificar con Wompi” sobre un intento pendiente con ID de transacción y comprobar el nuevo GET. Sin ID, la interfaz debe explicar que la verificación automática no está disponible.
8. Revisar en una reserva cancelada con aprobación tardía y en datos con `aprobado_duplicado` que se muestren las incidencias sin cambiar el estado operativo ni prometer reembolso.

## Pendientes externos

- No está confirmada la aplicación de `V20260921_01__wompi_payment_attempts.sql` en una base real. Debe aplicarse y revisarse primero sobre copia/backup.
- Falta validar pagos sandbox aprobados y rechazados con cada método realmente habilitado para el comercio.
- Falta confirmar en el Dashboard de Wompi las URLs HTTPS, el evento `transaction.updated` y la coherencia de llaves/secretos por ambiente.
- Falta probar con una transacción sandbox real el redirect, los reintentos de webhook y la reconciliación por ID.
- Debe definirse el procedimiento humano para posibles cobros duplicados y aprobaciones tardías de reservas canceladas.
