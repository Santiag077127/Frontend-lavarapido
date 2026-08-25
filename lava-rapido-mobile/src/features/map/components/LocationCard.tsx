import { View, Text, StyleSheet } from 'react-native'

export default function LocationCard({ location }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{location.name}</Text>
      <Text>{location.address}</Text>
      <Text>{location.city}</Text>
      <Text>📞 {location.phone}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 5
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16
  }
})