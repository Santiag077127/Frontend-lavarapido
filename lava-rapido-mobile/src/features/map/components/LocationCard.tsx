import { useContext } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from '../../../theme/ThemeContext'
import type { MapLocation } from '../data/locations'
import { getMapCopy } from '../../../i18n/mapCopy'

type Props = { location: MapLocation; selected: boolean; onPress: () => void; width: number }

export default function LocationCard({ location, selected, onPress, width }: Props) {
  const { theme } = useContext(ThemeContext)
  const { t, i18n } = useTranslation()
  const copy = getMapCopy(i18n.resolvedLanguage || i18n.language || 'es')

  return (
    <Pressable
      testID={`location-card-${location.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${copy.select}: ${location.name}. ${location.address}, ${location.city}. ${t('map.phone')}: ${location.phone}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.card, {
        width,
        backgroundColor: selected ? theme.interactiveSurface : theme.card,
        borderColor: selected ? theme.primary : theme.border,
        shadowColor: theme.shadow,
        opacity: pressed ? 0.8 : 1,
      }]}
    >
      <View style={styles.titleRow}>
        <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="car-sport-outline" size={21} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{location.name}</Text>
        {selected && <Ionicons name="checkmark-circle" size={21} color={theme.primary} accessibilityLabel={copy.selected} />}
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={16} color={theme.icon} />
        <Text style={[styles.detail, { color: theme.textSecondary }]}>{t('map.address')}: {location.address}, {location.city}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="call-outline" size={16} color={theme.icon} />
        <Text style={[styles.detail, { color: theme.textSecondary }]}>{t('map.phone')}: {location.phone}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 15, marginRight: 12, minHeight: 132, elevation: 2, shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 7 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  icon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, minWidth: 0, fontSize: 15, fontWeight: '800' },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 5 },
  detail: { flex: 1, minWidth: 0, fontSize: 13, lineHeight: 18 },
})
