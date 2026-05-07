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
