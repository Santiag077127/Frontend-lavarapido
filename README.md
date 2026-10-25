# Lava Rápido Vehicular — Estructura del Proyecto

Proyecto dividido en dos aplicaciones independientes.

---

## 📱 App Móvil — lava-rapido-mobile
React Native + Expo 52 | Para clientes y operadores (Android)

### Instalación
```bash
cd lava-rapido-mobile
npm install --legacy-peer-deps
npx expo start
```

## Mobile map

The mobile map is rendered in a React Native WebView using Leaflet `1.9.4`.

- Leaflet JavaScript and CSS are bundled locally in `lava-rapido-mobile/src/features/map/data/leafletResources.ts`.
- The pinned package version is declared in `lava-rapido-mobile/package.json`.
- Regenerate the local resources after changing the Leaflet package with:

  ```bash
  cd lava-rapido-mobile
  npm run generate:leaflet
  ```

- The generator preserves the Leaflet license header.
- The map always keeps OpenStreetMap attribution visible.
- The default tile template is `https://tile.openstreetmap.org/{z}/{x}/{y}.png`.
- `EXPO_PUBLIC_MAP_TILE_URL` may override the tile template only when it uses HTTPS and contains `{z}`, `{x}` and `{y}`.
- `EXPO_PUBLIC_MAP_TILE_ATTRIBUTION` adds provider text; it does not replace the required OpenStreetMap attribution.
- The map tests verify local Leaflet loading, WebView message validation, navigation restrictions, markers, loading, errors and retry behavior.

### Manual Android map checklist

After an Android build, verify the following on a physical device:

1. The map renders while online.
2. OpenStreetMap tiles and attribution are visible.
3. Markers, popups, selection and recentering work.
4. Invalid or blocked navigation does not leave the map WebView.
5. Losing connectivity shows the Spanish error state and retry works.
6. The map remains usable in light and dark themes.
Escanea el QR con la app **Expo Go** en tu teléfono.
> Asegúrate de que el teléfono y el PC estén en la misma red WiFi.

---

## 🌐 Panel Admin — lava-rapido-admin
React 19 + Vite 8 + Redux Toolkit | Para administradores (Web)

### Instalación
```bash
cd lava-rapido-admin
npm install
npm run dev
```
Abre http://localhost:5173 en el navegador.

---

## 📁 Estructura de carpetas

```
lava-rapido-completo/
├── lava-rapido-mobile/       # App móvil (React Native + Expo)
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── features/         # Módulos por RF (auth, services, orders...)
│   │   ├── navigation/       # Navegación por roles
│   │   ├── services/         # Capa API (Axios)
│   │   ├── store/            # Redux Toolkit
│   │   ├── i18n/             # Traducciones (ES, EN, FR, PT)
│   │   └── theme/            # Temas claro/oscuro/predeterminado
│   ├── app.json
│   └── package.json
│
└── lava-rapido-admin/        # Panel web admin (React + Vite)
    ├── src/
    │   ├── components/       # Layout y UI reutilizable
    │   ├── features/         # auth, services, operations, dashboard
    │   ├── router/           # Rutas protegidas
    │   ├── services/         # Capa API (Axios)
    │   └── store/            # Redux Toolkit
    ├── index.html
    └── package.json
```
