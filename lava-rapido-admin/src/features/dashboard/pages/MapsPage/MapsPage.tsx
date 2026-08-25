import "./MapsPage.css";
import "leaflet/dist/leaflet.css";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import { locations, type Location } from "../../data/locations";

// Fix del ícono por defecto de Leaflet con Vite
import iconUrl       from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl:    iconShadowUrl,
  iconSize:     [25, 41],
  iconAnchor:   [12, 41],
  popupAnchor:  [1, -34],
  shadowSize:   [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export const MapsPage = () => {
  const [selected, setSelected] = useState<Location | null>(null);

  return (
    <div className="maps-page">

      <div className="maps-header">
        <h2 className="maps-titulo">Ubicaciones</h2>
        <p className="maps-subtitulo">Puntos de atención registrados</p>
      </div>

      <div className="maps-layout">

        {/* ── Mapa ── */}
        <div className="maps-container">
          <MapContainer
            center={[2.9273, -75.2819]}
            zoom={13}
            className="maps-leaflet"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map(loc => (
              <Marker
                key={loc.id}
                position={[loc.latitude, loc.longitude]}
                eventHandlers={{ click: () => setSelected(loc) }}
              >
                <Popup>{loc.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* ── Panel lateral ── */}
        <div className="maps-panel">
          <p className="maps-panel-label">Autolavados</p>

          {locations.map(loc => (
            <div
              key={loc.id}
              className={`maps-card ${selected?.id === loc.id ? "maps-card--active" : ""}`}
              onClick={() => setSelected(loc)}
            >
              <p className="maps-card__nombre">{loc.name}</p>
              <p className="maps-card__dato">📍 {loc.address}, {loc.city}</p>
              <p className="maps-card__dato">📞 {loc.phone}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};