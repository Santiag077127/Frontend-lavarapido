import { useContext } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ThemeContext } from '../../../theme/ThemeContext'

export default function LocationCard({ location }: any) {
  const { theme } = useContext(ThemeContext)

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>{location.name}</Text>
      <Text style={{ color: theme.textSecondary }}>{location.address}</Text>
      <Text style={{ color: theme.textSecondary }}>{location.city}</Text>
      <Text style={{ color: theme.textSecondary }}>📞 {location.phone}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  }
})