
import React, {
  useCallback,
  useContext,
  useRef,
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
import ScreenHeader from '../../../components/common/ScreenHeader';
import ConfirmationModal from '../../../components/notifications/ConfirmationModal';
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider';
import api, { classifyApiError, type ApiErrorKind } from '../../../services/api';

import {
  getReservationCancellationFailure,
  reservationService,
} from '../services/reservationService';
import ReservationCard from '../components/ReservationCard';
import { createCancellationPolicyAcceptance } from '../../auth/legalContent';
import { pendingCheckoutRecovery } from '../../../services/pendingCheckoutRecovery';

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
  const cancellationInProgress = useRef(false);

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
    if (cancellationInProgress.current) return;
    const reservation = pendingCancellation;
    if (!reservation) return;
    cancellationInProgress.current = true;
    setPendingCancellation(null);

    try {
      setCancellingId(reservation.idReserva);
      const outcome = await reservationService.cancelForCheckout(
        reservation.idReserva,
        createCancellationPolicyAcceptance(),
      );
      const updated = outcome.reservation;
      await pendingCheckoutRecovery.clear(
        reservation.idReserva,
        reservation.idUsuario,
      ).catch(() => {});
      setReservations(previous => previous.map(item =>
        item.idReserva === reservation.idReserva ? updated : item
      ));
      Alert.alert(
        t(outcome.result === 'ALREADY_CANCELLED'
          ? 'mobile.reservations.alreadyCancelledTitle'
          : 'mobile.reservations.cancelledTitle'),
        t(outcome.result === 'ALREADY_CANCELLED'
          ? 'mobile.reservations.alreadyCancelledMessage'
          : 'mobile.reservations.cancelledMessage'),
        undefined,
        'success',
      );
    } catch (err: any) {
      const kind = classifyApiError(err);
      const failure = getReservationCancellationFailure(err);
      const messageKey = failure.status === 409 && failure.code === 'PAGO_PENDIENTE'
        ? 'mobile.reservations.pendingPaymentError'
        : failure.status === 409 && failure.code === 'PAGO_APROBADO'
          ? 'mobile.reservations.approvedPaymentError'
          : failure.status === 409 && failure.code === 'RESERVA_NO_PENDIENTE'
            ? 'mobile.reservations.notPendingError'
            : failure.status === 403
              ? 'mobile.reservations.forbiddenError'
              : failure.status === 404
                ? 'mobile.reservations.notFoundError'
                : ['network', 'server_unavailable', 'timeout', 'server'].includes(kind)
                  ? `apiErrors.${kind}`
                  : 'mobile.reservations.cancelError';
      Alert.alert(
        t('mobile.reservations.cancelErrorTitle'),
        t(messageKey),
        undefined,
        'error',
      );
    } finally {
      cancellationInProgress.current = false;
      setCancellingId(null);
    }
  };

  const canCancel = (estado: ReservationStatus) => estado === 'PENDIENTE';

  /**
   * ============================================================
   * RENDER RESERVATION
   * ============================================================
   */
  const renderReservation = ({ item }: { item: ReservationResponse }) => (
    <ReservationCard
      reservation={item}
      cancelling={cancellingId === item.idReserva}
      cancellable={canCancel(item.estado)}
      onCancel={handleCancel}
      onOpenDetails={(selectedReservation) =>
        navigation.navigate('ServiceDetails', { reservation: selectedReservation })
      }
    />
  );

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
      <ScreenHeader
        accessibilityLabel={t('mobile.reservations.back')}
        onBack={() => navigation.goBack()}
        right={<View style={[styles.countBadge, { backgroundColor: theme.primarySoft }]}><Text style={[styles.countText, { color: primaryColor }]}>{reservations.length}</Text></View>}
        style={{ marginHorizontal: width < 360 ? 16 : 20 }}
        subtitle={t('mobile.reservations.subtitle')}
        title={t('mobile.reservations.title')}
      />

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
        ) : undefined}
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

});
