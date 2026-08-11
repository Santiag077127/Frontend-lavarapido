 1# Lava Rápido Admin — Contexto técnico v2

> Documento de transferencia de contexto generado desde el estado real del repositorio `lava-rapido-admin` el 2026-07-29. Los bloques de código transcritos se copiaron literalmente de los archivos indicados. El backend consultado fue `C:\Users\Perdo\Downloads\lavadero-app\backend`.

---

## 1. Descripción general

Panel administrativo web de Lava Rápido Vehicular. Stack actual:

| Área | Tecnología / configuración actual |
|---|---|
| Framework | React `^19.0.0` + TypeScript `~5.6.0` |
| Build/dev server | Vite `^6.0.0` (instalado: Vite 6.4.2) |
| Enrutamiento | `react-router-dom` `^7.1.0` |
| Estado | Zustand `^5.0.0` |
| HTTP | Axios `^1.7.0` |
| Mapa | Leaflet `^1.9.4` + React Leaflet `^5.0.0` |
| Alias | `@` apunta a `./src` en `vite.config.ts` y `tsconfig.app.json` |
| Puerto frontend | `5173`, con `strictPort: true` |
| URL API frontend | `VITE_API_URL` o, como fallback, `http://localhost:8081/api` |
| Puerto backend disponible | `8080` por `server.port: ${SERVER_PORT:8080}` |

Hay una discrepancia de puertos: el frontend usa `8081` por defecto, mientras que el `application.yml` del backend disponible usa `8080` por defecto. Debe resolverse con `VITE_API_URL` o configurando `SERVER_PORT`.

Estado Git al generar este documento:

- Rama activa: `HU-11-dev`.
- Cambios sin commit: `src/features/dashboard/components/Sidebar/index.tsx`, `src/features/dashboard/types/index.ts`, `src/router/AppRouter.tsx`; nuevos sin seguimiento: `pages/MarcasPage/`, `pages/VehiculosPage/`, `services/marcaService.ts`, `services/vehiculoService.ts`.
- Últimos commits visibles:

```text
d5ec80f Merge pull request #10 from Santiag077127/HU-10-dev
806d83e feat: agrega recuperar contraseña (forgot/reset password) y ajustes en LoginForm y Landing
ac34e0d Merge pull request #9 from Santiag077127/HU-10-dev
e41eff0 fix(auth): align register payload with backend camelCase DTO and fix post-register redirect
4473855 Merge pull request #8 from Santiag077127/HU-09-dev
```

Nota de compilación: `npm run build` falla antes de compilar la app porque `tsconfig.app.json` contiene `"ignoreDeprecations": "6.0"` y el TypeScript instalado es 5.6.3. `node_modules\.bin\vite.cmd build` sí completó correctamente después de añadir `MarcasPage.css`.

## 2. Árbol de carpetas actualizado

```text
src/
├── assets/
│   └── images/
│       └── Logo.png
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   └── LoginForm/
│   │   │       ├── LoginForm.tsx
│   │   │       └── style.css
│   │   ├── pages/
│   │   │   ├── ForgotPasswordPage/
│   │   │   │   ├── ForgotPasswordPage.css
│   │   │   │   └── ForgotPasswordPage.tsx
│   │   │   ├── LandingPage/
│   │   │   │   ├── Landing.tsx
│   │   │   │   └── LandingPage.css
│   │   │   ├── LoginPage/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── style.css
│   │   │   ├── RegisterPage/
│   │   │   │   ├── RegisterPage.css
│   │   │   │   └── RegisterPage.tsx
│   │   │   └── ResetPasswordPage/
│   │   │       ├── ResetPasswordPage.css
│   │   │       └── ResetPasswordPage.tsx
│   │   ├── services/
│   │   │   └── authService.ts
│   │   └── types/
│   │       └── index.ts
│   └── dashboard/
│       ├── components/
│       │   ├── ConfirmModal/
│       │   │   ├── ConfirmModal.css
│       │   │   └── ConfirmModal.tsx
│       │   ├── LogoutModal/
│       │   │   ├── index.tsx
│       │   │   └── LogoutModal.css
│       │   ├── OperadorModal/
│       │   │   ├── OperadorModal.css
│       │   │   └── OperadorModal.tsx
│       │   ├── ServicioModal/
│       │   │   ├── index.tsx
│       │   │   └── ServicioModal.css
│       │   ├── ServiciosTable/
│       │   │   ├── index.tsx
│       │   │   └── ServiciosTable.css
│       │   ├── Sidebar/
│       │   │   ├── index.tsx
│       │   │   └── Sidebar.css
│       │   └── TurnoDetailModal/
│       │       ├── TurnoDetailModal.css
│       │       └── TurnoDetailModal.tsx
│       ├── data/
│       │   └── locations.ts
│       ├── pages/
│       │   ├── DashboardPage/
│       │   │   ├── DashboardPage.css
│       │   │   └── index.tsx
│       │   ├── MapsPage/
│       │   │   ├── MapsPage.css
│       │   │   └── MapsPage.tsx
│       │   ├── MarcasPage/
│       │   │   ├── index.tsx
│       │   │   └── MarcasPage.css
│       │   ├── OperadoresPage/
│       │   │   ├── OperadoresPage.css
│       │   │   └── OperadoresPage.tsx
│       │   ├── PanelPrincipalPage/
│       │   │   ├── index.tsx
│       │   │   └── PanelPrincipalPage.css
│       │   ├── ServiciosPage/
│       │   │   ├── index.tsx
│       │   │   └── ServiciosPage.css
│       │   ├── TurnosPage/
│       │   │   ├── TurnosPage.css
│       │   │   └── TurnosPage.tsx
│       │   └── VehiculosPage/
│       │       ├── index.tsx
│       │       └── VehiculosPage.css
│       ├── services/
│       │   ├── marcaService.ts
│       │   ├── reservaService.ts
│       │   ├── servicioService.ts
│       │   └── vehiculoService.ts
│       └── types/
│           └── index.ts
├── router/
│   └── AppRouter.tsx
├── services/
│   └── api.ts
├── store/
│   └── authStore.ts
├── styles/
│   ├── global.css
│   └── variables.css
├── theme/
│   └── theme.tsx
├── index.css
├── main.tsx
└── vite-env.d.ts
```

No existen directorios separados `vehiculos/types/` ni `marcas/types/`: los tipos de ambos módulos viven en `src/features/dashboard/types/index.ts`.

## 3. Rutas (`AppRouter.tsx`)

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage }          from "../features/auth/pages/LoginPage/LoginPage";
import { RegisterPage }       from "../features/auth/pages/RegisterPage/RegisterPage"; // â† nuevo
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage/ForgotPasswordPage"; // â† nuevo
import { ResetPasswordPage }  from "../features/auth/pages/ResetPasswordPage/ResetPasswordPage";   // â† nuevo
import { DashboardPage }      from "../features/dashboard/pages/DashboardPage";
import { ServiciosPage }      from "../features/dashboard/pages/ServiciosPage";
import { PanelPrincipalPage } from "../features/dashboard/pages/PanelPrincipalPage";
import LandingPage            from "../features/auth/pages/LandingPage/Landing";
import { MapsPage } from "@/features/dashboard/pages/MapsPage/MapsPage";
import { OperadoresPage } from "@/features/dashboard/pages/OperadoresPage/OperadoresPage";
import { TurnosPage } from "@/features/dashboard/pages/TurnosPage/TurnosPage";
import { VehiculosPage } from "@/features/dashboard/pages/VehiculosPage";
import { MarcasPage } from "@/features/dashboard/pages/MarcasPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />        {/* â† nuevo */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />  {/* â† nuevo */}
        <Route path="/reset-password"  element={<ResetPasswordPage />} />   {/* â† nuevo */}

        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index          element={<Navigate to="panel" replace />} />
          <Route path="panel"     element={<PanelPrincipalPage />} />
          <Route path="servicios" element={<ServiciosPage />} />
          <Route path="turnos" element={<TurnosPage />} />
          <Route path="vehiculos" element={<VehiculosPage />} />
          <Route path="marcas" element={<MarcasPage />} />
          <Route path="maps" element={<MapsPage />} />
          <Route path="operadores" element={<OperadoresPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
```

## 4. Sidebar

Ítems de navegación, en este orden actual:

| Orden | Texto | Ruta / acción |
|---:|---|---|
| 1 | Inicio | `/dashboard/panel` |
| 2 | Servicios | `/dashboard/servicios` |
| 3 | Vehículos | `/dashboard/vehiculos` |
| 4 | Marcas | `/dashboard/marcas` |
| 5 | Mapa | `/dashboard/maps` |
| 6 | Operadores | `/dashboard/operadores` |
| 7 | Turnos | `/dashboard/turnos` |
| 8 | Cerrar sesión | Abre `LogoutModal`; al confirmar limpia Zustand/localStorage y navega a `/` |

## 5. Paleta de colores y namespaces CSS

Variables reales de `src/styles/variables.css`:

```css
:root {
  --azul-oscuro:  #0d1b3e;
  --azul-medio:   #1a3a6e;
  --azul-claro:   #1e90ff;
  --gris-fondo:   #f4f7fb;
  --gris-borde:   #dde4ef;
  --texto-oscuro: #0d1b3e;
  --texto-gris:   #4a5568;
  --error-bg:     #fff0f0;
  --error-texto:  #c0392b;
  --error-borde:  #f5c6cb;
  --radio:        12px;
  --transicion:   0.25s ease;
}
```

| Componente / módulo | Namespace o clases principales |
|---|---|
| LoginForm | `lf-` |
| LoginPage | `lp-` |
| RegisterPage | `rp-` |
| LandingPage | `landing-`, `btn-`, `feature-` |
| DashboardPage | `dashboard-` |
| Panel principal | `panel-`, `stats-`, `stat-`, `turnos-`, `badge` |
| ServiciosPage | `page-servicios`, `page-header`, `page-buscador`, `page-error`, `page-vacio`, `btn-nuevo` |
| ServiciosTable | `tabla-`, `btn-editar`, `btn-eliminar` |
| ServicioModal | `modal-` |
| VehiculosPage | `page-vehiculos`, además usa genéricas `page-header`, `stats-grid`, `stat-*`, `page-filtros`, `tabla`, `badge`, `btn-toggle` |
| MarcasPage | `page-marcas`, además usa las mismas genéricas de VehiculosPage |
| TurnosPage | `gt-` y `badge` |
| TurnoDetailModal | `tdm-` (ver CSS del componente) |
| MapsPage | `maps-` |
| OperadoresPage | `op-` |
| OperadorModal | `om-` |
| LogoutModal | `logout-` |
| ConfirmModal | `confirm-` |
| Sidebar | `sidebar-` |

Atención: VehiculosPage, MarcasPage, ServiciosPage y PanelPrincipalPage reutilizan selectores genéricos como `.page-header`, `.stats-grid`, `.stat-card`, `.badge` o `.tabla`; no están completamente aislados por namespace.

## 6. Páginas implementadas

| Ruta / página | Estado y datos consumidos | Pendiente |
|---|---|---|
| `/` LandingPage | Landing estática. | Ninguna conexión API en la página. |
| `/login` LoginPage | Consume `POST /users/login` por `authService`. Guarda token/usuario mediante Zustand. | Validar que el contrato real del backend siga siendo `/users/login` y retorne `role`. |
| `/register` RegisterPage | Consume `POST /users/register`. | Depende del backend de auth. |
| `/forgot-password` | Consume `POST /auth/forgot-password`. | Requiere backend de recuperación. |
| `/reset-password` | Consume `POST /auth/reset-password`. | Requiere backend de recuperación. |
| `/dashboard/panel` | Cuatro estadísticas y turnos; usa `turnosMock` local. | Conectar reservas/turnos reales. |
| `/dashboard/servicios` | Lista, filtra, crea, actualiza y cambia estado por `servicioService.ts`. | Confirmar endpoints extra y contrato del backend; no hay delete en la UI/servicio actual. |
| `/dashboard/turnos` | `reservaService.ts` es mock en memoria: carga, asigna operador y cancela. | Reemplazar por endpoints de reservas y operadores. |
| `/dashboard/vehiculos` | Usa `getVehiculos()` y `cambiarEstadoVehiculo()`. Presenta total/activos/inactivos, filtro, búsqueda por placa/modelo/marca/propietario y tabla. | El backend disponible no tiene `PATCH /api/vehiculos/{id}/estado` y su DTO no coincide con el tipo frontend. Faltan UI para crear/editar. |
| `/dashboard/marcas` | Usa `getMarcas()` y `cambiarEstadoMarca()`. Presenta total/activas/inactivas, filtro, búsqueda y tabla. | No hay módulo Marca en el backend disponible. Faltan UI para crear/editar y backend completo. |
| `/dashboard/maps` | Leaflet/OpenStreetMap y `data/locations.ts`; ubicaciones hardcodeadas. | Conectar ubicaciones reales si aplica. |
| `/dashboard/operadores` | Operadores mock locales; alta y cambio de estado solo en estado React. | Conectar API. |

## 7. Tipos TypeScript

No existen `vehiculos/types/index.ts`, `marcas/types/index.ts`, ni interfaces llamadas `VehiculoResponse`, `VehiculoRequest`, `MarcaResponse` o `MarcaRequest` en este frontend. El único archivo de tipos de estos módulos es `src/features/dashboard/types/index.ts`; su contenido exacto es:

```ts
export interface Servicio {
  idServicio: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ServicioForm = Pick<
  Servicio,
  "nombre" | "descripcion" | "precio" | "duracionMinutos"
>;

export interface Marca {
  idMarca: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarcaForm {
  nombre: string;
  descripcion?: string;
  estado: boolean;
}

export interface VehiculoPropietario {
  idUsuario: number;
  nombre: string;
  email: string;
  telefono?: string;
}

export interface Vehiculo {
  idVehiculo: number;
  placa: string;
  modelo: string;
  anio: number;
  color: string;
  estado: boolean;
  observaciones?: string;
  marca: Marca;
  propietario?: VehiculoPropietario;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehiculoForm {
  placa: string;
  modelo: string;
  anio: number;
  color: string;
  estado: boolean;
  observaciones?: string;
  idMarca: number;
  idUsuario?: number;
}
```

## 8. Servicios API

### `src/features/dashboard/services/vehiculoService.ts`

```ts
import { api } from "@/services/api";
import type { Vehiculo, VehiculoForm } from "@/features/dashboard/types";

export const getVehiculos = async (): Promise<Vehiculo[]> => {
  const response = await api.get<Vehiculo[]>("/vehiculos");
  return response.data;
};

export const getVehiculoById = async (id: number): Promise<Vehiculo> => {
  const response = await api.get<Vehiculo>(`/vehiculos/${id}`);
  return response.data;
};

export const createVehiculo = async (form: VehiculoForm): Promise<Vehiculo> => {
  const response = await api.post<Vehiculo>("/vehiculos", form);
  return response.data;
};

export const updateVehiculo = async (id: number, form: VehiculoForm): Promise<Vehiculo> => {
  const response = await api.put<Vehiculo>(`/vehiculos/${id}`, form);
  return response.data;
};

export const cambiarEstadoVehiculo = async (id: number, estado: boolean): Promise<Vehiculo> => {
  const response = await api.patch<Vehiculo>(`/vehiculos/${id}/estado`, null, {
    params: { estado },
  });
  return response.data;
};
```

### `src/features/dashboard/services/marcaService.ts`

```ts
import { api } from "@/services/api";
import type { Marca, MarcaForm } from "@/features/dashboard/types";

export const getMarcas = async (): Promise<Marca[]> => {
  const response = await api.get<Marca[]>("/marcas");
  return response.data;
};

export const getMarcaById = async (id: number): Promise<Marca> => {
  const response = await api.get<Marca>(`/marcas/${id}`);
  return response.data;
};

export const createMarca = async (form: MarcaForm): Promise<Marca> => {
  const response = await api.post<Marca>("/marcas", form);
  return response.data;
};

export const updateMarca = async (id: number, form: MarcaForm): Promise<Marca> => {
  const response = await api.put<Marca>(`/marcas/${id}`, form);
  return response.data;
};

export const cambiarEstadoMarca = async (id: number, estado: boolean): Promise<Marca> => {
  const response = await api.patch<Marca>(`/marcas/${id}/estado`, null, {
    params: { estado },
  });
  return response.data;
};
```

Estos servicios no capturan errores: Axios propaga el rechazo y cada página lo maneja con `try/catch`.

## 9. DTOs del backend relevantes

En el backend disponible, los archivos se llaman `VehiculoResponse.java` y `VehiculoRequest.java`, no `*DTO.java`. Su contenido exacto es:

### `backend/src/main/java/com/lavadero/dto/VehiculoResponse.java`

```java
package com.lavadero.dto;

import java.util.UUID;

public record VehiculoResponse(
        UUID idVehiculo,
        String placa,
        String marca,
        UUID usuarioId,
        String usuarioNombre
) {
}
```

### `backend/src/main/java/com/lavadero/dto/VehiculoRequest.java`

```java
package com.lavadero.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record VehiculoRequest(
        @NotBlank @Size(max = 10) String placa,
        @Size(max = 50) String marca,
        @NotNull UUID usuarioId
) {
}
```

No se encontraron `MarcaResponseDTO.java`, `MarcaRequestDTO.java`, `MarcaResponse.java` ni `MarcaRequest.java` en dicho backend. Por tanto, no hay bloques reales que pegar para esos DTOs.

Incompatibilidad actual a resolver antes de una integración real:

| Elemento | Frontend | Backend disponible |
|---|---|---|
| ID de vehículo | `number` | `UUID` |
| Datos de vehículo | placa, modelo, anio, color, estado, observaciones, marca objeto, propietario objeto | placa, marca string, usuarioId/usuarioNombre |
| Marca | recurso independiente con `idMarca` y estado | inexistente |
| Cambio de estado | `PATCH /vehiculos/{id}/estado?estado=...` | inexistente |

## 10. Endpoints del backend

El prefijo del backend disponible es `/api`; por eso el base URL del frontend debe acabar en `/api`.

| Recurso / endpoint | Backend disponible | Frontend lo usa | Rol/restricción verificable |
|---|---|---|---|
| `GET /api/vehiculos` | Implementado | Sí | No hay configuración de seguridad/JWT en el backend disponible para determinar rol. |
| `GET /api/vehiculos/{id}` | Implementado | Servicio disponible; no UI actual | No verificable. |
| `POST /api/vehiculos` | Implementado | Servicio disponible; no UI actual | No verificable. |
| `PUT /api/vehiculos/{id}` | Implementado | Servicio disponible; no UI actual | No verificable. |
| `DELETE /api/vehiculos/{id}` | Implementado | No | No verificable. |
| `PATCH /api/vehiculos/{id}/estado` | Pendiente | Sí, botón de Vehículos lo llama | No existe en `VehiculoController`. |
| `GET/POST/PUT/PATCH /api/marcas...` | Pendiente | Sí | No existe módulo Marca en el backend disponible. |
| `GET /api/servicios` | Implementado | Sí | No verificable. |
| `GET /api/servicios/{id}` | Implementado | No directamente | No verificable. |
| `POST /api/servicios` | Implementado | Sí | No verificable. |
| `PUT /api/servicios/{id}` | Implementado | Sí | No verificable. |
| `DELETE /api/servicios/{id}` | Implementado | No | No verificable. |
| `GET /api/usuarios` | Implementado | No | No verificable. |
| `GET /api/usuarios/{id}` | Implementado | No | No verificable. |
| `POST /api/usuarios` | Implementado | No | No verificable. |
| `PUT /api/usuarios/{id}` | Implementado | No | No verificable. |
| `DELETE /api/usuarios/{id}` | Implementado | No | No verificable. |
| `/users/login`, `/users/register`, `/auth/forgot-password`, `/auth/reset-password` | No están en los controladores del backend disponible | Sí | No verificable en este backend. |
| Reservas, operadores, ubicaciones | Pendientes/no encontrados | Turnos y Operadores usan mocks; Map usa datos locales | No verificable. |

No se debe afirmar que estos endpoints sean ADMIN, USER o públicos: la fuente backend disponible no contiene `SecurityConfig`, filtros JWT ni anotaciones de seguridad. La restricción de rol queda **no verificable** hasta disponer del backend de autenticación que corresponda a este frontend.

## 11. Roles y seguridad

Estado verificable:

- Frontend: `AuthState` declara roles `"ADMIN" | "USER" | "OPERATOR"`; guarda `token` y `user` en `localStorage`.
- `api.ts` adjunta `Authorization: Bearer {token}` a toda ruta que no contenga `/users/login` ni `/users/register`.
- El frontend no implementa `ProtectedRoute` ni una guardia de rutas por rol en `AppRouter.tsx`; navegar directamente a `/dashboard/*` no se bloquea del lado cliente.
- La página de login es la que decide el destino según el rol recibido, pero no se encontró el backend de seguridad correspondiente en el árbol consultado.
- No existen `JwtService`, `JwtAuthenticationFilter`, `SecurityConfig` ni una función `validarPropietario()` en `C:\Users\Perdo\Downloads\lavadero-app\backend`.

Por lo anterior, **no es posible confirmar** que el bypass ADMIN en `validarPropietario()` esté aplicado, ni que el login del backend devuelva el rol correcto. No hay evidencia en los archivos accesibles para afirmarlo.

## 12. Base de datos

DDL disponible relacionado con vehículos, copiado exactamente de `database/01_ddl/03_tables/002_create_vehiculo.sql`:

```sql
CREATE TABLE vehiculo (
    id_vehiculo UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa VARCHAR(10) UNIQUE NOT NULL,
    marca VARCHAR(50),
    fk_id_usuario UUID,
    CONSTRAINT fk_vehiculo_usuario
        FOREIGN KEY (fk_id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
);
```

La tabla de usuario del mismo DDL es:

```sql
CREATE TABLE usuario (
    id_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL
);
```

No hay tabla `marca`, relación vehículo-marca, columna `estado`, `modelo`, `anio`, `color`, `observaciones`, timestamps ni tablas de roles en el DDL disponible. Esto confirma que el modelo nuevo del frontend aún no está respaldado por esa base de datos.

## 13. Funcionalidades pendientes

| Funcionalidad | Estado actual | Trabajo pendiente |
|---|---|---|
| Vehículos: listado y filtros | UI conectada a servicio Axios | Alinear DTOs/tipos e IDs con backend; crear backend para los campos actuales. |
| Vehículos: activar/desactivar | UI implementada | Añadir `PATCH /api/vehiculos/{id}/estado` o adaptar UI al diseño backend. |
| Vehículos: crear/editar | Servicio listo, UI ausente | Crear modal/formulario y validaciones. |
| Marcas | UI + servicio Axios implementados | Crear tabla, DTOs, mapper, repositorio, servicio, controlador y seguridad backend. |
| Marcas: crear/editar | Servicio listo, UI ausente | Crear modal/formulario y endpoints reales. |
| Turnos/reservas | Mock en memoria | Reemplazar `reservaService.ts` por API. |
| Operadores | Mock local | Crear/conectar endpoints y persistir cambios. |
| Panel principal | Mock local | Conectar métricas y turnos reales. |
| Mapa | Datos locales | Fuente real de ubicaciones/GPS si se requiere. |
| Autorización de rutas | Sin guardia frontend | Implementar `ProtectedRoute` y validación ADMIN si el requisito lo exige. |
| Recuperación de contraseña | Frontend implementado | Verificar/implementar endpoints del backend de auth. |
| Build TypeScript | `npm run build` falla por config | Corregir `ignoreDeprecations` para TypeScript 5.6 o actualizar TypeScript de forma compatible. |

## 14. Decisiones técnicas tomadas en esta sesión

- Se corrigieron los imports de `VehiculosPage` y `MarcasPage` en `AppRouter.tsx` para importar los directorios que exponen `index.tsx`, no archivos inexistentes `VehiculosPage/VehiculosPage` y `MarcasPage/MarcasPage`.
- Se añadió `src/features/dashboard/pages/MarcasPage/MarcasPage.css`, porque `MarcasPage/index.tsx` lo importaba y Vite no podía resolverlo. El CSS sigue el mismo patrón visual de `VehiculosPage.css` con raíz `.page-marcas`.
- Vehículos y marcas se integraron como rutas anidadas del dashboard: `/dashboard/vehiculos` y `/dashboard/marcas`.
- Ambos ítems se añadieron al Sidebar antes de Mapa, Operadores y Turnos.
- Los tipos se centralizaron en `src/features/dashboard/types/index.ts`; no se crearon módulos aislados por feature.
- Los servicios de vehículos y marcas se diseñaron con Axios sobre la instancia global `api` y rutas relativas `/vehiculos` y `/marcas`; por ello dependen de que `VITE_API_URL` incluya el prefijo `/api`.
- Las dos páginas se enfocan inicialmente en consulta, filtro/búsqueda y cambio de estado; los servicios contienen create/update, pero todavía no existen formularios o modales en estas páginas.
- Se verificó que Vite construye el bundle tras añadir el CSS de Marcas. La validación TypeScript normal sigue bloqueada por la configuración `ignoreDeprecations`, no por los imports de estas dos páginas.
- No se tomaron decisiones de backend para modificar DTOs o seguridad: el backend disponible es incompatible con el contrato frontend de vehículos y no contiene módulo de marcas ni las clases JWT solicitadas.

---

## Comandos útiles

```powershell
# Desarrollo web
npm.cmd run dev

# Build de Vite sin pasar por el error actual de tsc
node_modules\.bin\vite.cmd build

# Type-check temporal que evita el valor inválido configurado
node_modules\.bin\tsc.cmd --noEmit --ignoreDeprecations 5.0 -p tsconfig.app.json
```
