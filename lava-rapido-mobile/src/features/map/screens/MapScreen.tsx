import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'
import { useTranslation } from 'react-i18next'

import { locations } from '../data/locations'
import { validLocations } from '../data/mapRegion'
import { buildMapHtml } from '../data/mapHtml'
import LocationCard from '../components/LocationCard'
import { ThemeContext } from '../../../theme/ThemeContext'
import { getMapCopy } from '../../../i18n/mapCopy'

const MAP_READY_TIMEOUT_MS = 15000
const OSM_COPYRIGHT_URL = 'https://www.openstreetmap.org/copyright'

export default function MapScreen() {
  const { theme } = useContext(ThemeContext)
  const { i18n } = useTranslation()
  const copy = getMapCopy(i18n.resolvedLanguage || i18n.language || 'es')
  const { width } = useWindowDimensions()
  const mapRef = useRef<WebView>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [mapKey, setMapKey] = useState(0)
  const available = useMemo(() => validLocations(locations), [])
  const mapSource = useMemo(() => ({ html: buildMapHtml(available, {
    primary: theme.primary, primaryDark: theme.primaryDark, card: theme.card,
    onPrimary: theme.onPrimary, text: theme.text, border: theme.border,
    attributionBackground: theme.mapAttributionBackground,
    attributionText: theme.mapAttributionText,
    attributionLink: theme.mapAttributionLink,
    shadow: theme.mapShadow,
  }, i18n.resolvedLanguage || i18n.language || 'es') }), [available, theme, i18n.resolvedLanguage, i18n.language])
  const hasLocations = available.length > 0

  useEffect(() => {
    setMapReady(false)
    setMapError(false)
  }, [mapSource])

  useEffect(() => {
    if (!hasLocations || mapReady || mapError) return
    const timeout = setTimeout(() => setMapError(true), MAP_READY_TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [mapKey, mapReady, mapError, hasLocations])

  useEffect(() => {
    if (mapReady && selectedId !== null) mapRef.current?.injectJavaScript(`window.selectLocation(${selectedId}); true;`)
  }, [mapReady])

  const selectLocation = (location: (typeof available)[number]) => {
    setSelectedId(location.id)
    if (mapReady) mapRef.current?.injectJavaScript(`window.selectLocation(${location.id}); true;`)
  }

  const centerMap = () => {
    if (mapReady) mapRef.current?.injectJavaScript('window.centerLocations(); true;')
  }

  const handleMapMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { type?: string; id?: number }
      if (message.type === 'ready') { setMapReady(true); setMapError(false) }
      else if (message.type === 'error') { setMapReady(false); setMapError(true) }
      else if (message.type === 'select' && available.some(({ id }) => id === message.id)) setSelectedId(message.id!)
    } catch { /* Ignore messages outside the map protocol. */ }
  }

  const allowMapNavigation = ({ url }: { url: string }) => {
    if (url === 'about:blank' || url.startsWith('data:')) return true
    if (url === OSM_COPYRIGHT_URL) void Linking.openURL(url)
    return false
  }

  const retryMap = () => {
    setMapReady(false)
    setMapError(false)
    setMapKey((key) => key + 1)
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>{copy.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{copy.subtitle}</Text>
      </View>

      {!hasLocations ? (
        <View style={styles.state}>
          <View style={[styles.stateIcon, { backgroundColor: theme.infoBackground }]}><Ionicons name="location-outline" size={34} color={theme.primary} /></View>
          <Text style={[styles.stateTitle, { color: theme.text }]}>{copy.emptyTitle}</Text>
          <Text style={[styles.stateMessage, { color: theme.textSecondary }]}>{copy.emptyMessage}</Text>
        </View>
      ) : (
        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.mapFrame, { borderColor: theme.border }]}>
            <WebView
              key={mapKey}
              ref={mapRef}
              testID="locations-map"
              accessibilityLabel={copy.title}
              style={styles.map}
              source={mapSource}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled={false}
              cacheMode="LOAD_DEFAULT"
              userAgent={`LavaRapidoVehicular/${Constants.expoConfig?.version ?? '1.0'} (Android; com.lavarapido.vehicular)`}
              onMessage={handleMapMessage}
              onError={() => { setMapReady(false); setMapError(true) }}
              onShouldStartLoadWithRequest={allowMapNavigation}
            />
            {!mapReady && <View style={[styles.mapOverlay, { backgroundColor: theme.card }]}>
              {mapError ? <>
                <Ionicons name="cloud-offline-outline" size={33} color={theme.errorText} />
                <Text style={[styles.stateTitle, { color: theme.text }]}>{copy.errorTitle}</Text>
                <Text style={[styles.stateMessage, { color: theme.textSecondary }]}>{copy.errorMessage}</Text>
                <Pressable accessibilityRole="button" onPress={retryMap} style={[styles.retry, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.retryText, { color: theme.onPrimary }]}>{copy.retry}</Text>
                </Pressable>
              </> : <><ActivityIndicator color={theme.primary} /><Text style={[styles.loadingText, { color: theme.textSecondary }]}>{copy.loading}</Text></>}
            </View>}
            <Pressable
              testID="center-map"
              accessibilityRole="button"
              accessibilityLabel={copy.recenter}
              disabled={!mapReady}
              onPress={centerMap}
              style={[styles.centerButton, { backgroundColor: theme.card, borderColor: theme.border, opacity: mapReady ? 1 : 0.5 }]}
            >
              <Ionicons name="scan-outline" size={21} color={theme.primary} />
            </Pressable>
          </View>

          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { color: theme.textSecondary }]}>{copy.available}</Text>
            <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardList}>
              {available.map((location) => <LocationCard
                key={location.id}
                location={location}
                selected={selectedId === location.id}
                onPress={() => selectLocation(location)}
                width={Math.min(width - 40, 360)}
              />)}
            </ScrollView>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14 },
  title: { fontSize: 27, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 3 },
  contentScroll: { flex: 1 },
  content: { flexGrow: 1 },
  mapFrame: { flex: 1, minHeight: 220, marginHorizontal: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  map: { flex: 1 },
  centerButton: { position: 'absolute', top: 14, right: 14, width: 46, height: 46, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  mapOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { fontSize: 14, marginTop: 10 },
  panel: { paddingTop: 14, paddingBottom: 15 },
  panelTitle: { paddingHorizontal: 20, marginBottom: 10, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardList: { paddingLeft: 16, paddingRight: 4, paddingBottom: 5 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  stateIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  stateTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginTop: 10 },
  stateMessage: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8, maxWidth: 300 },
  retry: { minHeight: 46, borderRadius: 13, justifyContent: 'center', paddingHorizontal: 22, marginTop: 20 },
  retryText: { fontSize: 15, fontWeight: '800' },
})
