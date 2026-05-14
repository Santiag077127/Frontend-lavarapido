# Errores en LoginPage y LoginForm - Importaciones

## Descripción del Problema

En el proyecto, hay errores de importación en los archivos `LoginForm.tsx` y `LoginPage.tsx` relacionados con las importaciones de módulos y tipos.

### Errores en `LoginForm.tsx`

1. **Importación de `login` desde `authService`**:
   - **Línea**: 7
   - **Código**: `import { login } from "../../services/authService";`
   - **Error**: El módulo `"../../services/authService"` no tiene un miembro exportado llamado `login`.
   - **Causa**: El archivo `authService.ts` no exporta una función llamada `login`. Actualmente, el archivo contiene código relacionado con el store de Zustand en lugar de las funciones de servicio de autenticación.

2. **Importación de `AuthState` desde `authStore`**:
   - **Línea**: 9
   - **Código**: `import type { AuthState } from "../../../../store/authStore";`
   - **Error**: El módulo `"../../../../store/authStore"` declara `AuthState` localmente, pero no lo exporta.
   - **Causa**: En `authStore.ts`, la interfaz `AuthState` está definida pero no tiene la palabra clave `export`, por lo que no se puede importar desde otros archivos.

### Errores en `LoginPage.tsx`

- No se encontraron errores de compilación en `LoginPage.tsx`. Las importaciones parecen correctas.

## Soluciones Propuestas

### Para `authService.ts`
- El archivo `authService.ts` debe contener las funciones de API para autenticación, como `login`, en lugar del código del store.
- Ejemplo de función `login`:
  ```typescript
  export const login = async (email: string, password: string) => {
    // Lógica para hacer la petición a la API
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  };
  ```

### Para `authStore.ts`
- Agregar `export` a la interfaz `AuthState`:
  ```typescript
  export interface AuthState {
    token: string | null;
    user: User | null;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
  }
  ```

### Verificación
- Después de aplicar las correcciones, ejecutar `npm run build` o `tsc` para verificar que no haya errores de TypeScript.
- Asegurarse de que las rutas de importación sean correctas según la estructura del proyecto.

## Notas Adicionales
- El store de Zustand debe estar en `authStore.ts`, no en `authService.ts`.
- Las importaciones en `LoginForm.tsx` usan rutas relativas correctas, pero los módulos de destino tienen problemas de exportación.</content>
<parameter name="filePath">c:\Frontend-lavarapido\lava-rapido-admin\errores_importaciones.md