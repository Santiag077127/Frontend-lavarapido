import type { MapLocation } from './locations'

type MapColors = {
  primary: string
  primaryDark: string
  card: string
  onPrimary: string
  text: string
  border: string
}

const DEFAULT_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIBUTION = '<a href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>'

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]!)

const scriptData = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')

export const buildMapHtml = (locations: MapLocation[], colors: MapColors, language = 'es') => {
  const configuredUrl = process.env.EXPO_PUBLIC_MAP_TILE_URL?.trim()
  const tileUrl = configuredUrl?.startsWith('https://') && ['{z}', '{x}', '{y}'].every((part) => configuredUrl.includes(part))
    ? configuredUrl : DEFAULT_TILE_URL
  const providerAttribution = process.env.EXPO_PUBLIC_MAP_TILE_ATTRIBUTION?.trim()
  const attribution = OSM_ATTRIBUTION + (providerAttribution ? ` &middot; ${escapeHtml(providerAttribution)}` : '')

  return `<!doctype html>
<html lang="${escapeHtml(language.split('-')[0])}"><head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" onerror="window.ReactNativeWebView?.postMessage(JSON.stringify({type:'error'}))" />
  <style>
    html,body,#map { width:100%; height:100%; margin:0; padding:0; background:${colors.card}; }
    .leaflet-container { font-family:system-ui,-apple-system,sans-serif; background:${colors.card}; }
    .leaflet-control-attribution { display:block !important; background:rgba(255,255,255,.94) !important; color:#0D1B3E !important; font-size:11px !important; padding:3px 6px !important; }
    .leaflet-control-attribution a { color:#1565C0 !important; }
    .brand-marker { width:42px; height:42px; box-sizing:border-box; border:3px solid ${colors.card}; border-radius:50%; background:${colors.primary}; color:${colors.onPrimary}; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:800; box-shadow:0 3px 12px rgba(13,27,62,.25); }
    .brand-marker.selected { width:48px; height:48px; background:${colors.primaryDark}; border-width:4px; box-shadow:0 0 0 3px ${colors.primary},0 3px 12px rgba(13,27,62,.25); }
    .leaflet-popup-content-wrapper { border:1px solid ${colors.border}; border-radius:12px; color:${colors.text}; }
  </style>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onerror="window.ReactNativeWebView?.postMessage(JSON.stringify({type:'error'}))"></script>
</head><body><div id="map"></div><script>
(function () {
  var places = ${scriptData(locations)};
  var tileUrl = ${scriptData(tileUrl)};
  var attribution = ${scriptData(attribution)};
  var send = function (message) { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message)); };
  if (!window.L || !places.length) { send({type:'error'}); return; }
  try {
    var map = L.map('map', {zoomControl:false, scrollWheelZoom:false, preferCanvas:true});
    var bounds = L.latLngBounds(places.map(function (place) { return [place.latitude, place.longitude]; }));
    if (places.length === 1) map.setView(bounds.getCenter(), 14);
    else map.fitBounds(bounds, {padding:[34,34], maxZoom:14});
    var ready = false;
    var tiles = L.tileLayer(tileUrl, {minZoom:10, maxZoom:18, attribution:attribution});
    tiles.on('tileload', function () { if (!ready) { ready = true; send({type:'ready'}); } });
    tiles.addTo(map);
    var markers = {};
    var selectedId = null;
    var makeIcon = function (selected) {
      return L.divIcon({className:'', html:'<div class="brand-marker'+(selected?' selected':'')+'">LR</div>', iconSize:selected?[48,48]:[42,42], iconAnchor:selected?[24,48]:[21,42]});
    };
    places.forEach(function (place) {
      var marker = L.marker([place.latitude, place.longitude], {icon:makeIcon(false), title:place.name, alt:place.name}).addTo(map);
      marker.bindPopup(document.createTextNode(place.name));
      marker.on('click', function () { window.selectLocation(place.id); send({type:'select',id:place.id}); });
      markers[place.id] = marker;
    });
    window.selectLocation = function (id) {
      if (!markers[id]) return;
      if (selectedId !== null && markers[selectedId]) markers[selectedId].setIcon(makeIcon(false));
      selectedId = id;
      markers[id].setIcon(makeIcon(true));
      map.panTo(markers[id].getLatLng());
      markers[id].openPopup();
    };
    window.centerLocations = function () {
      if (places.length === 1) map.setView(bounds.getCenter(), 14);
      else map.fitBounds(bounds, {padding:[34,34], maxZoom:14});
    };
  } catch (error) { send({type:'error'}); }
})();
</script></body></html>`
}
