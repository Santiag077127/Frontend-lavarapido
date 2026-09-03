
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../../navigation/types';

import { images } from '../../../assets/images';

type ServiceDetailRouteProp = RouteProp<
  RootStackParamList,
  'ServiceDetail'
>;

type ServiceDetailNavigationProp =
  NavigationProp<RootStackParamList>;

export default function ServiceDetailScreen() {
  const navigation =
    useNavigation<ServiceDetailNavigationProp>();

  const route = useRoute<ServiceDetailRouteProp>();

  const { service } = route.params;

  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const scaleAnim = useRef(
    new Animated.Value(0.95)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleReservation = () => {
    navigation.navigate('Reservation', {
      service,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: scaleAnim,
                },
              ],
            },
          ]}
        >
          {/* Imagen local de presentación */}
          <View style={styles.imageContainer}>
            <Image
              source={images.ServicioBasico}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Información del servicio */}
          <View style={styles.content}>
            <Text style={styles.title}>
              {service.nombre}
            </Text>

            <Text style={styles.description}>
              {service.descripcion ||
                'No hay una descripción disponible para este servicio.'}
            </Text>

            {/* Información principal */}
            <View style={styles.infoRow}>
              {/* Precio */}
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  Precio
                </Text>

                <Text style={styles.price}>
                  $
                  {service.precio.toLocaleString(
                    'es-CO'
                  )}
                </Text>
              </View>

              {/* Duración */}
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  Duración
                </Text>

                <Text style={styles.duration}>
                  {service.duracionMinutos} minutos
                </Text>
              </View>
            </View>

            {/* Estado */}
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  service.estado
                    ? styles.statusActive
                    : styles.statusInactive,
                ]}
              />

              <Text style={styles.statusText}>
                {service.estado
                  ? 'Servicio disponible'
                  : 'Servicio no disponible'}
              </Text>
            </View>

            {/* Reservar */}
            <TouchableOpacity
              style={[
                styles.reserveButton,
                !service.estado &&
                  styles.reserveButtonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={!service.estado}
              onPress={handleReservation}
            >
              <Text style={styles.reserveButtonText}>
                {service.estado
                  ? 'Reservar servicio'
                  : 'Servicio no disponible'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,

    elevation: 5,
  },

  imageContainer: {
    width: '100%',
    height: 230,
    backgroundColor: '#E5E7EB',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  content: {
    padding: 22,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 15,
  },

  infoItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },

  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  duration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },

  statusActive: {
    backgroundColor: '#22C55E',
  },

  statusInactive: {
    backgroundColor: '#EF4444',
  },

  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },

  reserveButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reserveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },

  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
