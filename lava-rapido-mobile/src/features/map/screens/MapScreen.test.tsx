/// <reference types="jest" />
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'
import MapScreen from './MapScreen'
import type { MapLocation } from '../data/locations'
import { buildMapHtml } from '../data/mapHtml'

const mockInjectJavaScript = jest.fn()
let mockLocations: MapLocation[] = []
let mockLanguage = 'es'

jest.mock('../data/locations', () => ({ get locations() { return mockLocations } }))
jest.mock('react-native-webview', () => {
  const React = require('react')
  const { View } = require('react-native')
  return {
    WebView: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ injectJavaScript: mockInjectJavaScript }))
      return <View {...props} />
    }),
  }
})
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { version: '1.0.0' } } }))
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: ({ children }: any) => <>{children}</> }))
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => ({ 'map.address': 'Dirección', 'map.phone': 'Teléfono' } as Record<string, string>)[key] ?? key, i18n: { get resolvedLanguage() { return mockLanguage } } }) }))
jest.mock('../../../theme/ThemeContext', () => ({ ThemeContext: require('react').createContext({ theme: { background: '#F7FBFF', card: '#FFFFFF', text: '#0D1B3E', textSecondary: '#4A5568', border: '#DDE4EF', primary: '#1565C0', primaryDark: '#1A3A8F', primarySoft: '#E6F1FF', interactiveSurface: '#E6F1FF', infoBackground: '#E6F1FF', errorText: '#DC2626', icon: '#4A5568', onPrimary: '#FFFFFF', shadow: '#0D1B3E' } }) }))

const location: MapLocation = { id: 2, name: 'LAVA RAPIDO VEHICULAR', latitude: 2.938, longitude: -75.29, address: 'Carrera 10 # 12-30', city: 'Neiva', phone: '3001234567' }
const send = (view: ReturnType<typeof render>, message: object) => act(() => view.getByTestId('locations-map').props.onMessage({ nativeEvent: { data: JSON.stringify(message) } }))

beforeEach(() => {
  jest.clearAllMocks()
  mockLocations = [location]
  mockLanguage = 'es'
})

test('incluye mapa OSM, atribución, coordenadas y marcador reales', () => {
  expect(jest.requireActual('../data/locations').locations).toEqual([location])
  const view = render(<MapScreen />)
  const html = view.getByTestId('locations-map').props.source.html as string
  expect(html).toContain('leaflet@1.9.4')
  expect(html).toContain('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
  expect(html).toContain('OpenStreetMap contributors')
  expect(html).toContain('2.938')
  expect(html).toContain('-75.29')
  expect(html).toContain('LAVA RAPIDO VEHICULAR')
  expect(html).toContain('L.marker(')
  expect(html).not.toContain('PROVIDER_GOOGLE')
  expect(view.getByText('Cargando mapa…')).toBeTruthy()
  send(view, { type: 'ready' })
  expect(view.queryByText('Cargando mapa…')).toBeNull()
})

test('selecciona marcador y tarjeta y centra el mapa', () => {
  const view = render(<MapScreen />)
  send(view, { type: 'ready' })
  send(view, { type: 'select', id: 2 })
  expect(view.getByTestId('location-card-2').props.accessibilityState.selected).toBe(true)
  fireEvent.press(view.getByTestId('location-card-2'))
  expect(mockInjectJavaScript).toHaveBeenCalledWith('window.selectLocation(2); true;')
  fireEvent.press(view.getByTestId('center-map'))
  expect(mockInjectJavaScript).toHaveBeenCalledWith('window.centerLocations(); true;')
  send(view, { type: 'select', id: 999 })
  expect(view.getByTestId('location-card-2').props.accessibilityState.selected).toBe(true)
})

test('descarta coordenadas inválidas y muestra vacío si no quedan ubicaciones', () => {
  mockLocations = [{ ...location, latitude: Number.NaN }, { ...location, id: 3, longitude: 190 }]
  const view = render(<MapScreen />)
  expect(view.queryByTestId('locations-map')).toBeNull()
  expect(view.getByText('No hay ubicaciones disponibles')).toBeTruthy()
})

test('incluye solo marcadores válidos y encuadra múltiples puntos', () => {
  mockLocations = [location, { ...location, id: 3, name: 'Segundo punto', latitude: 2.95 }, { ...location, id: 4, latitude: 100 }]
  const view = render(<MapScreen />)
  const html = view.getByTestId('locations-map').props.source.html as string
  expect(html).toContain('Segundo punto')
  expect(html).not.toContain('"id":4')
  expect(html).toContain('map.fitBounds(bounds')
  send(view, { type: 'ready' })
  fireEvent.press(view.getByTestId('center-map'))
  expect(mockInjectJavaScript).toHaveBeenCalledWith('window.centerLocations(); true;')
})

test('error de mosaicos muestra reintento', () => {
  const view = render(<MapScreen />)
  send(view, { type: 'error' })
  expect(view.getByText('No se pudo cargar el mapa')).toBeTruthy()
  fireEvent.press(view.getByText('Reintentar'))
  expect(view.getByText('Cargando mapa…')).toBeTruthy()
})

test('tiempo de espera muestra reintento', () => {
  jest.useFakeTimers()
  try {
    const view = render(<MapScreen />)
    act(() => jest.advanceTimersByTime(15000))
    expect(view.getByText('No se pudo cargar el mapa')).toBeTruthy()
  } finally { jest.useRealTimers() }
})

test('actualiza idioma visible y el lenguaje del mapa', () => {
  const view = render(<MapScreen />)
  expect(view.getByText('Ubicaciones')).toBeTruthy()
  mockLanguage = 'en'
  view.rerender(<MapScreen />)
  expect(view.getByText('Locations')).toBeTruthy()
  expect(view.getByTestId('locations-map').props.source.html).toContain('<html lang="en">')
})

test('proveedor alternativo conserva atribución OSM y escapa texto externo', () => {
  const previousUrl = process.env.EXPO_PUBLIC_MAP_TILE_URL
  const previousAttribution = process.env.EXPO_PUBLIC_MAP_TILE_ATTRIBUTION
  try {
    process.env.EXPO_PUBLIC_MAP_TILE_URL = 'https://tiles.example.com/{z}/{x}/{y}.png'
    process.env.EXPO_PUBLIC_MAP_TILE_ATTRIBUTION = 'Proveedor <prueba>'
    const html = buildMapHtml([location], { primary: '#1565C0', primaryDark: '#1A3A8F', card: '#FFFFFF', onPrimary: '#FFFFFF', text: '#0D1B3E', border: '#DDE4EF' })
    expect(html).toContain('https://tiles.example.com/{z}/{x}/{y}.png')
    expect(html).toContain('OpenStreetMap contributors')
    expect(html).toContain('Proveedor &lt;prueba&gt;')
    process.env.EXPO_PUBLIC_MAP_TILE_URL = 'http://invalid.example.com/{z}/{x}/{y}.png'
    expect(buildMapHtml([location], { primary: '#1565C0', primaryDark: '#1A3A8F', card: '#FFFFFF', onPrimary: '#FFFFFF', text: '#0D1B3E', border: '#DDE4EF' })).toContain('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
  } finally {
    if (previousUrl === undefined) delete process.env.EXPO_PUBLIC_MAP_TILE_URL
    else process.env.EXPO_PUBLIC_MAP_TILE_URL = previousUrl
    if (previousAttribution === undefined) delete process.env.EXPO_PUBLIC_MAP_TILE_ATTRIBUTION
    else process.env.EXPO_PUBLIC_MAP_TILE_ATTRIBUTION = previousAttribution
  }
})
