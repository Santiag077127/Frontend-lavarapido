import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

import { locations } from '../data/locations'
import LocationCard from '../components/LocationCard'

export default function MapScreen() {

  const [selected, setSelected] = useState<any>(null)

  return (
    <View style={styles.container}>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 2.9273,
          longitude: -75.2819,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
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