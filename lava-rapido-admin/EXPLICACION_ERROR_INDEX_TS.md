# Explicacion del error en `src/features/dashboard/types/index.ts`

## Error detectado

Al ejecutar el build del proyecto con:

```bash
npm.cmd run build
```

TypeScript reporta:

```txt
src/features/dashboard/types/index.ts(15,2): error TS1109: Expression expected.
```

El archivo actual tiene este bloque:

```ts
export type ServicioForm = Pick
  Servicio,
  "nombre" | "descripcion" | "precio" | "duracionMinutos"
>;
```

## Por que ocurre

El error ocurre porque `Pick` es un tipo generico de TypeScript y debe recibir sus parametros entre signos `< >`.

La sintaxis actual separa `Pick` de sus parametros:

```ts
Pick
  Servicio,
  "nombre" | "descripcion" | "precio" | "duracionMinutos"
>;
```

Para TypeScript eso no forma un tipo valido. Por eso, cuando llega al `>` final, espera una expresion valida y lanza `TS1109: Expression expected`.

## Solucion

Cambiar la definicion de `ServicioForm` a esta forma:

```ts
export type ServicioForm = Pick<
  Servicio,
  "nombre" | "descripcion" | "precio" | "duracionMinutos"
>;
```

El archivo completo deberia quedar asi:

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
```

## Que significa `Pick`

`Pick<T, K>` crea un nuevo tipo tomando solo algunas propiedades de otro tipo.

En este caso:

```ts
Pick<Servicio, "nombre" | "descripcion" | "precio" | "duracionMinutos">
```

significa:

```ts
{
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
}
```

Esto sirve porque el formulario de crear/editar servicio no debe enviar campos que genera el backend, como `idServicio`, `estado`, `createdAt` o `updatedAt`.

## Resumen

- El problema no esta en React ni en Vite.
- El problema es una sintaxis incorrecta en el type alias `ServicioForm`.
- La solucion es usar `Pick<Servicio, ...>` con los signos `< >`.
- Despues de aplicar el cambio, conviene volver a ejecutar `npm.cmd run build` para verificar si quedan otros errores.

