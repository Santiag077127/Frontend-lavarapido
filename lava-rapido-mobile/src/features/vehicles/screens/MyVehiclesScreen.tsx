import React, {
  useCallback,
  useContext,
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
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ThemeContext } from '../../../theme/ThemeContext';
import {
  vehicleService,
  Vehicle,
} from '../../../services/vehicleService';

type Props = {
  navigation: any;
};

const vehicleTypeKeys: Record<string, string> = {
  CARRO: 'vehicles.types.car',
  CAMIONETA: 'vehicles.types.pickup',
  MOTO: 'vehicles.types.motorcycle',
  MOTOCARRO: 'vehicles.types.motortricycle',
  FURGONETA: 'vehicles.types.van',
  PESADO: 'vehicles.types.heavy',
};

export default function MyVehiclesScreen({
  navigation,
}: Props) {
  const { theme, darkMode } = useContext(ThemeContext);
  const { t } = useTranslation();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getRequestError = (error: any) => {
    switch (error?.response?.status) {
      case 401:
        return t('vehicles.errors.unauthorized');
      case 400:
        return t('vehicles.errors.badRequest');
      case 409:
        return t('vehicles.errors.conflict');
      default:
        return t('vehicles.errors.load');
    }
  };

  const loadVehicles = async () => {
    try {
      const response = await vehicleService.getMine();

      setVehicles(response.data);
    } catch (error: any) {
      console.error(
        'Error cargando vehículos:',
        error?.response?.status || error?.message,
      );

      Alert.alert(
        t('vehicles.errors.title'),
        getRequestError(error),
      );
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
    const nuevoEstado = !vehicle.estado;

    Alert.alert(
      nuevoEstado
        ? t('vehicles.status.activateTitle')
        : t('vehicles.status.deactivateTitle'),
      nuevoEstado
        ? t('vehicles.status.activateMessage', { plate: vehicle.placa })
        : t('vehicles.status.deactivateMessage', { plate: vehicle.placa }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: nuevoEstado
            ? t('vehicles.status.activate')
            : t('vehicles.status.deactivate'),
          style: nuevoEstado ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await vehicleService.changeStatus(
                vehicle.idVehiculo,
                nuevoEstado,
              );

              await loadVehicles();
            } catch (error: any) {
              console.error(
                'Error cambiando estado:',
                error?.response?.status || error?.message,
              );

              Alert.alert(
                t('vehicles.errors.title'),
                t('vehicles.errors.status'),
              );
            }
          },
        },
      ],
    );
  };

  const renderVehicle = ({
    item,
  }: {
    item: Vehicle;
  }) => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            opacity: item.estado ? 1 : 0.65,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.vehicleIcon,
              {
                backgroundColor: theme.primary,
              },
            ]}
          >
            <Ionicons
              name={
                item.tipoVehiculo === 'MOTO'
                  ? 'bicycle-outline'
                  : 'car-sport-outline'
              }
              size={25}
              color="#fff"
            />
          </View>

          <View style={styles.headerInfo}>
            <Text
              style={[
                styles.plate,
                {
                  color: theme.text,
                },
              ]}
            >
              {item.placa}
            </Text>

            <Text
              style={[
                styles.vehicleType,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              {vehicleTypeKeys[item.tipoVehiculo]
                ? t(vehicleTypeKeys[item.tipoVehiculo])
                : item.tipoVehiculo}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.estado
                  ? '#E8F5E9'
                  : '#FDECEC',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: item.estado
                    ? '#2E7D32'
                    : '#C62828',
                },
              ]}
            >
              {item.estado
                ? t('vehicles.status.active')
                : t('vehicles.status.inactive')}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: theme.border,
            },
          ]}
        />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="pricetag-outline"
              size={18}
              color={theme.primary}
            />

            <View>
              <Text
                style={[
                  styles.label,
                  {
                    color: theme.textSecondary,
                  },
                ]}
              >
                {t('vehicles.fields.brand')}
              </Text>

              <Text
                style={[
                  styles.value,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {item.nombreMarca}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons
              name="color-palette-outline"
              size={18}
              color={theme.primary}
            />

            <View>
              <Text
                style={[
                  styles.label,
                  {
                    color: theme.textSecondary,
                  },
                ]}
              >
                {t('vehicles.fields.color')}
              </Text>

              <Text
                style={[
                  styles.value,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {item.color || t('vehicles.fields.unspecified')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.primary + '15',
              },
            ]}
            onPress={() => handleEditVehicle(item)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="create-outline"
              size={19}
              color={theme.primary}
            />

            <Text
              style={[
                styles.actionText,
                {
                  color: theme.primary,
                },
              ]}
            >
              {t('vehicles.actions.edit')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: item.estado
                  ? '#C6282815'
                  : '#2E7D3215',
              },
            ]}
            onPress={() => handleChangeStatus(item)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={
                item.estado
                  ? 'eye-off-outline'
                  : 'eye-outline'
              }
              size={19}
              color={
                item.estado ? '#C62828' : '#2E7D32'
              }
            />

            <Text
              style={[
                styles.actionText,
                {
                  color: item.estado
                    ? '#C62828'
                    : '#2E7D32',
                },
              ]}
            >
              {item.estado
                ? t('vehicles.status.deactivate')
                : t('vehicles.status.activate')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
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
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            {t('vehicles.title')}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textSecondary,
              },
            ]}
          >
            {t('vehicles.subtitle')}
          </Text>
        </View>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.idVehiculo}
        renderItem={renderVehicle}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: theme.primary + '15',
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
                color="#fff"
              />

              <Text style={styles.emptyButtonText}>
                {t('vehicles.actions.add')}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {vehicles.length > 0 && (
        <TouchableOpacity
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
            color="#fff"
          />

          <Text style={styles.floatingButtonText}>
            {t('vehicles.actions.addShort')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleContainer: {
    marginLeft: 8,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerInfo: {
    flex: 1,
    marginLeft: 13,
  },

  plate: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 1,
  },

  vehicleType: {
    marginTop: 3,
    fontSize: 14,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    marginVertical: 15,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 20,
  },

  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  label: {
    fontSize: 11,
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },

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
    color: '#fff',
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
