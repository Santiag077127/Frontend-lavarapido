import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'

import { locations } from '../data/locations'
import LocationCard from '../components/LocationCard'

const initialRegion = (() => {
  const latitudes = locations.map(({ latitude }) => latitude)
  const longitudes = locations.map(({ longitude }) => longitude)
  const minLatitude = Math.min(...latitudes)
  const maxLatitude = Math.max(...latitudes)
  const minLongitude = Math.min(...longitudes)
  const maxLongitude = Math.max(...longitudes)

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.4, 0.05),
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.4, 0.05),
  }
})()

export default function MapScreen() {

  const [selected, setSelected] = useState<any>(null)

  return (
    <View style={styles.container}>

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
      >
        {locations.map(loc => (
          <Marker
            key={loc.id}
            coordinate={{
              latitude: loc.latitude,
              longitude: loc.longitude
            }}
            onPress={() => setSelected(loc)}
          />
        ))}
      </MapView>

      {selected && <LocationCard location={selected} />}

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 }
})
