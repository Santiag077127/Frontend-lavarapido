# Panel administrativo web — Lava Rápido Vehicular

Aplicación web para personal con rol `ADMIN`. Permite consultar la operación del lavadero y gestionar servicios, marcas, vehículos, operadores, turnos, perfil y pagos asociados a reservas. Comparte el backend del proyecto con la aplicación móvil, pero es una aplicación independiente: no contiene servidor ni base de datos propios. Las reglas de negocio, la autenticación y la autorización definitiva pertenecen al backend. Este README describe el código presente en `lava-rapido-admin`; no garantiza el estado de un despliegue externo.

## Contenido

- [Tecnologías](#tecnologías)
- [Arquitectura y carpetas](#arquitectura-y-carpetas)
- [Módulos](#módulos)
- [Autenticación y seguridad](#autenticación-y-seguridad)
- [Rutas](#rutas)
- [Integración con el backend](#integración-con-el-backend)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Interfaz e internacionalización](#interfaz-e-internacionalización)
- [Pruebas](#pruebas)
- [Compilación y despliegue](#compilación-y-despliegue)
- [Convenciones](#convenciones)
- [Estado y pendientes](#estado-y-pendientes)

## Tecnologías

Versiones **declaradas** en [`package.json`](package.json); `^` y `~` expresan rangos, no la versión exacta instalada.

| Tecnología | Versión declarada | Uso |
| --- | --- | --- |
| React / React DOM | `^19.0.0` | Componentes y renderizado web |
| TypeScript | `~5.6.0` | Tipos y comprobación estática |
| Vite | `^6.0.0` | Servidor de desarrollo y empaquetado |
| React Router DOM | `^7.1.0` | Rutas y navegación |
| Axios | `^1.7.0` | Cliente HTTP e interceptores |
| Zustand | `^5.0.0` | Estado de autenticación |
| Leaflet / React Leaflet | `^1.9.4` / `^5.0.0` | Mapa de sedes |
| Lucide React | `^1.31.0` | Iconos |
| Vitest | `^5.0.1` | Pruebas automatizadas |
| Testing Library React / jest-dom | `^16.3.3` / `^7.0.1` | Pruebas de componentes y aserciones DOM |
| jsdom | `^29.1.1` | Entorno DOM para Vitest |

No se declara una biblioteca independiente de formularios ni una biblioteca externa de internacionalización. Los formularios usan estado y validaciones de componentes React; las traducciones están en [`src/theme/`](src/theme/).

## Arquitectura y carpetas

El código se agrupa principalmente por funcionalidad (`auth` y `dashboard`), con rutas, cliente HTTP, estado y tema compartidos. [`src/main.tsx`](src/main.tsx) monta `ThemeProvider` y `AppRouter`; [`DashboardPage`](src/features/dashboard/pages/DashboardPage/index.tsx) aporta la barra lateral y el `Outlet` de las páginas privadas. Los servicios de cada funcionalidad llaman a la instancia Axios común; las páginas mantienen estados de carga, error y formularios. No hay una capa de API propia del navegador distinta del backend.

```text
lava-rapido-admin/
├── public/                    Archivos públicos
├── src/
│   ├── assets/                Imágenes y avatares
│   ├── features/
│   │   ├── auth/              Páginas, formulario y servicio de autenticación
│   │   └── dashboard/
│   │       ├── components/    Barra lateral, tablas, modales y cobro
│   │       ├── data/          Datos de sedes del mapa
│   │       ├── hooks/         Carga del widget de Wompi
│   │       ├── pages/         Vistas administrativas
│   │       ├── services/      Operaciones HTTP por dominio
│   │       └── types/         Tipos compartidos del panel
│   ├── router/                Rutas, guardia ADMIN y navegación por errores
│   ├── services/              Axios y destino posterior al login
│   ├── store/                 Sesión con Zustand
│   ├── styles/                Variables y estilos globales
│   ├── test/                  Configuración común de pruebas
│   ├── theme/                 Tema y traducciones
│   └── main.tsx               Entrada de React
├── .env.example               Ejemplo local de URL de API
├── index.html                 Entrada HTML
├── package.json               Dependencias y comandos
├── vite.config.ts             Vite, alias y proxy local
├── vitest.config.ts           Vitest y jsdom
├── tsconfig.app.json          Configuración TypeScript de la aplicación
└── README.md
```

La distribución anterior refleja directorios del repositorio; `node_modules/` y `dist/` son generados y están excluidos.

## Módulos

| Área | Pantalla o componente | Función implementada | Servicio o fuente |
| --- | --- | --- | --- |
| Acceso | [`LoginForm`](src/features/auth/components/LoginForm/LoginForm.tsx), páginas de registro y recuperación | Iniciar sesión, registrar cuenta, solicitar y completar restablecimiento de contraseña | [`authService`](src/features/auth/services/authService.ts) |
| Resumen | [`PanelPrincipalPage`](src/features/dashboard/pages/PanelPrincipalPage/index.tsx) | Indicadores y turnos calculados a partir de reservas recibidas | [`reservaService`](src/features/dashboard/services/reservaService.ts) |
| Servicios | [`ServiciosPage`](src/features/dashboard/pages/ServiciosPage/index.tsx), `ServiciosTable`, `ServicioModal` | Listar, buscar, crear, editar y cambiar estado | [`servicioService`](src/features/dashboard/services/servicioService.ts) |
| Marcas | [`MarcasPage`](src/features/dashboard/pages/MarcasPage/index.tsx) | Listar, buscar, crear y editar; incluye validación del formulario | [`marcaService`](src/features/dashboard/services/marcaService.ts) |
| Vehículos | [`VehiculosPage`](src/features/dashboard/pages/VehiculosPage/index.tsx) | Consultar y filtrar vehículos; la vista usa la consulta general | [`vehiculoService`](src/features/dashboard/services/vehiculoService.ts) |
| Operadores | [`OperadoresPage`](src/features/dashboard/pages/OperadoresPage/OperadoresPage.tsx), `OperadorModal` | Listar, crear, activar/desactivar y desactivar todos | [`operadorService`](src/features/dashboard/services/operadorService.ts) |
| Turnos y reservas | [`TurnosPage`](src/features/dashboard/pages/TurnosPage/TurnosPage.tsx), `TurnoDetailModal` | Consultar, filtrar, registrar reserva presencial, cambiar estado, cancelar y asignar operador | `reservaService`, `operadorService`, `vehiculoService`, `servicioService` |
| Pagos de reservas | [`CobrarReservaButton`](src/features/dashboard/components/CobrarReservaButton/CobrarReservaButton.tsx), [`PagoResultadoPage`](src/features/dashboard/pages/PagoResultadoPage/PagoResultadoPage.tsx) | Iniciar el widget Wompi, consultar/verificar/reconciliar estado y mostrar intentos | [`pagoService`](src/features/dashboard/services/pagoService.ts), [`useWompiWidget`](src/features/dashboard/hooks/useWompiWidget.ts) |
| Mapa | [`MapsPage`](src/features/dashboard/pages/MapsPage/MapsPage.tsx) | Mostrar sedes y seleccionar marcador | [`locations`](src/features/dashboard/data/locations.ts), Leaflet, teselas OpenStreetMap |
| Cuenta | [`PerfilPage`](src/features/dashboard/pages/PerfilPage/index.tsx), `ChangePasswordPage`, `ChangeEmailPage` | Consultar/editar perfil y cambiar contraseña o correo | [`userService`](src/features/dashboard/services/userService.ts) |
| Preferencias | [`ConfiguracionPage`](src/features/dashboard/pages/ConfiguracionPage/ConfiguracionPage.tsx) | Tema, idioma y cierre de sesión | `ThemeContext`, `authStore` |

El panel no contiene una página funcional de reportes ni un centro de notificaciones: `/dashboard/notificaciones` redirige a `/dashboard/panel`. El mapa usa sedes definidas en código; no consulta un servicio de sedes. La aplicación móvil tiene su propio código e interfaz; esta tabla no describe sus funcionalidades.

## Autenticación y seguridad

1. [`LoginForm`](src/features/auth/components/LoginForm/LoginForm.tsx) envía credenciales a `POST /users/login` mediante `authService`. El backend devuelve token y usuario. El formulario guarda la sesión en [`authStore`](src/store/authStore.ts).
2. El token y el usuario se mantienen en `sessionStorage` de la pestaña; Zustand expone el estado a los componentes. No se debe considerar `sessionStorage` un almacén seguro frente a scripts que se ejecuten en el mismo origen. Su sustitución o endurecimiento forma parte del riesgo pendiente asociado a H-27, no de HU-70.
3. Todas las rutas administrativas de [`AppRouter`](src/router/AppRouter.tsx), incluida `/pagos/resultado`, pasan por [`RequireAdmin`](src/router/RequireAdmin.tsx). La guardia consulta `GET /users/me` y solo muestra el `Outlet` tras confirmar `role === "ADMIN"`; el rol almacenado en el navegador no basta. Mientras comprueba, presenta un estado de verificación. Si la consulta falla por red, ofrece reintento.
4. Tras un login no ADMIN se abre [`AccessDeniedPage`](src/router/AccessDeniedPage.tsx), con explicación y botón de cierre de sesión. Un visitante sin sesión que abre esa URL vuelve a login. La navegación usa reemplazo de historial en las redirecciones de acceso.
5. [`api.ts`](src/services/api.ts) adjunta `Authorization: Bearer` a solicitudes protegidas. Ante 401 de una de ellas borra la sesión y dirige a login; el 401 del login no borra otra sesión. Ante 403 conserva la sesión y dirige a acceso denegado. [`AuthNavigation`](src/router/AuthNavigation.tsx) escucha estos eventos.
6. El cierre de sesión elimina token y usuario de `sessionStorage` mediante `authStore.logout()`. La configuración vuelve al inicio; la pantalla de acceso denegado lleva a login.

La guardia controla la visualización y la navegación del frontend. Cada endpoint debe aplicar sus permisos en el backend; ocultar botones o rutas en React no protege una API. Las pruebas de HU-70 cubren acceso directo, 401/403, cambio de token, ausencia de contenido privado durante la verificación y cierre de sesión, pero no reemplazan pruebas con cuentas reales contra un entorno controlado.

## Rutas

Fuente: [`src/router/AppRouter.tsx`](src/router/AppRouter.tsx). `/dashboard` redirige a `/dashboard/panel`.

| Ruta | Vista o destino | Acceso | Rol |
| --- | --- | --- | --- |
| `/` | Página inicial | Público | — |
| `/login` | Inicio de sesión | Público | — |
| `/register` | Registro | Público | — |
| `/forgot-password` | Solicitud de restablecimiento | Público | — |
| `/reset-password` | Restablecimiento | Público; requiere los datos del enlace para completar la acción | — |
| `/access-denied` | Explicación de falta de permisos | Sesión activa; sin sesión redirige a login | No concede acceso |
| `/dashboard`, `/dashboard/panel` | Panel y resumen | JWT validado mediante `/users/me` | ADMIN |
| `/dashboard/servicios` | Servicios | Protegido | ADMIN |
| `/dashboard/turnos` | Turnos y reservas | Protegido | ADMIN |
| `/dashboard/vehiculos` | Vehículos | Protegido | ADMIN |
| `/dashboard/marcas` | Marcas | Protegido | ADMIN |
| `/dashboard/maps` | Mapa | Protegido | ADMIN |
| `/dashboard/operadores` | Operadores | Protegido | ADMIN |
| `/dashboard/perfil` | Perfil | Protegido | ADMIN |
| `/dashboard/configuracion` | Preferencias y salida | Protegido | ADMIN |
| `/dashboard/cambiar-contrasena` | Cambio de contraseña | Protegido | ADMIN |
| `/dashboard/cambiar-correo` | Cambio de correo | Protegido | ADMIN |
| `/dashboard/notificaciones` | Redirección a `/dashboard/panel`; sin módulo propio | Protegido | ADMIN |
| `/pagos/resultado` | Retorno y consulta de pago | Protegido | ADMIN |

## Integración con el backend

[`src/services/api.ts`](src/services/api.ts) crea la instancia Axios. `VITE_API_URL` define la base; si falta, usa `http://localhost:8081/api`. En desarrollo, con esa URL local, Vite reenvía `/api` a `http://127.0.0.1:8081`, según [`vite.config.ts`](vite.config.ts). Si se configura otra URL, el navegador llamará directamente a ese origen y el backend deberá permitir el origen web según corresponda. No se debe poner un secreto en una variable `VITE_*`: su valor queda incluido en los archivos del navegador.

Los servicios confirman, entre otros, estos contratos de llamada desde el panel:

| Servicio | Rutas utilizadas |
| --- | --- |
| `authService` | `/users/login`, `/users/register`, `/auth/forgot-password`, `/auth/reset-password` |
| `userService` | `/users/profile`, `/users/password`, `/users/email` |
| `servicioService` | `/servicios`, `/servicios/disponibles`, `/servicios/buscar`, `/servicios/{id}/estado` |
| `marcaService` y `vehiculoService` | `/marcas`, `/marcas/buscar`, `/vehiculos` |
| `operadorService` | `/operadores`, `/operadores/{id}/estado`, `/operadores/desactivar-todos`, `/asignaciones` |
| `reservaService` | `/reservas`, `/reservas/{id}/estado`, `/reservas/{id}/cancelar` |
| `pagoService` | `/pagos/reserva/{id}`, `/pagos/reserva/{id}/reconciliar`, `/pagos/reserva/{id}/verificar` |

Los métodos, parámetros y tipos concretos están en los archivos enlazados en [Módulos](#módulos). El widget Wompi carga un script HTTPS desde el proveedor cuando se usa el componente de cobro; el backend prepara referencia y firma y determina el estado confirmado. El mapa descarga teselas HTTPS de OpenStreetMap. Ambas integraciones necesitan red; las pruebas locales con simulaciones no demuestran un cobro real.

## Instalación local

Instale Node.js con npm en Windows y compruebe `node --version` y `npm.cmd --version`. Este repositorio no declara una versión mínima de Node.js. En PowerShell, desde la raíz del repositorio:

```powershell
cd C:\Frontend-lavarapido\lava-rapido-admin
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

`npm.cmd ci` usa el [archivo de dependencias fijadas](package-lock.json). El ejemplo apunta a un backend local en el puerto 8081. Verifique que ese backend esté disponible antes de probar funciones que consumen la API; la página inicial puede cargar sin él. Abra `http://localhost:5173` en el navegador. Vite tiene `strictPort: true`: si 5173 está ocupado, libérelo o ajuste el entorno antes de arrancar. Para detener el servidor, pulse `Ctrl+C`; para reiniciarlo, ejecute otra vez `npm.cmd run dev`.

Para una API remota de desarrollo, cambie **solo** `VITE_API_URL` en su `.env.local` a una base HTTPS terminada en `/api` y configure el origen web permitido en el backend. No use credenciales productivas para pruebas. En PowerShell se usa `npm.cmd` porque algunas políticas de ejecución impiden cargar `npm.ps1`; no hace falta cambiar la política del sistema.

## Variables de entorno

Fuente: [`.env.example`](.env.example), [`api.ts`](src/services/api.ts) y [`vite.config.ts`](vite.config.ts).

| Variable | Uso | Desarrollo | Build de producción | Ejemplo seguro |
| --- | --- | --- | --- | --- |
| `VITE_API_URL` | URL base de la API, visible en el navegador | Opcional: existe el valor local por defecto | Obligatoria; URL pública HTTPS con ruta exacta `/api`, sin usuario, contraseña, query ni fragmento | `https://api.example.invalid/api` |

`.env.example` contiene una URL local sin credenciales. `.env.local` está ignorado por Git. No se identificaron otras variables de entorno usadas por el código del panel o su configuración de Vite. `import.meta.env.DEV` es una marca suministrada por Vite, no una credencial configurable.

## Interfaz e internacionalización

Los estilos se reparten entre CSS de páginas/componentes y [`src/styles/`](src/styles/) para variables y reglas globales. [`ThemeProvider`](src/theme/theme.tsx) permite modo claro u oscuro e idiomas español, inglés, francés y portugués; guarda preferencias de tema e idioma en `localStorage`. [`Sidebar`](src/features/dashboard/components/Sidebar/index.tsx) conserva su estado colapsado allí. Las traducciones están en `src/theme/`, sin una biblioteca i18n adicional.

Hay componentes reutilizables como `Sidebar`, `ConfirmModal`, `LogoutModal`, `ServicioModal` y `TurnoDetailModal`. Los formularios incluyen validaciones concretas, estados de carga y mensajes de error; algunas vistas ofrecen reintento. Se observan etiquetas, roles ARIA y estilos adaptativos en partes de la interfaz. Esto no equivale a una auditoría integral de accesibilidad ni a validar todos los tamaños de pantalla y navegadores.

## Pruebas

[`vitest.config.ts`](vitest.config.ts) usa `jsdom`, el alias `@` para `src/` y [`src/test/setup.ts`](src/test/setup.ts), que incorpora `jest-dom` y limpia DOM y almacenamiento entre pruebas. Las pruebas `*.test.ts(x)` están junto a módulos y en `src/router/`, `src/services/` y `src/theme/`. Hay casos de servicios, formularios, páginas, pagos, traducciones, rutas, autorización y respuestas 401/403. [`RequireAdmin.test.tsx`](src/router/RequireAdmin.test.tsx) y [`AdminLoginAccess.test.tsx`](src/features/auth/AdminLoginAccess.test.tsx) cubren HU-70/H-12.

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd test -- src/router/RequireAdmin.test.tsx src/features/auth/AdminLoginAccess.test.tsx
```

`npm.cmd test` ejecuta `vitest run`. No hay script de cobertura ni de pruebas de navegador E2E declarado en `package.json`; la existencia de pruebas unitarias y de componentes no implica cobertura total. Para comprobar cambios de formato antes de entregar, ejecute `git diff --check` desde el repositorio.

## Compilación y despliegue

El build exige `VITE_API_URL` en modo producción y [`vite.config.ts`](vite.config.ts) valida HTTPS y la ruta `/api`. Configure la URL pública **del entorno de destino**, sin credenciales:

```powershell
$env:VITE_API_URL = "https://api.example.invalid/api"
npm.cmd run build
npm.cmd run preview
```

`npm.cmd run build` ejecuta `tsc -b && vite build` y genera archivos estáticos en `dist/`; `preview` sirve localmente ese resultado. La URL ficticia del ejemplo solo permite demostrar la configuración: sustitúyala para un despliegue real. Antes de publicar, ejecute `typecheck`, pruebas y build; verifique la URL efectiva de la API, login ADMIN, rechazo de cuentas no ADMIN, navegación directa y retorno de pagos en un entorno controlado.

No hay configuración versionada de proveedor de alojamiento, comandos de publicación ni regla de fallback SPA en este directorio. Quien hospede `dist/` debe servir `index.html` para rutas del cliente como `/dashboard/turnos` sin convertirlas en 404, y configurar HTTPS y acceso al backend. No se afirma una plataforma de despliegue concreta.

## Convenciones

- Componentes `.tsx` con nombres `PascalCase`; tipos y contratos cerca de los servicios o en `features/dashboard/types/`.
- Servicios por dominio bajo `features/*/services/`, reutilizando `api` para autenticación y errores HTTP.
- Rutas declaradas centralmente en `AppRouter` y protección agrupada con `RequireAdmin`.
- CSS global para reglas compartidas y CSS de componente o página para la interfaz local.
- Pruebas `*.test.ts` o `*.test.tsx` cercanas a la funcionalidad; comandos definidos en `package.json`.
- Los formularios validan en el navegador para orientar al usuario; el backend sigue validando y autorizando.

## Estado y pendientes

| Estado | Alcance |
| --- | --- |
| Implementado | Rutas privadas con verificación `/users/me`, acceso denegado y salida para no ADMIN (HU-70/H-12); vistas y servicios enumerados arriba; pruebas de componentes y build. |
| Parcial | Cobertura automatizada de los flujos administrativos: hay pruebas de varios módulos, pero no una medición de cobertura o suite E2E completa declarada. Accesibilidad y comportamiento responsive requieren comprobación integral. |
| Pendiente | Validar con cuentas ADMIN y no ADMIN y backend controlado después del despliegue; revisar el riesgo del JWT en `sessionStorage` (H-27); definir/documentar configuración real de hosting y fallback SPA si se adopta. |

La advertencia de Vite sobre un paquete JavaScript de más de 500 kB se observó en un build local de HU-70; no impidió compilar. Documentar estos puntos no cambia su estado técnico ni cierra otros hallazgos.
