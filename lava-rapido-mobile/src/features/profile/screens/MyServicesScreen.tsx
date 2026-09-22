import React, { useCallback, useContext, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeContext } from '../../../theme/ThemeContext';
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider';
import api from '../../../services/api';
import { reservationService } from '../../reservations/services/reservationService';
import type { ReservationResponse, ReservationStatus } from '../../reservations/types/reservation.types';

interface UserProfile { userId: string }

const STATUS_OPTIONS: { value: ReservationStatus; label: string }[] = [
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'ASIGNADA', label: 'Asignadas' },
  { value: 'FINALIZADA', label: 'Terminados' },
  { value: 'CANCELADA', label: 'Cancelados' },
];

const statusLabel = (status: ReservationStatus) => STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
const statusColor = (status: ReservationStatus) => ({ EN_PROCESO: '#F39C12', PENDIENTE: '#3498DB', ASIGNADA: '#8E44AD', FINALIZADA: '#27AE60', CANCELADA: '#E74C3C' }[status]);
const formatDate = (date: string) => date ? date.split('-').reverse().join('/') : 'No disponible';
const formatTime = (time: string) => time ? time.substring(0, 5) : 'No disponible';

export default function MyServicesScreen() {
  const navigation = useNavigation<any>();
  const { theme, darkMode } = useContext(ThemeContext);
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus>('EN_PROCESO');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadReservations = useCallback(async () => {
    try {
      setError('');
      const profileResponse = await api.get<UserProfile>('/api/users/profile');
      const userId = profileResponse.data.userId;
      if (!userId) throw new Error('No se encontró el ID del usuario autenticado.');
      setReservations(await reservationService.getByUser(userId));
    } catch (requestError: any) {
      console.error('ERROR CARGANDO MIS SERVICIOS:', requestError?.response?.data || requestError?.message || requestError);
      setReservations([]);
      setError('No fue posible cargar tus servicios. Intenta nuevamente.');
      Alert.alert('Error', 'No fue posible cargar tus servicios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); loadReservations(); }, [loadReservations]));

  const filteredReservations = useMemo(() => reservations.filter((reservation) => reservation.estado === selectedStatus), [reservations, selectedStatus]);

  const handleRefresh = () => { setRefreshing(true); loadReservations(); };

  const renderItem = ({ item }: { item: ReservationResponse }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.top}>
        <View style={styles.titleContainer}>
          <Text style={[styles.serviceTitle, { color: theme.text }]} numberOfLines={2}>{item.nombreServicio || 'Servicio'}</Text>
          <Text style={[styles.vehicleText, { color: theme.textSecondary }]} numberOfLines={1}>{item.placaVehiculo} {' • '} {item.tipoVehiculo}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(item.estado) }]}><Text style={styles.statusText}>{statusLabel(item.estado)}</Text></View>
      </View>
      <View style={styles.infoRow}><Ionicons name="calendar-outline" size={18} color={theme.primary} /><Text style={[styles.infoText, { color: theme.text }]}>{formatDate(item.fechaReserva)} {' · '} {formatTime(item.horaReserva)}</Text></View>
      <View style={styles.infoRow}><Ionicons name="cash-outline" size={18} color={theme.primary} /><Text style={[styles.infoText, { color: theme.text }]}>${item.precioServicio.toLocaleString('es-CO')}</Text></View>
      <TouchableOpacity style={[styles.detailsButton, { borderColor: theme.primary }]} activeOpacity={0.8} onPress={() => navigation.navigate('ServiceDetails', { reservation: item })}>
        <Text style={[styles.detailsText, { color: theme.primary }]}>Detalle</Text><Ionicons name="chevron-forward" size={18} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  const emptyMessage = selectedStatus === 'EN_PROCESO' ? 'No tienes servicios en proceso.' : 'No hay servicios en este estado.';

  if (loading) return <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /><Text style={[styles.loadingText, { color: theme.text }]}>Cargando tus servicios...</Text></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <FlatList
        data={error ? [] : filteredReservations}
        renderItem={renderItem}
        keyExtractor={(item) => item.idReserva}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} colors={[theme.primary]} />}
        ListHeaderComponent={<><View style={styles.header}><Text style={[styles.title, { color: theme.text }]}>Mis servicios</Text><Text style={[styles.subtitle, { color: theme.textSecondary }]}>Consulta el estado de tus reservas</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>{STATUS_OPTIONS.map((option) => <TouchableOpacity key={option.value} onPress={() => setSelectedStatus(option.value)} activeOpacity={0.8} style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.card }, selectedStatus === option.value && { backgroundColor: theme.primary, borderColor: theme.primary }]}><Text style={[styles.filterText, { color: theme.textSecondary }, selectedStatus === option.value && styles.filterTextSelected]}>{option.label}</Text></TouchableOpacity>)}</ScrollView></>}
        ListEmptyComponent={<View style={[styles.emptyContainer, { backgroundColor: error ? theme.errorBackground : theme.card, borderColor: error ? theme.errorBorder : theme.border }]}><Ionicons name={error ? 'alert-circle-outline' : 'car-outline'} size={42} color={error ? theme.errorText : theme.primary} /><Text style={[styles.emptyTitle, { color: error ? theme.errorText : theme.text }]}>{error || emptyMessage}</Text>{error ? <TouchableOpacity onPress={loadReservations}><Text style={[styles.retryText, { color: theme.primary }]}>Reintentar</Text></TouchableOpacity> : <Text style={[styles.emptyText, { color: darkMode ? '#BDBDBD' : theme.textSecondary }]}>Cuando tengas una reserva en este estado, aparecerá aquí.</Text>}</View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }, loadingText: { marginTop: 12, fontSize: 15 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 }, header: { paddingTop: 16, paddingBottom: 16 }, title: { fontSize: 26, fontWeight: '800', marginBottom: 4 }, subtitle: { fontSize: 14 },
  filterList: { gap: 8, paddingBottom: 24 }, filterButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 16, borderWidth: 1, borderRadius: 12 }, filterText: { fontSize: 14, fontWeight: '700' }, filterTextSelected: { color: '#FFFFFF' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }, titleContainer: { flex: 1, minWidth: 0, paddingRight: 8 }, serviceTitle: { fontSize: 18, fontWeight: '800' }, vehicleText: { marginTop: 4, fontSize: 13 }, statusBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }, statusText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }, infoText: { marginLeft: 8, fontSize: 14, flex: 1 }, detailsButton: { minHeight: 48, borderWidth: 1, borderRadius: 12, marginTop: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 }, detailsText: { fontSize: 14, fontWeight: '700' },
  emptyContainer: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center' }, emptyTitle: { marginTop: 12, fontSize: 17, lineHeight: 23, fontWeight: '800', textAlign: 'center' }, emptyText: { marginTop: 8, fontSize: 14, lineHeight: 20, textAlign: 'center' }, retryText: { marginTop: 12, fontSize: 14, fontWeight: '700' },
});
