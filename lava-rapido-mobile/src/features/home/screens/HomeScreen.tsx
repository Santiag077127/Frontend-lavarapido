import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { images } from '../../../assets/images';
import api from '../../../services/api';
import type { Service } from '../../services/types/service.types';

interface UserProfile {
  idUsuario?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  nombre?: string;
  apellido?: string;
}

type ServiceFilter = 'available' | 'all';

const serviceImages: Record<string, any> = {
  'lavado basico': images.ServicioBasico,
  'lavado de motor': images.ServicioMotor,
  'aspirado profundo': images.ServicioAspirado,
  'lavado de tapiceria': images.ServicioTapiceria,
  'pulido y abrillantado': images.ServicioPulido,
  'encerado profesional': images.ServicioEncerado,
};

const normalizeText = (text = '') => text
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const getServiceImage = (nombre: string) =>
  serviceImages[normalizeText(nombre)] || images.ServicioBasico;

const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')}`;

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [services, setServices] = useState<Service[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [filter, setFilter] = useState<ServiceFilter>('available');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');
      const [servicesResponse, profileResponse] = await Promise.all([
        api.get<Service[]>('/api/servicios'),
        api.get<UserProfile>('/api/users/profile'),
      ]);

      // Keep the complete API result. Filters are derived locally from `estado`.
      setServices(Array.isArray(servicesResponse.data) ? servicesResponse.data : []);
      setUser(profileResponse.data);
    } catch (err: any) {
      console.error('ERROR HOME:', err?.response?.data || err);
      setError('No fue posible cargar la información. Intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableServices = useMemo(
    () => services.filter((service) => service.estado === true),
    [services],
  );

  const filteredServices = useMemo(() => {
    const servicesForFilter = filter === 'available' ? availableServices : services;
    const normalizedSearch = normalizeText(search.trim());

    return normalizedSearch
      ? servicesForFilter.filter((service) => normalizeText(service.nombre).includes(normalizedSearch))
      : servicesForFilter;
  }, [availableServices, filter, search, services]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getUserName = () => user?.firstName || user?.nombre || 'Usuario';

  const handleServicePress = (service: Service) => {
    navigation.navigate('Reservation', { service });
  };

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity activeOpacity={0.88} style={styles.serviceCard} onPress={() => handleServicePress(item)}>
      <Image source={getServiceImage(item.nombre)} style={styles.serviceImage} resizeMode="cover" />
      <View style={styles.serviceContent}>
        <View style={styles.serviceTitleRow}>
          <Text style={styles.serviceName} numberOfLines={1}>{item.nombre}</Text>
          {item.estado && (
            <View style={styles.availableBadge}>
              <Text style={styles.availableBadgeText}>Disponible</Text>
            </View>
          )}
        </View>
        {!!item.descripcion && <Text style={styles.serviceDescription} numberOfLines={2}>{item.descripcion}</Text>}
        <View style={styles.serviceInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={15} color="#6B7280" />
            <Text style={styles.infoText}>{item.duracionMinutos} min</Text>
          </View>
          <Text style={styles.servicePrice}>{formatPrice(item.precio)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (error) return null;
    const hasSearch = search.trim().length > 0;
    const message = hasSearch
      ? 'No encontramos servicios que coincidan con tu búsqueda.'
      : filter === 'available'
        ? 'No hay servicios disponibles en este momento.'
        : 'No hay servicios para mostrar en este momento.';

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name={hasSearch ? 'search-outline' : 'car-outline'} size={38} color="#1E88E5" />
        </View>
        <Text style={styles.emptyTitle}>{hasSearch ? 'Sin resultados' : 'Servicios no disponibles'}</Text>
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    );
  };

  const listHeader = (
    <>
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola! 👋</Text>
        <Text style={styles.userName}>{getUserName()}</Text>
        <Text style={styles.headerSubtitle}>¿Qué servicio necesita tu vehículo?</Text>
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Tu vehículo merece{`\n`}el mejor cuidado</Text>
          <Text style={styles.bannerSubtitle}>Reserva tu servicio de lavado de forma rápida y sencilla.</Text>
        </View>
        <View style={styles.bannerIconContainer}><Ionicons name="car-sport" size={72} color="#FFFFFF" /></View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Servicios</Text>
          <Text style={styles.sectionSubtitle}>Elige el servicio que necesitas</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar servicio..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {!!search && <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}><Ionicons name="close-circle" size={20} color="#94A3B8" /></TouchableOpacity>}
        </View>
        <View style={styles.filterGroup}>
          <TouchableOpacity onPress={() => setFilter('available')} style={[styles.filterButton, filter === 'available' && styles.filterButtonSelected]} activeOpacity={0.8}>
            <Text style={[styles.filterButtonText, filter === 'available' && styles.filterButtonTextSelected]}>Disponibles</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterButton, filter === 'all' && styles.filterButtonSelected]} activeOpacity={0.8}>
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextSelected]}>Todos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!!error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={22} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadData} activeOpacity={0.8}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity>
        </View>
      )}
    </>
  );

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#1E88E5" /><Text style={styles.loadingText}>Cargando servicios...</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={error ? [] : filteredServices}
        renderItem={renderService}
        keyExtractor={(item) => item.idServicio}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={<View style={styles.footer}><Ionicons name="shield-checkmark-outline" size={20} color="#1E88E5" /><Text style={styles.footerText}>Calidad y cuidado para tu vehículo</Text></View>}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#1E88E5']} tintColor="#1E88E5" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  listContent: { paddingBottom: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F9FC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, backgroundColor: '#FFFFFF' },
  greeting: { fontSize: 15, color: '#6B7280', marginBottom: 4 },
  userName: { fontSize: 25, fontWeight: '800', color: '#111827', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  banner: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, backgroundColor: '#1E88E5', minHeight: 185, padding: 16, overflow: 'hidden', flexDirection: 'row' },
  bannerContent: { flex: 1, zIndex: 2 },
  bannerTitle: { color: '#FFFFFF', fontSize: 22, lineHeight: 28, fontWeight: '800', marginBottom: 8 },
  bannerSubtitle: { color: '#EAF4FF', fontSize: 13, lineHeight: 19, maxWidth: 230, marginBottom: 16 },
  bannerIconContainer: { position: 'absolute', right: -10, bottom: -8, opacity: 0.25 },
  sectionHeader: { paddingHorizontal: 16, marginTop: 24, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 21, fontWeight: '800', color: '#111827' },
  sectionSubtitle: { marginTop: 4, fontSize: 13, color: '#6B7280' },
  controls: { paddingHorizontal: 16, marginBottom: 16 },
  searchContainer: { minHeight: 52, borderWidth: 1, borderColor: '#DCE3EC', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, minWidth: 0, fontSize: 15, color: '#111827', marginHorizontal: 12, paddingVertical: 8 },
  filterGroup: { flexDirection: 'row', gap: 8, marginTop: 12 },
  filterButton: { flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#DCE3EC', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  filterButtonSelected: { backgroundColor: '#1E88E5', borderColor: '#1E88E5' },
  filterButtonText: { color: '#475569', fontSize: 14, fontWeight: '700' },
  filterButtonTextSelected: { color: '#FFFFFF' },
  serviceCard: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E8EDF3', shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2 },
  serviceImage: { width: '100%', height: 165 },
  serviceContent: { padding: 16 },
  serviceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  serviceName: { flex: 1, minWidth: 0, fontSize: 17, fontWeight: '800', color: '#111827' },
  availableBadge: { backgroundColor: '#E8F5E9', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  availableBadgeText: { color: '#2E7D32', fontSize: 11, fontWeight: '700' },
  serviceDescription: { fontSize: 13, lineHeight: 18, color: '#6B7280', marginBottom: 12 },
  serviceInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: '#6B7280' },
  servicePrice: { fontSize: 17, fontWeight: '800', color: '#1E88E5' },
  errorContainer: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText: { flex: 1, minWidth: 0, fontSize: 13, lineHeight: 18, color: '#991B1B' },
  retryText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
  emptyContainer: { marginHorizontal: 16, padding: 24, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', borderWidth: 1, borderColor: '#E8EDF3' },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#EAF4FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  emptyText: { fontSize: 13, lineHeight: 19, color: '#6B7280', textAlign: 'center' },
  footer: { marginTop: 24, marginHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  footerText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
});

export default HomeScreen;
