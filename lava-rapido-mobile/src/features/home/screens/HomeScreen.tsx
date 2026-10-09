import React, { useContext, useEffect, useMemo, useState } from 'react';
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
import { useTranslation } from 'react-i18next';

import { getServiceImage } from '../../../assets/serviceImages';
import api, { classifyApiError, type ApiErrorKind } from '../../../services/api';
import type { Service } from '../../services/types/service.types';
import { formatCurrency } from '../../../utils/formatters';
import { ThemeContext } from '../../../theme/ThemeContext';

interface UserProfile {
  idUsuario?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  nombre?: string;
  apellido?: string;
}

type ServiceFilter = 'available' | 'all';

const normalizeText = (text = '') => text
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [services, setServices] = useState<Service[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [filter, setFilter] = useState<ServiceFilter>('available');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [servicesError, setServicesError] = useState<ApiErrorKind | null>(null);
  const [profileError, setProfileError] = useState<ApiErrorKind | null>(null);

  const loadData = async () => {
    try {
      setServicesError(null);
      setProfileError(null);
      const [servicesResult, profileResult] = await Promise.allSettled([
        api.get<Service[]>('/api/servicios'),
        api.get<UserProfile>('/api/users/profile'),
      ]);

      if (servicesResult.status === 'fulfilled' && Array.isArray(servicesResult.value.data)) {
        // Keep the complete API result. Filters are derived locally from `estado`.
        setServices(servicesResult.value.data);
      } else if (servicesResult.status === 'rejected') {
        const kind = classifyApiError(servicesResult.reason);
        if (kind !== 'unauthorized') setServicesError(kind);
      } else {
        setServicesError('unknown');
      }

      if (profileResult.status === 'fulfilled' && profileResult.value.data) {
        setUser(profileResult.value.data);
      } else if (profileResult.status === 'rejected') {
        const kind = classifyApiError(profileResult.reason);
        if (kind !== 'unauthorized') setProfileError(kind);
      } else {
        setProfileError('unknown');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [t]);

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

  const getUserName = () => user?.firstName || user?.nombre || t('mobile.home.defaultUser');

  const handleServicePress = (service: Service) => {
    if (service.estado !== true) return;
    navigation.navigate('Reservation', { service });
  };

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity accessibilityRole="button" activeOpacity={0.88} style={[styles.serviceCard, item.estado !== true && styles.inactiveService]} disabled={item.estado !== true} onPress={() => handleServicePress(item)}>
      <Image source={getServiceImage(item.nombre, { serviceId: item.idServicio, screen: 'HomeScreen' })} style={styles.serviceImage} resizeMode="cover" accessible={false} />
      <View style={styles.serviceContent}>
        <View style={styles.serviceTitleRow}>
          <Text style={styles.serviceName} numberOfLines={1}>{item.nombre}</Text>
          {item.estado && (
            <View style={styles.availableBadge}>
              <Text style={styles.availableBadgeText}>{t('mobile.home.availableBadge')}</Text>
            </View>
          )}
          {item.estado !== true && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableBadgeText}>{t('mobile.serviceDetail.unavailable')}</Text>
            </View>
          )}
        </View>
        {!!item.descripcion && <Text style={styles.serviceDescription} numberOfLines={2}>{item.descripcion}</Text>}
        <View style={styles.serviceInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={15} color={theme.icon} />
            <Text style={styles.infoText}>{item.duracionMinutos} {t('mobile.home.minutes')}</Text>
          </View>
          <Text style={styles.servicePrice}>{formatCurrency(item.precio)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (servicesError && services.length === 0) return null;
    const hasSearch = search.trim().length > 0;
    const message = hasSearch
      ? t('mobile.home.noSearchResults')
      : filter === 'available'
        ? t('mobile.home.noAvailable')
        : t('mobile.home.noServices');

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name={hasSearch ? 'search-outline' : 'car-outline'} size={38} color={theme.primary} />
        </View>
        <Text style={styles.emptyTitle}>{hasSearch ? t('mobile.home.noSearchResultsTitle') : t('mobile.home.noAvailableTitle')}</Text>
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    );
  };

  const listHeader = (
    <>
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('mobile.home.greeting')} 👋</Text>
        <Text style={styles.userName}>{getUserName()}</Text>
        <Text style={styles.headerSubtitle}>{t('mobile.home.vehicleNeed')}</Text>
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{t('mobile.home.bannerTitle')}</Text>
          <Text style={styles.bannerSubtitle}>{t('mobile.home.bannerSubtitle')}</Text>
        </View>
        <View style={styles.bannerIconContainer}><Ionicons name="car-sport" size={72} color={theme.onPrimary} /></View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text accessibilityRole="header" style={styles.sectionTitle}>{t('mobile.home.sectionTitle')}</Text>
          <Text style={styles.sectionSubtitle}>{t('mobile.home.sectionSubtitle')}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={theme.icon} />
          <TextInput
            accessibilityLabel={t('mobile.home.searchPlaceholder')}
            value={search}
            onChangeText={setSearch}
            placeholder={t('mobile.home.searchPlaceholder')}
            placeholderTextColor={theme.placeholder}
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {!!search && <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('accessibility.clearSearch')} onPress={() => setSearch('')} hitSlop={8}><Ionicons name="close-circle" size={20} color={theme.placeholder} /></TouchableOpacity>}
        </View>
        <View style={styles.filterGroup}>
          <TouchableOpacity accessibilityRole="radio" accessibilityState={{ selected: filter === 'available' }} onPress={() => setFilter('available')} style={[styles.filterButton, filter === 'available' && styles.filterButtonSelected]} activeOpacity={0.8}>
            <Text style={[styles.filterButtonText, filter === 'available' && styles.filterButtonTextSelected]}>{t('mobile.home.available')}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="radio" accessibilityState={{ selected: filter === 'all' }} onPress={() => setFilter('all')} style={[styles.filterButton, filter === 'all' && styles.filterButtonSelected]} activeOpacity={0.8}>
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextSelected]}>{t('mobile.home.all')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!!servicesError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={22} color={theme.errorText} />
          <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.errorText}>{`${t(`apiErrors.${servicesError}`)}${services.length > 0 ? ` ${t('apiErrors.staleData')}` : ''}`}</Text>
          <TouchableOpacity accessibilityRole="button" onPress={loadData} activeOpacity={0.8}><Text style={styles.retryText}>{t('mobile.home.retry')}</Text></TouchableOpacity>
        </View>
      )}
      {!!profileError && <View style={styles.profileErrorContainer}><Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.profileErrorText}>{t(`apiErrors.${profileError}`)}</Text><TouchableOpacity accessibilityRole="button" onPress={loadData} activeOpacity={0.8}><Text style={styles.retryText}>{t('mobile.home.retry')}</Text></TouchableOpacity></View>}
    </>
  );

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.primary} /><Text accessibilityLiveRegion="polite" style={styles.loadingText}>{t('mobile.home.loading')}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredServices}
        renderItem={renderService}
        keyExtractor={(item) => item.idServicio}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={<View style={styles.footer}><Ionicons name="shield-checkmark-outline" size={20} color={theme.success} /><Text style={styles.footerText}>{t('mobile.home.footer')}</Text></View>}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.primary]} tintColor={theme.primary} />}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  listContent: { paddingBottom: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  loadingText: { marginTop: 12, fontSize: 14, color: theme.textSecondary },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, backgroundColor: theme.card },
  greeting: { fontSize: 15, color: theme.textSecondary, marginBottom: 4 },
  userName: { fontSize: 25, fontWeight: '800', color: theme.text, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
  banner: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, backgroundColor: theme.primaryDark, minHeight: 185, padding: 16, overflow: 'hidden', flexDirection: 'row' },
  bannerContent: { flex: 1, zIndex: 2 },
  bannerTitle: { color: theme.onPrimary, fontSize: 22, lineHeight: 28, fontWeight: '800', marginBottom: 8 },
  bannerSubtitle: { color: theme.onPrimary, fontSize: 13, lineHeight: 19, maxWidth: 230, marginBottom: 16 },
  bannerIconContainer: { position: 'absolute', right: -10, bottom: -8, opacity: 0.25 },
  sectionHeader: { paddingHorizontal: 16, marginTop: 24, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 21, fontWeight: '800', color: theme.text },
  sectionSubtitle: { marginTop: 4, fontSize: 13, color: theme.textSecondary },
  controls: { paddingHorizontal: 16, marginBottom: 16 },
  searchContainer: { minHeight: 52, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, borderRadius: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, minWidth: 0, fontSize: 15, color: theme.text, marginHorizontal: 12, paddingVertical: 8 },
  filterGroup: { flexDirection: 'row', gap: 8, marginTop: 12 },
  filterButton: { flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' },
  filterButtonSelected: { backgroundColor: theme.primaryDark, borderColor: theme.primaryDark },
  filterButtonText: { color: theme.textSecondary, fontSize: 14, fontWeight: '700' },
  filterButtonTextSelected: { color: theme.onPrimary },
  serviceCard: { marginHorizontal: 16, backgroundColor: theme.card, borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2 },
  inactiveService: { opacity: 0.58 },
  serviceImage: { width: '100%', height: 165 },
  serviceContent: { padding: 16 },
  serviceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  serviceName: { flex: 1, minWidth: 0, fontSize: 17, fontWeight: '800', color: theme.text },
  availableBadge: { backgroundColor: theme.successBackground, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  availableBadgeText: { color: theme.successText, fontSize: 11, fontWeight: '700' },
  unavailableBadge: { backgroundColor: theme.errorBackground, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  unavailableBadgeText: { color: theme.errorText, fontSize: 11, fontWeight: '700' },
  serviceDescription: { fontSize: 13, lineHeight: 18, color: theme.textSecondary, marginBottom: 12 },
  serviceInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: theme.textSecondary },
  servicePrice: { fontSize: 17, fontWeight: '800', color: theme.primary },
  errorContainer: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12, backgroundColor: theme.errorBackground, borderWidth: 1, borderColor: theme.errorBorder, flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText: { flex: 1, minWidth: 0, fontSize: 13, lineHeight: 18, color: theme.errorText },
  profileErrorContainer: { marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: theme.errorBackground, borderWidth: 1, borderColor: theme.errorBorder, flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileErrorText: { flex: 1, minWidth: 0, color: theme.errorText, fontSize: 13, lineHeight: 18 },
  retryText: { fontSize: 13, fontWeight: '700', color: theme.errorText },
  emptyContainer: { marginHorizontal: 16, padding: 24, borderRadius: 16, backgroundColor: theme.card, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.primaryContainer, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 8 },
  emptyText: { fontSize: 13, lineHeight: 19, color: theme.textSecondary, textAlign: 'center' },
  footer: { marginTop: 24, marginHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  footerText: { fontSize: 13, color: theme.textSecondary, fontWeight: '600' },
});

export default HomeScreen;
