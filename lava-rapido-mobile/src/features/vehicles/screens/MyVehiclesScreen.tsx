import React, {
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { classifyApiError, type ApiErrorKind } from '../../../services/api';

import ScreenHeader from '../../../components/common/ScreenHeader';
import ConfirmationModal from '../../../components/notifications/ConfirmationModal';
import { ThemeContext } from '../../../theme/ThemeContext';
import {
  vehicleService,
  Vehicle,
} from '../../../services/vehicleService';
import VehicleCard from '../components/VehicleCard';

type Props = {
  navigation: any;
};

export default function MyVehiclesScreen({
  navigation,
}: Props) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<ApiErrorKind | null>(null);
  const [pendingVehicleStatus, setPendingVehicleStatus] = useState<{ vehicle: Vehicle; nextStatus: boolean } | null>(null);
  const statusRequestInProgress = useRef(false);

  const loadVehicles = async () => {
    try {
      setLoadError(null);
      const response = await vehicleService.getMine();
      if (!Array.isArray(response.data)) throw new Error('invalid-vehicles-response');
      setVehicles(response.data);
    } catch (error: any) {
      const kind = classifyApiError(error);
      if (kind !== 'unauthorized') setLoadError(kind);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadVehicles();
  };

  const handleAddVehicle = () => {
    navigation.navigate('AddVehicle');
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    navigation.navigate('AddVehicle', {
      vehicle,
    });
  };

  const handleChangeStatus = (vehicle: Vehicle) => {
    setPendingVehicleStatus({ vehicle, nextStatus: !vehicle.estado });
  };

  const confirmChangeStatus = async () => {
    if (!pendingVehicleStatus || statusRequestInProgress.current) return;
    statusRequestInProgress.current = true;
    const { vehicle, nextStatus } = pendingVehicleStatus;
    setPendingVehicleStatus(null);

    try {
      await vehicleService.changeStatus(vehicle.idVehiculo, nextStatus);
      await loadVehicles();
    } catch (error: any) {
      console.error(
        'Error cambiando estado:',
        error?.response?.status || error?.message,
      );
      const kind = classifyApiError(error);
      const message = ['network', 'server_unavailable', 'timeout', 'server'].includes(kind)
        ? t(`apiErrors.${kind}`)
        : t('vehicles.errors.status');
      Alert.alert(t('vehicles.errors.title'), message);
    } finally {
      statusRequestInProgress.current = false;
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={[
          styles.loadingContainer,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.primary}
        />

        <Text
          style={[
            styles.loadingText,
            {
              color: theme.textSecondary,
            },
          ]}
        >
          {t('vehicles.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScreenHeader
        accessibilityLabel={t('mobile.serviceDetail.back')}
        onBack={() => navigation.goBack()}
        style={{ marginHorizontal: 18, marginTop: 8 }}
        subtitle={t('vehicles.subtitle')}
        title={t('vehicles.title')}
      />

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.idVehiculo}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            theme={theme}
            translate={t}
            onEdit={handleEditVehicle}
            onChangeStatus={handleChangeStatus}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          vehicles.length === 0 &&
            styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={loadError && vehicles.length > 0 ? (
          <View style={[styles.errorBanner, { backgroundColor: theme.errorBackground, borderColor: theme.errorBorder }]}>
            <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: theme.errorText, flex: 1 }}>{`${t(`apiErrors.${loadError}`)} ${t('apiErrors.staleData')}`}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={loadVehicles}><Text style={[styles.errorRetry, { color: theme.primary }]}>{t('common.retry')}</Text></TouchableOpacity>
          </View>
        ) : null}
        ListEmptyComponent={
          loadError ? <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.errorBackground }]}><Ionicons name="cloud-offline-outline" size={48} color={theme.errorText} /></View>
            <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.emptyTitle, { color: theme.errorText }]}>{t(`apiErrors.${loadError}`)}</Text>
            <TouchableOpacity accessibilityRole="button" style={[styles.emptyButton, { backgroundColor: theme.primary }]} onPress={loadVehicles} activeOpacity={0.85}>            <Text style={[styles.emptyButtonText, { color: theme.onPrimary }]}>{t('common.retry')}</Text></TouchableOpacity>
          </View> : <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: theme.primarySoft,
                },
              ]}
            >
              <Ionicons
                name="car-sport-outline"
                size={48}
                color={theme.primary}
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              {t('vehicles.empty.title')}
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              {t('vehicles.empty.description')}
            </Text>

            <TouchableOpacity
              accessibilityRole="button"
              style={[
                styles.emptyButton,
                {
                  backgroundColor: theme.primary,
                },
              ]}
              onPress={handleAddVehicle}
              activeOpacity={0.85}
            >
              <Ionicons
                name="add"
                size={22}
                color={theme.onPrimary}
              />

              <Text style={[styles.emptyButtonText, { color: theme.onPrimary }]}>
                {t('vehicles.actions.add')}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {vehicles.length > 0 && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('vehicles.actions.add')}
          style={[
            styles.floatingButton,
            {
              backgroundColor: theme.primary,
            },
          ]}
          onPress={handleAddVehicle}
          activeOpacity={0.85}
        >
          <Ionicons
            name="add"
            size={28}
            color={theme.onPrimary}
          />

          <Text style={[styles.floatingButtonText, { color: theme.onPrimary }]}>
            {t('vehicles.actions.addShort')}
          </Text>
        </TouchableOpacity>
      )}
      <ConfirmationModal
        visible={Boolean(pendingVehicleStatus)}
        title={pendingVehicleStatus?.nextStatus ? t('vehicles.status.activateTitle') : t('vehicles.status.deactivateTitle')}
        message={pendingVehicleStatus?.nextStatus
          ? t('vehicles.status.activateMessage', { plate: pendingVehicleStatus.vehicle.placa })
          : t('vehicles.status.deactivateMessage', { plate: pendingVehicleStatus?.vehicle.placa })}
        confirmLabel={pendingVehicleStatus?.nextStatus ? t('vehicles.status.activate') : t('vehicles.status.deactivate')}
        cancelLabel={t('common.cancel')}
        variant={pendingVehicleStatus?.nextStatus ? 'normal' : 'warning'}
        onConfirm={() => void confirmChangeStatus()}
        onCancel={() => setPendingVehicleStatus(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

  header: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 110,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorBanner: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  errorRetry: { fontSize: 14, fontWeight: '700' },

  emptyIcon: {
    width: 95,
    height: 95,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },

  emptyButton: {
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },

  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  floatingButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
