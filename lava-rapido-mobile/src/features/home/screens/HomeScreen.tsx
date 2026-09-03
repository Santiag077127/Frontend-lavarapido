
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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

const serviceImages: Record<string, any> = {
  'lavado basico': images.ServicioBasico,
  'lavado de motor': images.ServicioMotor,
  'aspirado profundo': images.ServicioAspirado,
  'lavado de tapiceria': images.ServicioTapiceria,
  'pulido y abrillantado': images.ServicioPulido,
  'encerado profesional': images.ServicioEncerado,
};

const normalizeText = (text: string = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getServiceImage = (nombre: string) => {
  const normalizedName = normalizeText(nombre);

  return (
    serviceImages[normalizedName] ||
    images.ServicioBasico
  );
};

const formatPrice = (price: number) => {
  return `$${price.toLocaleString('es-CO')}`;
};

const HomeScreen = () => {
  const navigation = useNavigation<any>();

  const [services, setServices] = useState<Service[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');

      const [
        servicesResponse,
        profileResponse,
      ] = await Promise.all([
        api.get<Service[]>('/api/servicios'),
        api.get<UserProfile>('/api/users/profile'),
      ]);

      const servicesData = servicesResponse.data;
      const profileData = profileResponse.data;

      const servicesList = Array.isArray(servicesData)
        ? servicesData
        : [];

      setServices(
        servicesList.filter(
          (service) => service.estado !== false
        )
      );

      setUser(profileData);
    } catch (err: any) {
      console.error(
        'ERROR HOME:',
        err?.response?.data || err
      );

      setError(
        'No fue posible cargar la información. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getUserName = () => {
    if (!user) {
      return 'Usuario';
    }

    return (
      user.firstName ||
      user.nombre ||
      'Usuario'
    );
  };

  const handleServicePress = (service: Service) => {
    navigation.navigate('Reservation', {
      service,
    });
  };

  const renderService = ({
    item,
  }: {
    item: Service;
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.serviceCard}
        onPress={() => handleServicePress(item)}
      >
        <Image
          source={getServiceImage(item.nombre)}
          style={styles.serviceImage}
          resizeMode="cover"
        />

        <View style={styles.serviceContent}>
          <Text
            style={styles.serviceName}
            numberOfLines={1}
          >
            {item.nombre}
          </Text>

          {!!item.descripcion && (
            <Text
              style={styles.serviceDescription}
              numberOfLines={2}
            >
              {item.descripcion}
            </Text>
          )}

          <View style={styles.serviceInfo}>
            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={15}
                color="#6B7280"
              />

              <Text style={styles.infoText}>
                {item.duracionMinutos} min
              </Text>
            </View>

            <Text style={styles.servicePrice}>
              {formatPrice(item.precio)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#1E88E5"
        />

        <Text style={styles.loadingText}>
          Cargando servicios...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1E88E5']}
            tintColor="#1E88E5"
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>
              ¡Hola! 👋
            </Text>

            <Text style={styles.userName}>
              {getUserName()}
            </Text>

            <Text style={styles.headerSubtitle}>
              ¿Qué servicio necesita tu vehículo?
            </Text>
          </View>
        </View>

        {/* BANNER */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>
              Tu vehículo merece
              {'\n'}
              el mejor cuidado
            </Text>

            <Text style={styles.bannerSubtitle}>
              Reserva tu servicio de lavado
              de forma rápida y sencilla.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.bannerButton}
              onPress={() => {
                if (services.length > 0) {
                  handleServicePress(services[0]);
                }
              }}
            >
              <Text style={styles.bannerButtonText}>
                Reservar ahora
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.bannerIconContainer}>
            <Ionicons
              name="car-sport"
              size={72}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* SERVICES HEADER */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Nuestros servicios
            </Text>

            <Text style={styles.sectionSubtitle}>
              Elige el servicio que necesitas
            </Text>
          </View>

          <Ionicons
            name="sparkles-outline"
            size={23}
            color="#1E88E5"
          />
        </View>

        {/* ERROR */}
        {!!error && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color="#DC2626"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              onPress={loadData}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>
                Reintentar
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SERVICES */}
        {!error && services.length > 0 && (
          <FlatList
            data={services}
            renderItem={renderService}
            keyExtractor={(item) => item.idServicio}
            scrollEnabled={false}
            contentContainerStyle={styles.servicesList}
          />
        )}

        {/* EMPTY STATE */}
        {!error && services.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="car-outline"
                size={38}
                color="#1E88E5"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No hay servicios disponibles
            </Text>

            <Text style={styles.emptyText}>
              En este momento no tenemos servicios
              disponibles. Intenta nuevamente más tarde.
            </Text>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#1E88E5"
          />

          <Text style={styles.footerText}>
            Calidad y cuidado para tu vehículo
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
  },

  headerTextContainer: {
    flex: 1,
  },

  greeting: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 2,
  },

  userName: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 5,
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  banner: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 22,
    backgroundColor: '#1E88E5',
    minHeight: 185,
    padding: 20,
    overflow: 'hidden',
    flexDirection: 'row',
  },

  bannerContent: {
    flex: 1,
    zIndex: 2,
  },

  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    marginBottom: 8,
  },

  bannerSubtitle: {
    color: '#EAF4FF',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 245,
    marginBottom: 16,
  },

  bannerButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  bannerButtonText: {
    color: '#1E88E5',
    fontSize: 13,
    fontWeight: '700',
  },

  bannerIconContainer: {
    position: 'absolute',
    right: -10,
    bottom: -8,
    opacity: 0.25,
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#6B7280',
  },

  servicesList: {
    paddingHorizontal: 20,
  },

  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  serviceImage: {
    width: '100%',
    height: 165,
  },

  serviceContent: {
    padding: 15,
  },

  serviceName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 5,
  },

  serviceDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    marginBottom: 12,
  },

  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },

  servicePrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E88E5',
  },

  errorContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#991B1B',
  },

  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },

  emptyContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 30,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    textAlign: 'center',
  },

  footer: {
    marginTop: 25,
    marginHorizontal: 20,
    paddingVertical: 17,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  footerText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },

  bottomSpace: {
    height: 30,
  },
});

export default HomeScreen;

