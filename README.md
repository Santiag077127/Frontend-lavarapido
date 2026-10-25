# Lava Rápido Vehicular — aplicaciones frontend

Lava Rápido Vehicular permite a clientes consultar servicios de lavado, registrar vehículos, reservar turnos y revisar pagos. Los operadores atienden asignaciones; el personal administrador gestiona la operación desde un panel web.

Este repositorio contiene dos aplicaciones frontend independientes. Ambas consumen la API REST del backend, que valida las reglas de negocio, autentica a los usuarios, autoriza las operaciones y persiste los datos. La implementación del backend y su base de datos no están en este repositorio.

## Contenido

- [Aplicaciones](#aplicaciones)
- [Tecnologías](#tecnologías)
- [Arquitectura y estructura](#arquitectura-y-estructura)
- [Funcionalidades](#funcionalidades)
- [Autenticación y seguridad](#autenticación-y-seguridad)
- [Configuración e instalación](#configuración-e-instalación)
- [Variables de entorno](#variables-de-entorno)
- [Pruebas](#pruebas)
- [Compilación y distribución](#compilación-y-distribución)
- [Mapa móvil](#mapa-móvil)
- [Mejoras recientes y estado de hallazgos](#mejoras-recientes-y-estado-de-hallazgos)
- [Optimización de imágenes HU-71](#optimización-de-imágenes-hu-71)
- [Limitaciones pendientes](#limitaciones-pendientes)
- [Documentación complementaria](#documentación-complementaria)

## Aplicaciones

| Aplicación | Tecnología principal declarada | Usuarios | Propósito |
| --- | --- | --- | --- |
| [Aplicación móvil](lava-rapido-mobile/) | React Native, Expo y TypeScript | Clientes y operadores | Consultar catálogo, gestionar vehículos y reservas, seguir pagos, recibir notificaciones internas y atender asignaciones de operador. |
| [Panel administrativo](lava-rapido-admin/) | React, Vite y TypeScript | Administradores con rol `ADMIN` | Supervisar turnos y pagos, y gestionar servicios, marcas, vehículos, operadores y perfil. |

Los roles de aplicación incluyen `USER`, `OPERATOR` y `ADMIN`. La navegación móvil dirige a los operadores a su flujo específico; el panel web restringe sus rutas administrativas al rol `ADMIN`. La API y el backend son la autoridad final para permisos.

## Tecnologías

Las versiones son las declaradas en los `package.json`; `^` y `~` indican rangos y no una versión exacta de instalación.

| Aplicación | Tecnología | Versión declarada | Uso |
| --- | --- | --- | --- |
| Móvil | React Native | `0.86.3` | Interfaz Android |
| Móvil | Expo | `~57.0.31` | Herramientas y runtime |
| Móvil | React / TypeScript | `19.2.3` / `~6.0.3` | Interfaz y tipado |
| Móvil | React Navigation | `^6.1.18` a `^6.11.0` según paquete | Navegación por pilas y pestañas |
| Móvil | Axios | `^1.16.0` | Solicitudes HTTP |
| Móvil | Expo SecureStore | `~57.0.4` | Persistencia local de la sesión |
| Móvil | React Native WebView | `13.16.1` | Mapa Leaflet y widget web de pago |
| Móvil | Leaflet | `1.9.4` | Mapa con recursos JavaScript y CSS empaquetados |
| Móvil | Jest / jest-expo | `~29.7.0` / `~57.0.6` | Pruebas de interfaz |
| Móvil | React Native Testing Library | `^13.3.3` | Pruebas de componentes |
| Administrativo | React / React DOM | `^19.0.0` | Interfaz web |
| Administrativo | TypeScript | `~5.6.0` | Tipado |
| Administrativo | Vite | `^6.0.0` | Desarrollo y empaquetado web |
| Administrativo | React Router DOM | `^7.1.0` | Rutas |
| Administrativo | Axios | `^1.7.0` | Cliente HTTP e interceptores |
| Administrativo | Zustand | `^5.0.0` | Estado de autenticación |
| Administrativo | Vitest / jsdom | `^5.0.1` / `^29.1.1` | Pruebas de componentes y servicios |
| Administrativo | Leaflet / React Leaflet | `^1.9.4` / `^5.0.0` | Mapa de sedes |
| Administrativo | Lucide React | `^1.31.0` | Iconos |

El móvil también utiliza Redux Toolkit, AsyncStorage, Expo Notifications, Expo SecureStore, i18next y Expo Linear Gradient. Sus versiones exactas declaradas están en [lava-rapido-mobile/package.json](lava-rapido-mobile/package.json). El panel utiliza Testing Library y CSS propio para su interfaz; no declara una biblioteca de formularios ni una biblioteca i18n independiente.

## Arquitectura y estructura

El repositorio reúne dos proyectos con dependencias, comandos y ciclos de compilación separados. El código de cada aplicación se organiza principalmente por funcionalidades. Sus servicios HTTP usan Axios para comunicarse con el backend; los componentes presentan estados y acciones de usuario. No se atribuye al repositorio un patrón arquitectónico formal que el código no implemente de forma uniforme.

```text
Frontend-lavarapido/
├── lava-rapido-mobile/
│   ├── scripts/                 Generación de recursos locales de Leaflet
│   ├── src/
│   │   ├── assets/              Fotografías, logotipos y avatares
│   │   ├── components/          Componentes compartidos
│   │   ├── features/            auth, home, map, notifications, operator,
│   │   │                        profile, reservations, services, vehicles
│   │   ├── i18n/                Idiomas y textos localizados
│   │   ├── navigation/          Navegación y rutas tipadas
│   │   ├── services/            API, sesión, pagos y validaciones
│   │   └── theme/               Tema y estilos compartidos
│   ├── App.tsx
│   ├── app.json / app.config.js
│   ├── eas.json
│   └── README.md
├── lava-rapido-admin/
│   ├── src/
│   │   ├── features/auth/       Acceso, registro y recuperación
│   │   ├── features/dashboard/  Páginas, componentes y servicios del panel
│   │   ├── router/              Rutas y protección ADMIN
│   │   ├── services/            Cliente Axios y redirección de acceso
│   │   ├── store/               Sesión Zustand
│   │   ├── styles/              CSS compartido
│   │   └── theme/               Tema y traducciones
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── README.md
└── README.md
```

El mapa de ambas aplicaciones usa Leaflet, pero sus implementaciones son distintas. El móvil lo renderiza dentro de WebView con recursos locales; el panel lo muestra con React Leaflet. Para el detalle de cada proyecto, consulta [README móvil](lava-rapido-mobile/README.md) y [README administrativo](lava-rapido-admin/README.md).

## Funcionalidades

| Área | Aplicación móvil | Panel administrativo |
| --- | --- | --- |
| Acceso y cuenta | Login, registro, recuperación, cambio de contraseña, perfil y cambio de correo | Login, registro, recuperación, perfil y gestión de credenciales |
| Catálogo | Consulta de servicios y detalles, con imágenes locales | Alta, edición, búsqueda y cambio de estado de servicios y marcas |
| Vehículos | Consulta, registro y gestión de vehículos propios | Consulta de vehículos |
| Reservas y turnos | Crear y consultar reservas, cancelar y consultar su estado | Consultar y filtrar turnos, crear reservas presenciales, cambiar estados y asignar operadores |
| Pagos | Iniciar flujo de checkout y consultar el estado | Iniciar o consultar flujos asociados a reservas; las acciones de reconciliación están disponibles para ADMIN |
| Operadores | Navegación de operador para asignaciones y notificaciones | Crear, listar, activar/desactivar operadores y gestionar asignaciones |
| Notificaciones | Centro de notificaciones internas; existen flujos de registro de dispositivo para push sujetos al backend/configuración | No hay centro de notificaciones implementado; `/dashboard/notificaciones` redirige al panel principal |
| Mapa | Ubicaciones, marcadores, selección y recentrado | Mapa de sedes definido con ubicaciones locales |
| Resumen | Inicio con servicios y reservas del cliente | Indicadores y resumen de reservas |

El móvil y el panel no contienen la lógica de persistencia de la base de datos. En pagos, la app prepara el checkout y muestra resultados; el backend y Wompi determinan el estado confirmado. Las pruebas locales simuladas no certifican cobros reales.

## Autenticación y seguridad

### Aplicación móvil

- El login obtiene un JWT de la API. `src/services/authSession.ts` guarda token y rol en Expo SecureStore, valida la expiración del JWT y elimina sesiones inválidas o vencidas.
- Al iniciar, la app restaura la sesión y consulta el usuario al backend. Axios adjunta el token a rutas protegidas; un 401 invalida la sesión. Los fallos temporales de red se manejan de forma distinta a una sesión vencida.
- La navegación separa los flujos públicos, de cliente y operador según el rol recibido y validado en la aplicación.

### Panel administrativo

- [`RequireAdmin`](lava-rapido-admin/src/router/RequireAdmin.tsx) consulta `GET /users/me` y no muestra rutas privadas hasta que el backend confirma `role === "ADMIN"`. El rol guardado en el navegador no es suficiente.
- Un 401 de una solicitud protegida cierra la sesión y conduce a login. Un 403 conserva la sesión y conduce a acceso denegado. La persona no ADMIN recibe una explicación y puede cerrar sesión.
- El JWT del panel se guarda en `sessionStorage`. Ese almacenamiento no protege el token frente a scripts ejecutados en el mismo origen; es un riesgo pendiente asociado a H-27.

En ambas aplicaciones, la protección de pantalla no sustituye la autorización del backend. Las variables `EXPO_PUBLIC_*` y `VITE_*` se incorporan al código del cliente y no deben contener secretos.

## Configuración e instalación

No se declara una versión mínima de Node.js en `engines`. Instala una versión compatible con las dependencias y Expo SDK del proyecto.

### Móvil (PowerShell)

```powershell
Set-Location .\lava-rapido-mobile
Copy-Item .env.example .env
npm ci
npm run start
```

Configura las variables de [`.env.example`](lava-rapido-mobile/.env.example) antes de usar funciones que necesiten API o enlaces de recuperación. Para iniciar Expo con Android en el equipo, el script existente es `npm run android`. En un dispositivo físico, el backend debe ser accesible desde su red.

### Panel administrativo (PowerShell)

```powershell
Set-Location .\lava-rapido-admin
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Vite sirve el panel en `http://localhost:5173`. En PowerShell se usa `npm.cmd` para evitar restricciones locales que bloquean `npm.ps1`; no es necesario cambiar la política del sistema. El ejemplo configura un backend local en el puerto 8081.

## Variables de entorno

Valores de ejemplo ficticios. No leer ni copiar valores de archivos `.env` locales.

| Aplicación | Variable | Uso | Requisito | Ejemplo seguro |
| --- | --- | --- | --- | --- |
| Móvil | `EXPO_PUBLIC_API_URL` | Origen de la API; las rutas `/api` se agregan por separado | Requerida | `https://api.example.invalid` |
| Móvil | `EXPO_PUBLIC_PASSWORD_RESET_URL` | URL HTTPS del enlace de restablecimiento | Requerida para configurar esos enlaces | `https://app.example.invalid/reset-password` |
| Móvil | `EXPO_PUBLIC_MAP_TILE_URL` | Plantilla opcional HTTPS de teselas con `{z}`, `{x}`, `{y}` | Opcional; hay plantilla por defecto | `https://tiles.example.invalid/{z}/{x}/{y}.png` |
| Móvil | `EXPO_PUBLIC_MAP_TILE_ATTRIBUTION` | Atribución adicional de otro proveedor de teselas | Opcional | `Proveedor de mapas` |
| Móvil | `GOOGLE_MAPS_ANDROID_API_KEY` | Configuración opcional de `react-native-maps` en `app.config.js` | Solo si se configura Google Maps para Android | Configurar fuera del código y restringir por aplicación |
| Administrativo | `VITE_API_URL` | URL base de API, con ruta `/api` | Opcional en desarrollo local; obligatoria en build de producción | `https://api.example.invalid/api` |

En producción, Vite exige para `VITE_API_URL` una URL HTTPS pública con ruta exacta `/api`, sin credenciales, query ni fragmento. En desarrollo móvil, el código permite HTTP únicamente para hosts locales o privados bajo sus validaciones. Nunca pongas contraseñas, tokens o claves privadas en variables visibles al cliente.

## Pruebas

Ejecuta desde el directorio de cada aplicación. Estos comandos están declarados en sus respectivos `package.json`.

### Móvil

```powershell
npm run typecheck
npm test
npm run test:ui -- --runInBand
npm run test:ui:coverage
npm run test:ui:coverage -- src/features/map/screens/MapScreen.test.tsx
npx expo install --check
```

`npm test` ejecuta las pruebas de servicios con el runner de Node.js. `test:ui` usa Jest y `jest-expo`. La cobertura configurada se limita al módulo de mapas y excluye el recurso generado `leafletResources.ts`; no representa cobertura completa del móvil. Las pruebas de WebView simulan su entorno y no son pruebas E2E en un dispositivo.

### Panel administrativo

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd test -- src/router/RequireAdmin.test.tsx src/features/auth/AdminLoginAccess.test.tsx
```

Vitest ejecuta pruebas de servicios, pantallas, autenticación y autorización. Ninguno de estos comandos constituye una suite E2E global contra los servicios desplegados.

## Compilación y distribución

### Móvil

`npm run build` ejecuta `expo export --platform android` y genera un export JavaScript en `dist/`; **no genera una APK ni un AAB**. [`eas.json`](lava-rapido-mobile/eas.json) define perfiles `development`, `preview` y `production`. El perfil `preview` solicita explícitamente APK para distribución interna; producción no fija `buildType`.

```powershell
npm run build
npx eas-cli build --platform android --profile development
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
```

Los builds EAS requieren cuenta y credenciales de firma. Valida instalación, enlaces, notificaciones, mapa y flujos de pago controlados en un dispositivo; el export no sustituye esa comprobación.

### Panel administrativo

```powershell
$env:VITE_API_URL = "https://api.example.invalid/api"
npm.cmd run build
npm.cmd run preview
```

Vite ejecuta `tsc -b && vite build` y genera archivos estáticos en `dist/`. `preview` sirve el resultado localmente. Este repositorio no confirma una plataforma de alojamiento ni una configuración de publicación. El hosting elegido debe proporcionar HTTPS, acceso a la API y fallback de `index.html` para las rutas SPA.

## Mapa móvil

El móvil usa Leaflet `1.9.4`, empaquetado localmente en [`leafletResources.ts`](lava-rapido-mobile/src/features/map/data/leafletResources.ts). No descarga JavaScript ejecutable desde CDN. El WebView restringe navegación y acceso a archivos; las teselas usan HTTPS y mantienen atribución visible de OpenStreetMap. El generador está disponible con `npm run generate:leaflet` desde el directorio móvil. La prueba UI simula WebView; la interacción, conectividad y teselas requieren comprobación en Android físico.


## Documentación complementaria

- [README de la aplicación móvil](lava-rapido-mobile/README.md)
- [README del panel administrativo](lava-rapido-admin/README.md)
- [Configuración de compilación EAS](lava-rapido-mobile/eas.json)
- [Configuración Expo](lava-rapido-mobile/app.json)
- [Configuración Vite del panel](lava-rapido-admin/vite.config.ts)
