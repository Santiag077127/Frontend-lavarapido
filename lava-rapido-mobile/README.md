# Lava Rápido Vehicular — Aplicación móvil

Aplicación para Android que permite a clientes consultar servicios de lavado, administrar sus vehículos, crear y consultar reservas y revisar pagos. Los operadores utilizan un flujo de asignaciones y notificaciones. La aplicación consume la API REST del backend; el panel administrativo es otra aplicación del repositorio y gestiona funciones administrativas.

La app móvil presenta la información y recopila acciones del usuario. Las reglas de negocio, la autenticación definitiva, los datos persistidos y la integración con proveedores de pago corresponden al backend y a sus servicios asociados.

## Contenido

- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Módulos funcionales](#módulos-funcionales)
- [Autenticación y seguridad](#autenticación-y-seguridad)
- [Integración con el backend](#integración-con-el-backend)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Variables de entorno](#variables-de-entorno)
- [Mapa y Leaflet](#mapa-y-leaflet)
- [Pruebas automatizadas](#pruebas-automatizadas)
- [Compilación y distribución Android](#compilación-y-distribución-android)
- [Convenciones observadas](#convenciones-observadas)
- [Limitaciones conocidas](#limitaciones-conocidas)

## Tecnologías

Las versiones indicadas son las declaradas en `package.json` (rangos con `^` o `~` se conservan tal como están declarados).

| Tecnología | Versión declarada | Uso en la aplicación |
|---|---:|---|
| React Native | `0.86.3` | Interfaz nativa para Android. |
| Expo | `~57.0.31` | Herramientas y runtime de la aplicación. |
| TypeScript | `~6.0.3` | Tipado y comprobación estática. |
| React | `19.2.3` | Componentes y estado de interfaz. |
| React Navigation | `^6.1.18` (`native`), `^6.11.0` (`native-stack`), `^6.6.1` (`bottom-tabs`), `^6.4.1` (`stack`) | Navegación de pilas y pestañas. |
| Axios | `^1.16.0` | Solicitudes HTTP a la API REST. |
| Expo SecureStore | `~57.0.4` | Persistencia local cifrada de la sesión. |
| React Native WebView | `13.16.1` | Renderizado del mapa Leaflet y del widget web de pago. |
| Leaflet | `1.9.4` | Mapa interactivo; sus recursos se empaquetan en la app. |
| Jest | `~29.7.0` y `jest-expo` `~57.0.6` | Pruebas de componentes y de la integración Expo. |
| React Native Testing Library | `^13.3.3` | Renderizado y pruebas de interacción de componentes. |

También se utilizan Redux Toolkit (`^2.3.0`), AsyncStorage (`2.2.0`), Expo Notifications (`~57.0.24`), `react-i18next` (`^14.1.0`) y otras dependencias declaradas en `package.json`.

## Arquitectura

El código se organiza principalmente por funcionalidad bajo `src/features/`, con pantallas, tipos, servicios y datos propios de cada módulo. Las piezas compartidas se encuentran en `src/components/`, `src/services/`, `src/navigation/`, `src/theme/` y `src/i18n/`.

- `App.tsx` inicializa idioma y sesión, configura proveedores compartidos y monta `AppNavigator`.
- `src/navigation/` contiene la navegación raíz, pestañas de clientes y operadores, y pilas de pantallas.
- Los servicios usan una instancia común de Axios definida en `src/services/api.ts`.
- `src/features/` contiene los flujos funcionales y sus tipos o servicios locales cuando existen.
- Redux Toolkit está instalado y se usa en slices de autenticación y perfil; no todo el estado de la aplicación pasa por Redux. Las pantallas también utilizan estado local de React.
- `src/theme/` define el contexto y los tokens visuales; `src/i18n/` configura traducciones para español, inglés, francés y portugués.

Los errores HTTP se clasifican en `src/services/apiErrors.ts` y las pantallas muestran mensajes de usuario traducidos. La implementación combina servicios compartidos con llamadas directas a `api` en algunas pantallas; no se documenta aquí una capa de dominio uniforme porque el código no la aplica de forma exclusiva.

## Estructura del proyecto

Árbol representativo de las carpetas y archivos principales:

```text
lava-rapido-mobile/
├── scripts/
│   └── generateLeafletResources.mjs
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── notifications/
│   │   └── profile/
│   ├── features/
│   │   ├── auth/
│   │   ├── brands/
│   │   ├── home/
│   │   ├── map/
│   │   ├── notifications/
│   │   ├── operator/
│   │   ├── profile/
│   │   ├── reservations/
│   │   ├── services/
│   │   └── vehicles/
│   ├── i18n/
│   ├── navigation/
│   ├── services/
│   ├── theme/
│   ├── types/
│   └── utils/
├── App.tsx
├── app.config.js
├── app.json
├── eas.json
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

`src/features/` agrupa funcionalidades; `src/services/` contiene clientes y reglas compartidas para API, autenticación, pagos, notificaciones y validaciones; `src/navigation/` declara flujos y tipos de rutas. `src/assets/` contiene imágenes, iconos y recursos visuales. `scripts/` mantiene herramientas de generación de recursos. `app.json`, `app.config.js` y `eas.json` configuran Expo y EAS.

## Módulos funcionales

| Módulo | Propósito e interfaces principales | Integración observada |
|---|---|---|
| Autenticación | Inicio de sesión, registro, recuperación y restablecimiento de contraseña, cambio de contraseña y edición de datos de cuenta. | `authService`, `userService`; rutas bajo `/api/users` y `/api/auth`. |
| Inicio y servicios | Presenta servicios disponibles y detalles. | `/api/servicios`, `/api/servicios/disponibles`, `/api/servicios/buscar` y `/api/users/profile`. |
| Vehículos y marcas | Consulta, creación, actualización y cambio de estado de vehículos; consulta marcas activas. | `/api/vehiculos` y `/api/marcas/activas`. |
| Reservas | Creación, consulta, cancelación y recuperación de estados de pago pendiente. | `/api/reservas` y rutas por identificador o usuario. |
| Pagos | Solicita el flujo de checkout, consulta y verifica el estado de pago de una reserva. | `/api/pagos/reserva/{reservationId}` y `/verificar`; el procesamiento real se realiza en el backend y el proveedor configurado allí. |
| Perfil y servicios | Consulta y actualización de perfil, correo, avatar, preferencias y servicios propios. | `/api/users/me`, `/api/users/profile`, `/api/users/email` y servicios relacionados. |
| Notificaciones | Lista notificaciones, consulta conteos y marca elementos como leídos. También registra o elimina la instalación para entrega push cuando corresponde. | `/api/notificaciones` y rutas asociadas. La entrega y persistencia se gestionan en backend. |
| Operadores | Consulta asignaciones, actualiza su estado y usa perfil y notificaciones de operador. | `/api/asignaciones/mis-asignaciones`, `/api/asignaciones/{id}/estado` y rutas de usuario. |
| Mapa | Muestra ubicaciones, marcadores, selección y centrado. | Leaflet local dentro de WebView y mosaicos HTTPS de OpenStreetMap; no requiere un endpoint de mapas propio. |

Las rutas exactas y los métodos se implementan en los servicios y pantallas indicados. Esta tabla resume las rutas comprobadas en el código móvil; el backend determina autorización, validación y comportamiento final.

## Autenticación y seguridad

1. El inicio de sesión solicita un JWT al endpoint `POST /api/users/login`.
2. `src/features/auth/screens/LoginScreen.tsx` guarda token y rol mediante `saveAuthSession` antes de activar la sesión en memoria.
3. `src/services/authSession.ts` almacena la sesión con Expo SecureStore, valida la expiración `exp` del JWT y elimina entradas inválidas o vencidas.
4. Al iniciar la aplicación, `App.tsx` restaura la sesión y consulta `GET /api/users/me`. Un HTTP 401 invalida y elimina la sesión persistida. Si ocurre un fallo temporal de red, la app conserva una sesión local no vencida y la validación se reintentará en las solicitudes protegidas.
5. `src/services/api.ts` agrega `Authorization: Bearer <token>` a solicitudes protegidas. Las rutas de recuperación de contraseña están excluidas de ese encabezado.
6. Una respuesta HTTP 401 de una solicitud autenticada vigente invalida la sesión y activa el flujo de cierre de sesión. La solicitud de login no invalida una sesión por sí sola.
7. El cierre de sesión borra el token en memoria y solicita eliminar la sesión de SecureStore.
8. `AppNavigator` separa las pantallas públicas de las protegidas. El rol `OPERATOR` usa `OperatorNavigator`; los demás roles reciben el navegador principal. El tipo declarado también incluye `USER` y `ADMIN`.

SecureStore protege el almacenamiento local de la sesión, pero el JWT sigue siendo una credencial bearer. Las variables `EXPO_PUBLIC_*` se incorporan al cliente y no deben contener secretos.

## Integración con el backend

`src/services/apiUrl.ts` valida `EXPO_PUBLIC_API_URL` como origen absoluto. En producción exige HTTPS; HTTP se permite únicamente en desarrollo cuando el host es local o una IPv4 privada. La URL debe ser solo el origen: sin ruta, credenciales, parámetros ni fragmento. El cliente agrega las rutas `/api/...` por separado.

`src/services/api.ts` crea la instancia Axios compartida con encabezado JSON y timeout de 60 segundos para tolerar el arranque en frío del backend. Los interceptores agregan autorización y procesan 401. `src/services/apiErrors.ts` clasifica errores de red, timeout y estados HTTP para que la interfaz pueda responder con mensajes comprensibles.

Principales rutas observadas en los servicios móviles:

| Área | Rutas usadas |
|---|---|
| Cuenta | `/api/users/register`, `/api/users/login`, `/api/users/me`, `/api/users/profile`, `/api/users/password`, `/api/users/email` |
| Recuperación | `/api/auth/forgot-password`, `/api/auth/reset-password` |
| Catálogo | `/api/servicios`, `/api/servicios/disponibles`, `/api/servicios/buscar`, `/api/marcas/activas` |
| Vehículos | `/api/vehiculos/mis-vehiculos`, `/api/vehiculos` y rutas por identificador |
| Reservas | `/api/reservas` y rutas por reserva o usuario |
| Pagos | `/api/pagos/reserva/{reservationId}` y `/api/pagos/reserva/{reservationId}/verificar` |
| Notificaciones | `/api/notificaciones` y rutas de lectura y dispositivos |
| Operaciones | `/api/asignaciones/mis-asignaciones`, `/api/asignaciones/{id}/estado` |
| Calificaciones | `/api/calificaciones` y `/api/calificaciones/reserva/{reservationId}` |

Los contratos y respuestas pueden evolucionar en el backend; confirmar su compatibilidad antes de cambiar el cliente.

## Instalación y ejecución local

### Requisitos

- Node.js y npm instalados. El repositorio no fija una versión mediante `engines`; la versión local auditada para esta documentación fue Node.js `v24.14.0`.
- Android Studio y un emulador Android, o un dispositivo Android para validación nativa.
- Acceso a una instancia de backend accesible desde el emulador o dispositivo.

### Preparar el entorno en PowerShell

Desde la raíz del repositorio:

```powershell
Set-Location .\lava-rapido-mobile
Copy-Item .env.example .env
npm install
```

Edita `.env` y configura `EXPO_PUBLIC_API_URL` con el origen correcto. Para un teléfono físico, el host de desarrollo debe ser alcanzable desde la red del teléfono; para el emulador Android puede usarse `10.0.2.2` para llegar al host local. HTTP local se acepta solo en desarrollo y bajo las condiciones de `apiUrl.ts`.

Inicia el servidor de desarrollo:

```powershell
npm run start
```

El script inicia `expo start`. Abre el proyecto con un cliente Expo compatible con el SDK instalado. Si el conjunto de módulos nativos o la versión del cliente no coincide, usa un development build de EAS en lugar de asumir compatibilidad con Expo Go.

Para iniciar Expo con el destino Android configurado en el equipo:

```powershell
npm run android
```

Este script ejecuta `expo start --android`; no genera por sí mismo una APK.

## Variables de entorno

El archivo `.env.example` existe y contiene ejemplos con dominios reservados `.invalid`. No copies valores sensibles al bundle móvil.

| Variable | Propósito | Requerida | Ejemplo seguro |
|---|---|---:|---|
| `EXPO_PUBLIC_API_URL` | Origen de la API REST, sin `/api` al final. | Sí | `https://api.example.invalid` |
| `EXPO_PUBLIC_PASSWORD_RESET_URL` | URL base HTTPS que debe coincidir con el enlace de restablecimiento esperado por la app. El código valida origen y ruta/token al recibir el deep link. | Para procesar enlaces | `https://app.example.invalid/reset-password` |
| `EXPO_PUBLIC_MAP_TILE_URL` | Plantilla opcional HTTPS para mosaicos del mapa; requiere `{z}`, `{x}` y `{y}`. Si es inválida se usa el valor predeterminado de OpenStreetMap. | No | `https://tiles.example.invalid/{z}/{x}/{y}.png` |
| `EXPO_PUBLIC_MAP_TILE_ATTRIBUTION` | Texto adicional de atribución del proveedor alternativo. No reemplaza la atribución de OpenStreetMap. | No | `Proveedor de mapas` |

Las dos primeras variables aparecen en `.env.example`. Las variables de mapas son opcionales y se leen en `src/features/map/data/mapHtml.ts`. Todas las variables `EXPO_PUBLIC_*` son públicas al compilar la app; no incluir claves privadas, contraseñas, tokens ni credenciales.

## Mapa y Leaflet

- `MapScreen.tsx` renderiza el mapa en `react-native-webview` y conserva tarjetas de ubicaciones, selección, centrado, estados de carga y reintento.
- Leaflet está fijado a `1.9.4` en `package.json`. El JavaScript y CSS se incluyen localmente en `src/features/map/data/leafletResources.ts`; no se cargan desde un CDN.
- Para regenerar el recurso tras una actualización deliberada de Leaflet, ejecuta desde la carpeta móvil:

  ```powershell
  npm run generate:leaflet
  ```

  El generador `scripts/generateLeafletResources.mjs` lee los archivos de `node_modules/leaflet/dist/` y conserva el encabezado de licencia incluido en el JavaScript empaquetado. Revisa el diff generado y la licencia antes de integrar una actualización.

- La capa de datos usa por defecto `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. Los mosaicos son imágenes remotas; Leaflet ejecutable no se descarga durante la ejecución.
- La atribución de OpenStreetMap permanece visible. Un proveedor alternativo debe cumplir los términos y requisitos de atribución de ese proveedor.
- El WebView limita los orígenes de navegación a `about:blank` y `data:`, deshabilita almacenamiento DOM, acceso a archivos, contenido mixto, ventanas múltiples y cookies de terceros.
- Los mensajes entrantes aceptan únicamente `ready`, `error` o `select` con un identificador entero que corresponda a una ubicación disponible. Los datos usados en el HTML o JavaScript se codifican.
- `MapScreen.test.tsx` verifica recursos locales, licencia, ausencia de CDN, configuración del WebView, mensajes, navegación, selección, carga, errores y reintento.

Las pruebas usan un WebView simulado; no sustituyen la verificación de mosaicos y gestos en un dispositivo Android real.

## Pruebas automatizadas

Comandos declarados en `package.json`:

```powershell
npm run typecheck
npm test -- --runInBand
npm run test:ui -- --runInBand
npm run test:ui:coverage
npm run test:ui:coverage -- src/features/map/screens/MapScreen.test.tsx
npx expo install --check
```

- `npm run typecheck` ejecuta `tsc --noEmit`.
- `npm test` ejecuta pruebas de servicios con el runner integrado de Node.js y `--experimental-strip-types`.
- `npm run test:ui` ejecuta Jest con `jest-expo`; `jest.config.js` define explícitamente los patrones de descubrimiento.
- `npm run test:ui:coverage` usa el proveedor `v8` de Jest y limita la cobertura a `src/features/map/`. Excluye el recurso vendor generado `leafletResources.ts`, `dist` y dependencias instaladas. Los informes se guardan en `coverage/map/`, ignorado por Git.
- El comando enfocado mide el mismo módulo ejecutando solo la suite del mapa.
- `npx expo install --check` verifica compatibilidad de dependencias con Expo; requiere acceso al registro de paquetes.

Las pruebas de componentes simulan servicios y WebView donde está indicado. No hay una suite de pruebas E2E ejecutada en un dispositivo físico descrita por esta configuración.

## Compilación y distribución Android

`npm run build` ejecuta:

```powershell
expo export --platform android
```

Este comando exporta y empaqueta los recursos JavaScript de Android en `dist/`. **No genera un APK ni un AAB.**

El proyecto incluye `eas.json` con estos perfiles:

| Perfil | Configuración observada |
|---|---|
| `development` | `developmentClient: true`, distribución interna. |
| `preview` | Distribución interna y `android.buildType: apk`. |
| `production` | `autoIncrement: true`; no especifica `buildType`, por lo que se conserva el formato predeterminado de EAS. |

Con EAS CLI instalado o ejecutado mediante `npx`, los comandos correspondientes son:

```powershell
npx eas-cli build --platform android --profile development
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
```

El perfil `preview` solicita explícitamente una APK para distribución interna. Los builds de producción usan el formato predeterminado de EAS, normalmente AAB para Google Play. La compilación EAS requiere configurar la cuenta y credenciales de firma apropiadas; no se documentan ni se incluyen credenciales aquí.

Después de instalar una build, valida en un dispositivo: inicio de sesión y restauración de sesión, permisos de notificación disponibles, deep links de restablecimiento, navegación según rol, mapa y pagos de prueba controlados. No uses datos ni cobros de producción durante pruebas.

## Convenciones observadas

- Los módulos agrupan pantallas y, cuando corresponde, tipos, datos y servicios locales.
- Las solicitudes HTTP pasan por la instancia compartida `src/services/api.ts` para compartir URL base, timeout e interceptores.
- La interfaz usa mensajes localizados; los idiomas configurados están en `src/i18n/locales/`.
- Hay validaciones reutilizables para correo, contraseñas, horarios de reserva y placas, con pruebas en servicios cuando corresponde.
- Las pantallas de mapa, pago y controles interactivos tienen pruebas enfocadas. Los tests UI y los tests de servicios usan runners distintos, definidos por sus scripts.
- Los archivos de configuración y scripts reflejan las prácticas disponibles; no se documenta una regla de lint porque `package.json` no declara un script de lint.

## Limitaciones conocidas

- La aplicación declara solo Android en `app.json`; no se documenta soporte verificado de iOS.
- El repositorio no fija `engines.node`, por lo que no declara una versión mínima de Node.js.
- Las pruebas Jest de la WebView son simuladas. El mapa requiere validación manual en dispositivo, especialmente con pérdida de conectividad y carga de mosaicos.
- El export de `npm run build` no prueba instalación nativa ni sustituye una build EAS de APK/AAB.
- La cobertura configurada es deliberadamente del módulo de mapas; no representa cobertura total ni cumplimiento integral de pruebas E2E.
- La respuesta y disponibilidad de API, el comportamiento del proveedor de pagos y la entrega efectiva de notificaciones dependen de servicios externos al cliente y deben validarse en entornos controlados.
