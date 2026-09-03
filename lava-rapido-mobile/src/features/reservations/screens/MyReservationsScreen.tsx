
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '../../../theme/ThemeContext';
import api from '../../../services/api';

import { reservationService } from '../services/reservationService';

import type {
  ReservationResponse,
  ReservationStatus,
} from '../types/reservation.types';

interface ProfileResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string | null;
}

const SAFE_GREEN = '#16A34A';
const SAFE_RED = '#DC2626';
const SAFE_ORANGE = '#F59E0B';
const SAFE_BLUE = '#2563EB';
const SAFE_GRAY = '#64748B';
const SAFE_WHITE = '#FFFFFF';

export default function MyReservationsScreen() {
  const navigation = useNavigation<any>();

  const { theme, darkMode } = useContext(ThemeContext);

  const { width } = useWindowDimensions();

  const [reservations, setReservations] = useState<
    ReservationResponse[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(false);

  const [cancellingId, setCancellingId] = useState<
    string | null
  >(null);

  const primaryColor =
    theme?.primary || SAFE_GREEN;

  const backgroundColor =
    theme?.background || '#F5F7FA';

  const cardColor =
    theme?.card || SAFE_WHITE;

  const textColor =
    theme?.text || '#111827';

  const mutedColor = darkMode
    ? '#98A2B3'
    : SAFE_GRAY;

  const borderColor = darkMode
    ? '#303B4A'
    : '#E2E8F0';

  /**
   * ============================================================
   * CARGAR RESERVAS
   * ============================================================
   */
  const loadReservations = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(false);

        /**
         * Obtener usuario autenticado.
         */
        const profileResponse =
          await api.get<ProfileResponse>(
            '/api/users/profile'
          );

        const userId =
          profileResponse.data?.userId;

        console.log(
          'USUARIO RESERVAS:',
          userId
        );

        if (!userId) {
          throw new Error(
            'No se encontró el ID del usuario autenticado.'
          );
        }

        /**
         * Obtener reservas del usuario.
         */
        const data =
          await reservationService.getByUser(
            userId
          );

        console.log(
          'RESERVAS RECIBIDAS:',
          JSON.stringify(data, null, 2)
        );

        /**
         * Aseguramos que siempre trabajemos con
         * un arreglo.
         */
        const reservationsData =
          Array.isArray(data)
            ? data
            : [];

        /**
         * Ordenar:
         * reservas más recientes primero.
         */
        const sortedReservations = [
          ...reservationsData,
        ].sort((a, b) => {
          const dateA = new Date(
            `${a.fechaReserva}T${a.horaReserva}`
          ).getTime();

          const dateB = new Date(
            `${b.fechaReserva}T${b.horaReserva}`
          ).getTime();

          return dateB - dateA;
        });

        setReservations(
          sortedReservations
        );
      } catch (err: any) {
        console.log(
          'ERROR CARGANDO RESERVAS:',
          err?.response?.data ||
            err?.message ||
            err
        );

        setReservations([]);
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /**
   * ============================================================
   * CARGA INICIAL
   * ============================================================
   */
  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  /**
   * ============================================================
   * REFRESH
   * ============================================================
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    loadReservations(false);
  }, [loadReservations]);

  /**
   * ============================================================
   * CANCELAR RESERVA
   * ============================================================
   */
  const handleCancel = (
    reservation: ReservationResponse
  ) => {
    Alert.alert(
      'Cancelar reserva',
      `¿Seguro que deseas cancelar la reserva de ${
        reservation.nombreServicio ||
        'este servicio'
      }?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingId(
                reservation.idReserva
              );

              console.log(
                'CANCELANDO RESERVA:',
                reservation.idReserva
              );

              const updated =
                await reservationService.cancel(
                  reservation.idReserva
                );

              console.log(
                'RESERVA CANCELADA:',
                updated
              );

              /**
               * Actualizar únicamente la reserva
               * cancelada.
               */
              setReservations(previous =>
                previous.map(item =>
                  item.idReserva ===
                  reservation.idReserva
                    ? updated
                    : item
                )
              );

              Alert.alert(
                'Reserva cancelada',
                'La reserva fue cancelada correctamente.'
              );
            } catch (err: any) {
              console.log(
                'ERROR CANCELANDO RESERVA:',
                err?.response?.data ||
                  err?.message ||
                  err
              );

              const responseData =
                err?.response?.data;

              const message =
                responseData?.message ||
                responseData?.error ||
                responseData?.detail ||
                'No fue posible cancelar la reserva.';

              Alert.alert(
                'No se pudo cancelar',
                message
              );
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  /**
   * ============================================================
   * FORMATEAR FECHA
   * ============================================================
   */
  const formatDate = (
    date: string
  ) => {
    if (!date) {
      return '--';
    }

    const parts = date.split('-');

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  /**
   * ============================================================
   * FORMATEAR HORA
   * ============================================================
   */
  const formatTime = (
    time: string
  ) => {
    if (!time) {
      return '--';
    }

    return time.substring(0, 5);
  };

  /**
   * ============================================================
   * FORMATEAR PRECIO
   * ============================================================
   */
  const formatPrice = (
    price: number
  ) => {
    return `$${Number(price || 0).toLocaleString(
      'es-CO'
    )}`;
  };

  /**
   * ============================================================
   * CONFIGURACIÓN DEL ESTADO
   * ============================================================
   */
  const getStatusConfig = (
    estado: ReservationStatus
  ) => {
    switch (estado) {
      case 'PENDIENTE':
        return {
          label: 'Pendiente',
          color: SAFE_ORANGE,
          icon: 'time-outline' as const,
        };

      case 'ASIGNADA':
        return {
          label: 'Asignada',
          color: SAFE_BLUE,
          icon: 'checkmark-circle-outline' as const,
        };

      case 'EN_PROCESO':
        return {
          label: 'En proceso',
          color: SAFE_BLUE,
          icon: 'water-outline' as const,
        };

      case 'FINALIZADA':
        return {
          label: 'Finalizada',
          color: SAFE_GREEN,
          icon: 'checkmark-done-circle-outline' as const,
        };

      case 'CANCELADA':
        return {
          label: 'Cancelada',
          color: SAFE_RED,
          icon: 'close-circle-outline' as const,
        };

      default:
        return {
          label: estado || 'Desconocido',
          color: mutedColor,
          icon: 'help-circle-outline' as const,
        };
    }
  };

  /**
   * ============================================================
   * ¿SE PUEDE CANCELAR?
   * ============================================================
   */
  const canCancel = (
    estado: ReservationStatus
  ) => {
    return (
      estado === 'PENDIENTE' ||
      estado === 'ASIGNADA'
    );
  };

  /**
   * ============================================================
   * RENDER RESERVA
   * ============================================================
   */
  const renderReservation = ({
    item,
  }: {
    item: ReservationResponse;
  }) => {
    const status =
      getStatusConfig(item.estado);

    const cancelling =
      cancellingId === item.idReserva;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: cardColor,
            borderColor,
          },
        ]}
      >
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <View
            style={styles.serviceTitleContainer}
          >
            <View
              style={[
                styles.serviceIcon,
                {
                  backgroundColor:
                    `${primaryColor}18`,
                },
              ]}
            >
              <Ionicons
                name="car-sport-outline"
                size={24}
                color={primaryColor}
              />
            </View>

            <View
              style={styles.serviceTitleContent}
            >
              <Text
                style={[
                  styles.serviceTitle,
                  {
                    color: textColor,
                  },
                ]}
                numberOfLines={2}
              >
                {item.nombreServicio ||
                  'Servicio de lavado'}
              </Text>

              <Text
                style={[
                  styles.reservationId,
                  {
                    color: mutedColor,
                  },
                ]}
                numberOfLines={1}
              >
                Reserva #
                {item.idReserva
                  ? item.idReserva.slice(0, 8)
                  : '--------'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  `${status.color}18`,
              },
            ]}
          >
            <Ionicons
              name={status.icon}
              size={15}
              color={status.color}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: status.color,
                },
              ]}
            >
              {status.label}
            </Text>
          </View>
        </View>

        {/* DESCRIPCIÓN */}
        {!!item.descripcionServicio && (
          <Text
            style={[
              styles.description,
              {
                color: mutedColor,
              },
            ]}
            numberOfLines={2}
          >
            {item.descripcionServicio}
          </Text>
        )}

        {/* INFORMACIÓN */}
        <View style={styles.infoGrid}>
          {/* FECHA */}
          <View style={styles.infoItem}>
            <Ionicons
              name="calendar-outline"
              size={19}
              color={primaryColor}
            />

            <View
              style={styles.infoContent}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: mutedColor,
                  },
                ]}
              >
                Fecha
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color: textColor,
                  },
                ]}
              >
                {formatDate(
                  item.fechaReserva
                )}
              </Text>
            </View>
          </View>

          {/* HORA */}
          <View style={styles.infoItem}>
            <Ionicons
              name="time-outline"
              size={19}
              color={primaryColor}
            />

            <View
              style={styles.infoContent}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: mutedColor,
                  },
                ]}
              >
                Hora
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color: textColor,
                  },
                ]}
              >
                {formatTime(
                  item.horaReserva
                )}
              </Text>
            </View>
          </View>

          {/* VEHÍCULO */}
          <View style={styles.infoItem}>
            <Ionicons
              name="car-outline"
              size={19}
              color={primaryColor}
            />

            <View
              style={styles.infoContent}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: mutedColor,
                  },
                ]}
              >
                Vehículo
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color: textColor,
                  },
                ]}
              >
                {item.placaVehiculo ||
                  '--'}
              </Text>
            </View>
          </View>

          {/* TIPO DE VEHÍCULO */}
          <View style={styles.infoItem}>
            <Ionicons
              name="car-sport-outline"
              size={19}
              color={primaryColor}
            />

            <View
              style={styles.infoContent}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: mutedColor,
                  },
                ]}
              >
                Tipo
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color: textColor,
                  },
                ]}
              >
                {item.tipoVehiculo ||
                  '--'}
              </Text>
            </View>
          </View>

          {/* DURACIÓN */}
          <View style={styles.infoItem}>
            <Ionicons
              name="hourglass-outline"
              size={19}
              color={primaryColor}
            />

            <View
              style={styles.infoContent}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: mutedColor,
                  },
                ]}
              >
                Duración
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color: textColor,
                  },
                ]}
              >
                {item.duracionServicio || 0}{' '}
                min
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View
          style={[
            styles.cardFooter,
            {
              borderTopColor:
                borderColor,
            },
          ]}
        >
          <View>
            <Text
              style={[
                styles.priceLabel,
                {
                  color: mutedColor,
                },
              ]}
            >
              Total
            </Text>

            <Text
              style={[
                styles.price,
                {
                  color: primaryColor,
                },
              ]}
            >
              {formatPrice(
                item.precioServicio
              )}
            </Text>
          </View>

          {canCancel(item.estado) && (
            <Pressable
              disabled={cancelling}
              onPress={() =>
                handleCancel(item)
              }
              style={[
                styles.cancelButton,
                {
                  borderColor: SAFE_RED,
                  opacity: cancelling
                    ? 0.6
                    : 1,
                },
              ]}
            >
              {cancelling ? (
                <ActivityIndicator
                  size="small"
                  color={SAFE_RED}
                />
              ) : (
                <>
                  <Ionicons
                    name="close-outline"
                    size={18}
                    color={SAFE_RED}
                  />

                  <Text
                    style={[
                      styles.cancelButtonText,
                      {
                        color: SAFE_RED,
                      },
                    ]}
                  >
                    Cancelar
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  /**
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={primaryColor}
        />

        <Text
          style={[
            styles.loadingText,
            {
              color: textColor,
            },
          ]}
        >
          Cargando tus reservas...
        </Text>
      </View>
    );
  }

  /**
   * ============================================================
   * ERROR
   * ============================================================
   */
  if (
    error &&
    reservations.length === 0
  ) {
    return (
      <View
        style={[
          styles.centerContainer,
          {
            backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.emptyIcon,
            {
              backgroundColor:
                `${SAFE_RED}15`,
            },
          ]}
        >
          <Ionicons
            name="cloud-offline-outline"
            size={42}
            color={SAFE_RED}
          />
        </View>

        <Text
          style={[
            styles.emptyTitle,
            {
              color: textColor,
            },
          ]}
        >
          No pudimos cargar tus reservas
        </Text>

        <Text
          style={[
            styles.emptyDescription,
            {
              color: mutedColor,
            },
          ]}
        >
          Verifica tu conexión e inténtalo
          nuevamente.
        </Text>

        <Pressable
          onPress={() =>
            loadReservations()
          }
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                primaryColor,
            },
          ]}
        >
          <Ionicons
            name="refresh-outline"
            size={19}
            color={SAFE_WHITE}
          />

          <Text
            style={
              styles.primaryButtonText
            }
          >
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  /**
   * ============================================================
   * SIN RESERVAS
   * ============================================================
   */
  if (reservations.length === 0) {
    return (
      <View
        style={[
          styles.centerContainer,
          {
            backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.emptyIcon,
            {
              backgroundColor:
                `${primaryColor}15`,
            },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={42}
            color={primaryColor}
          />
        </View>

        <Text
          style={[
            styles.emptyTitle,
            {
              color: textColor,
            },
          ]}
        >
          No tienes reservas
        </Text>

        <Text
          style={[
            styles.emptyDescription,
            {
              color: mutedColor,
            },
          ]}
        >
          Cuando reserves un servicio,
          aparecerá aquí.
        </Text>

        <Pressable
          onPress={() =>
            navigation.navigate('Home')
          }
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                primaryColor,
            },
          ]}
        >
          <Ionicons
            name="car-outline"
            size={19}
            color={SAFE_WHITE}
          />

          <Text
            style={
              styles.primaryButtonText
            }
          >
            Reservar un servicio
          </Text>
        </Pressable>
      </View>
    );
  }

  /**
   * ============================================================
   * PANTALLA
   * ============================================================
   */
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
        },
      ]}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal:
              width < 360 ? 16 : 20,
          },
        ]}
      >
        <Pressable
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={textColor}
          />
        </Pressable>

        <View
          style={styles.headerTextContainer}
        >
          <Text
            style={[
              styles.headerTitle,
              {
                color: textColor,
              },
            ]}
          >
            Mis reservas
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              {
                color: mutedColor,
              },
            ]}
          >
            Consulta y administra tus
            servicios
          </Text>
        </View>

        <View
          style={[
            styles.countBadge,
            {
              backgroundColor:
                `${primaryColor}18`,
            },
          ]}
        >
          <Text
            style={[
              styles.countText,
              {
                color: primaryColor,
              },
            ]}
          >
            {reservations.length}
          </Text>
        </View>
      </View>

      {/* LISTA */}
      <FlatList
        data={reservations}
        keyExtractor={item =>
          item.idReserva
        }
        renderItem={renderReservation}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal:
              width < 360 ? 14 : 18,
          },
        ]}
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      />
    </View>
  );
}

/**
 * ============================================================
 * ESTILOS
 * ============================================================
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '600',
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 24,
  },

  primaryButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  primaryButtonText: {
    color: SAFE_WHITE,
    fontSize: 15,
    fontWeight: '700',
  },

  header: {
    minHeight: 86,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 4,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
  },

  headerSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },

  countText: {
    fontSize: 14,
    fontWeight: '800',
  },

  listContent: {
    paddingTop: 4,
    paddingBottom: 30,
  },

  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },

  serviceTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  serviceIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  serviceTitleContent: {
    flex: 1,
    minWidth: 0,
  },

  serviceTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 21,
  },

  reservationId: {
    fontSize: 11,
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 13,
  },

  infoGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
  },

  infoItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },

  infoContent: {
    marginLeft: 8,
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  cardFooter: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceLabel: {
    fontSize: 11,
    marginBottom: 2,
  },

  price: {
    fontSize: 20,
    fontWeight: '800',
  },

  cancelButton: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

