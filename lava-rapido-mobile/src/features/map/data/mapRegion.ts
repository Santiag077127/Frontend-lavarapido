import type { MapLocation } from './locations'

export const hasValidCoordinates = (location: MapLocation) =>
  Number.isFinite(location.latitude) &&
  Number.isFinite(location.longitude) &&
  Math.abs(location.latitude) <= 90 &&
  Math.abs(location.longitude) <= 180

export const validLocations = (items: MapLocation[]) => items.filter(hasValidCoordinates)

export const regionForLocations = (items: MapLocation[]) => {
  const valid = validLocations(items)
  if (valid.length === 0) return null

  const latitudes = valid.map(({ latitude }) => latitude)
  const longitudes = valid.map(({ longitude }) => longitude)
  const minLatitude = Math.min(...latitudes)
  const maxLatitude = Math.max(...latitudes)
  const minLongitude = Math.min(...longitudes)
  const maxLongitude = Math.max(...longitudes)

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.4, 0.035),
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.4, 0.035),
  }
}
