export type MapLocation = {
  id: number
  name: string
  latitude: number
  longitude: number
  address: string
  city: string
  phone: string
}

// Mirrors the location currently listed by the web map (dashboard/data/locations.ts).
export const locations: MapLocation[] = [
  {
    id: 2,
    name: 'LAVA RAPIDO VEHICULAR',
    latitude: 2.938,
    longitude: -75.29,
    address: 'Carrera 10 # 12-30',
    city: 'Neiva',
    phone: '3001234567',
  },
]
