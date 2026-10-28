// Guarda los datos de las sedes que aparecen en el mapa.
export interface Location {
  id:        number;
  name:      string;
  latitude:  number;
  longitude: number;
  address:   string;
  city:      string;
  phone:     string;
}

export const locations: Location[] = [

  {
    id:        2,
    name:      "LAVA RAPIDO VEHICULAR",
    latitude:  2.938,
    longitude: -75.29,
    address:   "Carrera 10 # 12-30",
    city:      "Neiva",
    phone:     "3001234567",
  }

];