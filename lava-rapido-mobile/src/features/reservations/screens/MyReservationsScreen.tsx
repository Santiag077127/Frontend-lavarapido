
import React, {
  useCallback,
  useContext,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { ThemeContext } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import BackButton from '../../../components/common/BackButton';
import ConfirmationModal from '../../../components/notifications/ConfirmationModal';
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider';
import api, { classifyApiError, type ApiErrorKind } from '../../../services/api';

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

export default function MyReservationsScreen() {
  const navigation = useNavigation<any>();

  const { theme, darkMode } = useContext(ThemeContext);
  const { t } = useTranslation();

  const { width } = useWindowDimensions();

  const [reservations, setReservations] = useState<
    ReservationResponse[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<ApiErrorKind | null>(null);

  const [cancellingId, setCancellingId] = useState<
    string | null
  >(null);
  const [pendingCancellation, setPendingCancellation] = useState<ReservationResponse | null>(null);

  const primaryColor = theme.primary;
  const backgroundColor = theme.background;
  const cardColor = theme.card;
  const textColor = theme.text;
  const mutedColor = theme.textSecondary;
  const borderColor = theme.border;

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

        setError(null);

        /**
         * Obtener usuario autenticado.
         */
        const profileResponse =
          await api.get<ProfileResponse>(
            '/api/users/profile'
          );

        const userId =
          profileResponse.data?.userId;



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



        /**
         * Aseguramos que siempre trabajemos con
         * un arreglo.
         */
        const reservationsData =
          Array.isArray(data)
            ? data
            : (() => { throw new Error('invalid-reservations-response'); })();

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


        const kind = classifyApiError(err);
        if (kind !== 'unauthorized') setError(kind);
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
  useFocusEffect(
    useCallback(() => {
      void loadReservations();
    }, [loadReservations]),
  );

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
  const handleCancel = (reservation: ReservationResponse) => {
    setPendingCancellation(reservation);
  };

  const confirmCancel = async () => {
    const reservation = pendingCancellation;
    if (!reservation) return;
    setPendingCancellation(null);

    try {
      setCancellingId(reservation.idReserva);
      const updated = await reservationService.cancel(reservation.idReserva);
      setReservations(previous => previous.map(item =>
        item.idReserva === reservation.idReserva ? updated : item
      ));
      Alert.alert(
        t('mobile.reservations.cancelledTitle'),
        t('mobile.reservations.cancelledMessage'),
        undefined,
        'success',
      );
    } catch (err: any) {
      Alert.alert(
        t('mobile.reservations.cancelErrorTitle'),
        t('mobile.reservations.cancelError'),
        undefined,
        'error',
      );
    } finally {
      setCancellingId(null);
    }
  };

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
          label: t('mobile.reservationDetail.status.pending'),
          color: theme.warningText,
          background: theme.warningBackground,
          icon: 'time-outline' as const,
        };

      case 'ASIGNADA':
        return {
          label: t('mobile.reservationDetail.status.assigned'),
          color: theme.infoText,
          background: theme.infoBackground,
          icon: 'checkmark-circle-outline' as const,
        };

      case 'EN_PROCESO':
        return {
          label: t('mobile.reservationDetail.status.inProcess'),
          color: theme.inProgressText,
          background: theme.processBackground,
          icon: 'water-outline' as const,
        };

      case 'FINALIZADA':
        return {
          label: t('mobile.reservationDetail.status.finished'),
          color: theme.successText,
          background: theme.successBackground,
          icon: 'checkmark-done-circle-outline' as const,
        };

      case 'CANCELADA':
        return {
          label: t('mobile.reservationDetail.status.cancelled'),
          color: theme.errorText,
          background: theme.errorBackground,
          icon: 'close-circle-outline' as const,
        };

      default:
        return {
          label: t('mobile.reservations.unknown'),
          color: mutedColor,
          background: theme.interactiveSurface,
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
                  backgroundColor: theme.primarySoft,
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
                  t('mobile.reservations.serviceFallback')}
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
                {t('mobile.reservationDetail.reservation')} #
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
                backgroundColor: status.background,
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
        <View style={[styles.infoGrid, { backgroundColor: theme.primarySoft }]}>
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
                {t('mobile.reservations.date')}
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
                {t('mobile.reservations.time')}
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
                {t('mobile.reservations.vehicle')}
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
                {t('mobile.reservations.type')}
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
                {t('mobile.reservations.duration')}
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
                {t('mobile.home.minutes')}
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
          <View style={[styles.priceBlock, { backgroundColor: theme.primarySoft }]}>
            <Text
              style={[
                styles.priceLabel,
                {
                  color: mutedColor,
                },
              ]}
            >
              {t('mobile.reservations.total')}
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
              accessibilityRole="button"
              accessibilityLabel={cancelling ? `${t('mobile.reservations.cancelTitle')}: ${item.nombreServicio}, ${t('accessibility.inProgress')}` : `${t('mobile.reservations.cancelTitle')}: ${item.nombreServicio}`}
              accessibilityState={{ disabled: cancelling, busy: cancelling }}
              disabled={cancelling}
              onPress={() =>
                handleCancel(item)
              }
              style={[
                styles.cancelButton,
                {
                  borderColor: theme.errorText,
                  backgroundColor: theme.errorBackground,
                  opacity: cancelling
                    ? 0.6
                    : 1,
                },
              ]}
            >
              {cancelling ? (
                <ActivityIndicator
                  size="small"
                  color={theme.errorText}
                />
              ) : (
                <>
                  <Ionicons
                    name="close-outline"
                    size={18}
                    color={theme.errorText}
                  />

                  <Text
                    accessibilityLiveRegion="polite"
                    style={[
                      styles.cancelButtonText,
                      {
                        color: theme.errorText,
                      },
                    ]}
                  >
                    {t('mobile.reservations.cancel')}
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        <Pressable
          style={[styles.detailButton, { backgroundColor: primaryColor }]}
          onPress={() => navigation.navigate('ServiceDetails', { reservation: item })}
          accessibilityRole="button"
        >
          <Ionicons name="information-circle-outline" size={18} color={theme.onPrimary} />
          <Text style={[styles.detailButtonText, { color: theme.onPrimary }]}>
            {t('mobile.services.detail')}
          </Text>
        </Pressable>
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
          {t('mobile.reservations.loading')}
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
                theme.errorBackground,
            },
          ]}
        >
          <Ionicons
            name="cloud-offline-outline"
            size={42}
            color={theme.errorText}
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
          {t('mobile.reservations.loadErrorTitle')}
        </Text>

        <Text
          style={[
            styles.emptyDescription,
            {
              color: mutedColor,
            },
          ]}
        >
          {t(`apiErrors.${error}`)}
        </Text>

        <Pressable
          accessibilityRole="button"
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
            color={theme.onPrimary}
          />

          <Text
            style={
              [styles.primaryButtonText, { color: theme.onPrimary }]
            }
          >
            {t('mobile.reservations.retry')}
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
                theme.primarySoft,
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
          {t('mobile.reservations.emptyTitle')}
        </Text>

        <Text
          style={[
            styles.emptyDescription,
            {
              color: mutedColor,
            },
          ]}
        >
          {t('mobile.reservations.emptyText')}
        </Text>

        <Pressable
          accessibilityRole="button"
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
            color={theme.onPrimary}
          />

          <Text
            style={
              [styles.primaryButtonText, { color: theme.onPrimary }]
            }
          >
            {t('mobile.reservations.reserveService')}
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
        <BackButton
          accessibilityLabel={t('mobile.reservations.back')}
          onPress={() => navigation.goBack()}
        />

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
            {t('mobile.reservations.title')}
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              {
                color: mutedColor,
              },
            ]}
          >
            {t('mobile.reservations.subtitle')}
          </Text>
        </View>

        <View
          style={[
            styles.countBadge,
            {
              backgroundColor:
                theme.primarySoft,
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
        ListHeaderComponent={error ? (
          <View style={[styles.refreshError, { borderColor, backgroundColor: cardColor }]}>
            <Text style={{ color: textColor, flex: 1 }}>{`${t(`apiErrors.${error}`)} ${t('apiErrors.staleData')}`}</Text>
            <Pressable accessibilityRole="button" onPress={() => void loadReservations(false)}><Text style={{ color: primaryColor, fontWeight: '700' }}>{t('mobile.reservations.retry')}</Text></Pressable>
          </View>
        ) : null}
      />
      <ConfirmationModal
        visible={Boolean(pendingCancellation)}
        title={t('mobile.reservations.cancelTitle')}
        message={t('mobile.reservations.cancelQuestion', { service: pendingCancellation?.nombreServicio || t('mobile.reservations.serviceFallback') })}
        confirmLabel={t('mobile.reservations.yesCancel')}
        cancelLabel={t('mobile.reservations.no')}
        variant="danger"
        onConfirm={() => void confirmCancel()}
        onCancel={() => setPendingCancellation(null)}
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

  refreshError: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,

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
    gap: 12,
  },

  serviceTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  serviceTitleContent: {
    flex: 1,
    minWidth: 0,
  },

  serviceTitle: {
    fontSize: 18,
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
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
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
    gap: 9,
    padding: 10,
    borderRadius: 18,
  },

  infoItem: {
    width: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 4,
  },

  infoContent: {
    marginLeft: 8,
    flex: 1,
    minWidth: 0,
  },

  infoLabel: {
    fontSize: 11,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },

  cardFooter: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  priceBlock: {
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 9,
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
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },

  detailButton: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 14,
  },

  detailButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
