import React, { useCallback, useContext, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemeContext } from '../../../theme/ThemeContext'
import { notificationService, type NotificationItem, type NotificationPage } from '../../../services/notificationService'
import { reservationService } from '../../reservations/services/reservationService'
import { useTranslation } from 'react-i18next'
import { useNotification } from '../../../components/notifications/NotificationProvider'
import { classifyApiError, type ApiErrorKind } from '../../../services/api'
import { getPageItems } from '../services/paginationItems'

const categoryMeta: Record<NotificationItem['tipo'], { icon: keyof typeof Ionicons.glyphMap; color: 'primary' | 'accentText' | 'success' | 'textSecondary' }> = {
  booking: { icon: 'calendar-outline', color: 'primary' },
  payment: { icon: 'card-outline', color: 'accentText' },
  status: { icon: 'sparkles-outline', color: 'success' },
  system: { icon: 'notifications-outline', color: 'textSecondary' },
}

const formatDate = (value: string, language: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default function NotificationsScreen({ operator = false }: { operator?: boolean }) {
  const { theme } = useContext(ThemeContext)
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage || i18n.language || 'es'
  const navigation = useNavigation<any>()
  const { adjustUnreadCount, setUnreadCount } = useNotification()
  const [pagina, setPagina] = useState(0)
  const [soloNoLeidas, setSoloNoLeidas] = useState(false)
  const [data, setData] = useState<NotificationPage | null>(null)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiErrorKind | null>(null)
  const [opening, setOpening] = useState<string | null>(null)
  const [readingIds, setReadingIds] = useState<Set<string>>(() => new Set())
  const [markingAll, setMarkingAll] = useState(false)
  const requestId = useRef(0)
  const listRef = useRef<FlatList<NotificationItem>>(null)

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true); setError(null)
    try {
      const [list, unread] = await Promise.all([notificationService.list(pagina, soloNoLeidas), notificationService.count()])
      if (currentRequest === requestId.current) {
        if (list.totalPages > 0 && pagina >= list.totalPages) {
          setPagina(list.totalPages - 1)
          return
        }
        setData(list); setCount(unread); setUnreadCount(unread)
      }
    } catch (requestError) { if (currentRequest === requestId.current) setError(classifyApiError(requestError)) }
    finally { if (currentRequest === requestId.current) setLoading(false) }
  }, [pagina, setUnreadCount, soloNoLeidas])

  useFocusEffect(useCallback(() => {
    void load()
    return () => { requestId.current++; setData(null); setCount(0) }
  }, [load]))

  const openRelated = async (item: NotificationItem) => {
    if (!item.reservaId || opening) return
    setOpening(item.id)
    try {
      if (operator) navigation.navigate('Asignaciones')
      else {
        const reservation = await reservationService.getById(item.reservaId)
        navigation.getParent()?.navigate(item.tipo === 'payment' ? 'ReservationPayment' : 'ServiceDetails', { reservation })
      }
    } catch (requestError) { setError(classifyApiError(requestError)) }
    finally { setOpening(null) }
  }

  const markRead = async (id: string) => {
    if (readingIds.has(id)) return
    setReadingIds((current) => new Set(current).add(id))
    try {
      await notificationService.read(id)
      adjustUnreadCount(-1)
      setCount((current) => Math.max(0, current - 1))
      await load()
    } catch (requestError) { setError(classifyApiError(requestError)) }
    finally { setReadingIds((current) => { const next = new Set(current); next.delete(id); return next }) }
  }
  const markAllRead = async () => {
    if (markingAll) return
    setMarkingAll(true)
    try {
      await notificationService.readAll()
      setUnreadCount(0)
      setCount(0)
      await load()
    } catch (requestError) { setError(classifyApiError(requestError)) }
    finally { setMarkingAll(false) }
  }
  const renderItem = ({ item }: { item: NotificationItem }) => {
    const meta = categoryMeta[item.tipo]
    const accent = theme[meta.color]
    const action = operator ? t('notifications.assignments') : item.tipo === 'payment' ? t('notifications.payment') : t('notifications.booking')
    return <View style={[styles.card, { backgroundColor: item.leidaAt ? theme.card : theme.interactiveSurface, borderColor: item.leidaAt ? theme.border : theme.primary, shadowColor: theme.shadow }]}>
      <View style={[styles.categoryIcon, { backgroundColor: `${accent}20` }]}><Ionicons name={meta.icon} size={21} color={accent} /></View>
      <View style={styles.cardContent}>
        <View style={styles.metaRow}><Text style={[styles.category, { color: accent }]}>{t(`notifications.categories.${item.tipo}`)}</Text>{!item.leidaAt && <View accessibilityLabel={t('notifications.new')} style={[styles.newBadge, { backgroundColor: theme.primary }]}><Text style={[styles.newBadgeText, { color: theme.onPrimary }]}>{t('notifications.new')}</Text></View>}</View>
        <Text style={[styles.itemTitle, { color: theme.text }]}>{item.titulo}</Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>{item.mensaje}</Text>
        <Text style={[styles.date, { color: theme.textSecondary }]}>{formatDate(item.createdAt, language)}</Text>
        <View style={styles.actions}>
          {!item.leidaAt && <Pressable onPress={() => void markRead(item.id)} disabled={readingIds.has(item.id)} style={({ pressed }) => [styles.textButton, pressed && styles.pressed, readingIds.has(item.id) && styles.disabled]} accessibilityRole="button" accessibilityState={{ disabled: readingIds.has(item.id), busy: readingIds.has(item.id) }}><Ionicons name="checkmark" size={17} color={theme.primary} /><Text style={[styles.textButtonLabel, { color: theme.primary }]}>{t('notifications.read')}</Text></Pressable>}
          {item.reservaId && <Pressable onPress={() => void openRelated(item)} disabled={opening === item.id} style={({ pressed }) => [styles.textButton, pressed && styles.pressed, opening === item.id && styles.disabled]} accessibilityRole="button" accessibilityState={{ disabled: opening === item.id, busy: opening === item.id }}>{opening === item.id ? <ActivityIndicator size="small" color={theme.primary} /> : <Ionicons name="arrow-forward" size={17} color={theme.primary} />}<Text style={[styles.textButtonLabel, { color: theme.primary }]}>{action}</Text></Pressable>}
        </View>
      </View>
    </View>
  }

  const header = <>
    <View style={styles.heading}><View><Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>{t('notifications.title')}</Text><Text style={[styles.unread, { color: theme.textSecondary }]}>{t('notifications.unread', { count })}</Text></View><View style={[styles.bell, { backgroundColor: theme.infoBackground }]}><Ionicons name="notifications-outline" size={24} color={theme.primary} /></View></View>
    <View style={styles.filters}><Pressable onPress={() => { setPagina(0); setSoloNoLeidas(false) }} style={[styles.filter, { backgroundColor: !soloNoLeidas ? theme.primary : theme.card, borderColor: !soloNoLeidas ? theme.primary : theme.border }]} accessibilityRole="button" accessibilityState={{ selected: !soloNoLeidas }}><Text style={[styles.filterText, { color: !soloNoLeidas ? theme.onPrimary : theme.text }]}>{t('notifications.all')}</Text></Pressable><Pressable onPress={() => { setPagina(0); setSoloNoLeidas(true) }} style={[styles.filter, { backgroundColor: soloNoLeidas ? theme.primary : theme.card, borderColor: soloNoLeidas ? theme.primary : theme.border }]} accessibilityRole="button" accessibilityState={{ selected: soloNoLeidas }}><Text style={[styles.filterText, { color: soloNoLeidas ? theme.onPrimary : theme.text }]}>{t('notifications.only')}</Text></Pressable></View>
    {count > 0 && <Pressable onPress={() => void markAllRead()} disabled={markingAll} style={[styles.readAll, markingAll && styles.disabled]} accessibilityRole="button" accessibilityState={{ disabled: markingAll, busy: markingAll }}><Ionicons name="checkmark-done-outline" size={18} color={theme.primary} /><Text style={[styles.readAllText, { color: theme.primary }]}>{t('notifications.readAll')}</Text></Pressable>}
  </>

  const state = (icon: keyof typeof Ionicons.glyphMap, title: string, description: string, retry?: boolean) => <View style={styles.state}><View style={[styles.stateIcon, { backgroundColor: retry ? theme.errorBackground : theme.infoBackground }]}><Ionicons name={icon} size={38} color={retry ? theme.errorText : theme.primary} /></View><Text style={[styles.stateTitle, { color: theme.text }]}>{title}</Text><Text style={[styles.stateText, { color: theme.textSecondary }]}>{description}</Text>{retry && <Pressable onPress={() => void load()} style={[styles.retryButton, { backgroundColor: theme.primary }]} accessibilityRole="button"><Text style={[styles.retryText, { color: theme.onPrimary }]}>{t('notifications.retry')}</Text></Pressable>}</View>

  const pageItems = getPageItems(data?.totalPages ?? 0, pagina)
  const pagination = !loading && !error && data && data.totalPages > 1 ? <View accessibilityLabel={t('notifications.pagination')} style={[styles.pagination, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <Pressable disabled={pagina === 0} onPress={() => { listRef.current?.scrollToOffset({ offset: 0, animated: false }); setPagina((current) => Math.max(0, current - 1)) }} style={[styles.pageButton, pagina === 0 && styles.disabled]} accessibilityRole="button" accessibilityLabel={t('notifications.previous')} accessibilityState={{ disabled: pagina === 0 }}><Ionicons name="chevron-back" size={21} color={pagina === 0 ? theme.textDisabled : theme.primary} /></Pressable>
    <View style={styles.pageItems}>{pageItems.map((item, index) => item === 'ellipsis'
      ? <Text key={`ellipsis-${index}`} testID="pagination-ellipsis" style={[styles.ellipsis, { color: theme.textSecondary }]}>…</Text>
      : <Pressable key={item} onPress={() => { listRef.current?.scrollToOffset({ offset: 0, animated: false }); setPagina(item - 1) }} style={[styles.pageButton, styles.numberButton, item === pagina + 1 && { backgroundColor: theme.primary }]} accessibilityRole="button" accessibilityLabel={t('notifications.pageNumber', { page: item })} accessibilityState={{ selected: item === pagina + 1 }}><Text style={[styles.pageNumber, { color: item === pagina + 1 ? theme.onPrimary : theme.text }]}>{item}</Text></Pressable>)}</View>
    <Pressable disabled={pagina + 1 >= data.totalPages} onPress={() => { listRef.current?.scrollToOffset({ offset: 0, animated: false }); setPagina((current) => Math.min(data.totalPages - 1, current + 1)) }} style={[styles.pageButton, pagina + 1 >= data.totalPages && styles.disabled]} accessibilityRole="button" accessibilityLabel={t('notifications.next')} accessibilityState={{ disabled: pagina + 1 >= data.totalPages }}><Ionicons name="chevron-forward" size={21} color={pagina + 1 >= data.totalPages ? theme.textDisabled : theme.primary} /></Pressable>
  </View> : null
  return <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}><View style={[styles.screen, { backgroundColor: theme.background }]}>
    {loading ? <View style={styles.loading}><ActivityIndicator accessibilityLabel={t('notifications.loading')} size="large" color={theme.primary} /><Text style={[styles.loadingText, { color: theme.textSecondary }]}>{t('notifications.loading')}</Text></View> : error ? <FlatList data={[]} renderItem={() => null} ListHeaderComponent={header} ListEmptyComponent={state('cloud-offline-outline', t('notifications.errorTitle'), error === 'unknown' ? t('notifications.error') : t(`apiErrors.${error}`), true)} contentContainerStyle={styles.listContent} /> : <FlatList ref={listRef} data={data?.content ?? []} keyExtractor={item => item.id} renderItem={renderItem} ListHeaderComponent={header} ListFooterComponent={pagination ?? undefined} ListEmptyComponent={state('notifications-off-outline', t('notifications.emptyTitle'), t('notifications.empty'))} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />}
  </View></SafeAreaView>
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, screen: { flex: 1 }, listContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 }, heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, marginBottom: 18 }, title: { fontSize: 27, fontWeight: '800', letterSpacing: -0.5 }, unread: { fontSize: 14, marginTop: 3 }, bell: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: 10, marginBottom: 12 }, filter: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 21, borderWidth: 1 }, filterText: { fontSize: 14, fontWeight: '700' }, readAll: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, minHeight: 40, marginBottom: 10 }, readAllText: { fontSize: 14, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 11, shadowOpacity: 0.045, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 }, categoryIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, cardContent: { flex: 1, minWidth: 0 }, metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7, marginBottom: 3 }, category: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.45 }, newBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 }, newBadgeText: { fontSize: 11, fontWeight: '800' }, itemTitle: { fontSize: 16, lineHeight: 21, fontWeight: '800', flexShrink: 1 }, message: { fontSize: 14, lineHeight: 20, marginTop: 3, flexShrink: 1 }, date: { fontSize: 12, lineHeight: 17, marginTop: 8 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 7 }, textButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 4 }, textButtonLabel: { fontSize: 13, fontWeight: '800' }, pressed: { opacity: 0.65 }, disabled: { opacity: 0.45 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }, loadingText: { marginTop: 13, fontSize: 15 }, state: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }, stateIcon: { width: 78, height: 78, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, stateTitle: { fontSize: 19, fontWeight: '800', textAlign: 'center', marginBottom: 8 }, stateText: { fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 310 }, retryButton: { minHeight: 46, borderRadius: 13, justifyContent: 'center', paddingHorizontal: 20, marginTop: 20 }, retryText: { fontSize: 15, fontWeight: '800' },
  pagination: { minHeight: 58, borderWidth: 1, borderRadius: 16, paddingHorizontal: 8, marginTop: 2, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 }, pageItems: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }, pageButton: { width: 36, minWidth: 36, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 }, numberButton: { minWidth: 30, width: 30 }, pageNumber: { fontSize: 13, fontWeight: '700' }, ellipsis: { width: 14, textAlign: 'center', fontSize: 14, fontWeight: '700' },
})
