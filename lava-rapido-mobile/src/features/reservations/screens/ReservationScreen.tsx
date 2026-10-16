
import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import DateTimePicker from '@react-native-community/datetimepicker';

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import type {
  NavigationProp,
  RouteProp,
} from '@react-navigation/native';

import { ThemeContext } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import BackButton from '../../../components/common/BackButton';
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider';

import { vehicleService } from '../../vehicles/services/vehicleService';
import type { Vehicle } from '../../vehicles/types/vehicle.types';

import { reservationService } from '../services/reservationService';
import { classifyReservationCreationError } from '../../../services/reservationErrors';
import { classifyApiError } from '../../../services/api';
import { serviceService } from '../../../services/serviceService';
import {
  getReservationTimeError,
  isPastLocalDate,
  isPastLocalTime,
  isSameLocalDate,
  RESERVATION_MAX_HOUR,
  RESERVATION_MIN_HOUR,
  startOfLocalDay,
} from '../../../services/reservationSchedule';

import type {
  CreateReservationData,
} from '../types/reservation.types';

import type {
  RootStackParamList,
} from '../../../navigation/types';

import type {
  Service,
} from '../../services/types/service.types';

// ============================================================
// TIPOS DE RUTA
// ============================================================

type ReservationRouteProp =
  RouteProp<
    RootStackParamList,
    'Reservation'
  >;

type ReservationNavigationProp =
  NavigationProp<RootStackParamList>;

// ============================================================
// CONSTANTES
// ============================================================

const MIN_HOUR = RESERVATION_MIN_HOUR;
const MAX_HOUR = RESERVATION_MAX_HOUR;

const vehicleTypeKeys: Record<string, string> = {
  CARRO: 'vehicles.types.car',
  CAMIONETA: 'vehicles.types.pickup',
  MOTO: 'vehicles.types.motorcycle',
  MOTOCARRO: 'vehicles.types.motortricycle',
  FURGONETA: 'vehicles.types.van',
  PESADO: 'vehicles.types.heavy',
};

// ============================================================
// COMPONENTE
// ============================================================

export default function ReservationScreen() {
  const navigation =
    useNavigation<ReservationNavigationProp>();

  const route =
    useRoute<ReservationRouteProp>();

  const { darkMode, theme } =
    useContext(ThemeContext);
  const { t } = useTranslation();

  // ----------------------------------------------------------
  // SERVICIO RECIBIDO
  // ----------------------------------------------------------

  const service: Service | undefined =
    route.params?.service;

  const serviceId =
    service?.idServicio ?? '';

  const serviceName =
    service?.nombre ??
    t('mobile.reservation.service');

  const serviceDescription =
    service?.descripcion ??
    '';

  const servicePrice =
    service?.precio ??
    null;

  const serviceDuration =
    service?.duracionMinutos ??
    0;

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);
  const activeVehicles = useMemo(() => vehicles.filter((vehicle) => vehicle.estado === true), [vehicles]);

  const [
    selectedVehicleId,
    setSelectedVehicleId,
  ] = useState<string>('');

  const [selectedDate, setSelectedDate] =
    useState<Date>(new Date());

  const [selectedTime, setSelectedTime] =
    useState<Date>(() => {
      const date = new Date();

      date.setHours(8);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);

      return date;
    });

  const [
    showDatePicker,
    setShowDatePicker,
  ] = useState(false);

  const [
    showTimePicker,
    setShowTimePicker,
  ] = useState(false);

  const [
    loadingVehicles,
    setLoadingVehicles,
  ] = useState(true);

  const [
    creatingReservation,
    setCreatingReservation,
  ] = useState(false);
  const reservationSubmissionInProgress = useRef(false);

  // ==========================================================
  // COLORES
  // ==========================================================

  const colors = useMemo(
    () => ({
      background: theme.background,
      card: theme.card,
      text: theme.text,
      secondaryText: theme.textSecondary,
      border: theme.border,
      primary: theme.primary,
      onPrimary: theme.onPrimary,
      inputBackground: theme.inputBackground,
      danger: theme.errorText,

      success: theme.success,
    }),
    [darkMode, theme],
  );

  // ==========================================================
  // FORMATO DE FECHA
  // ==========================================================

  const formatDate = (
    date: Date,
  ): string => {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        date.getDate(),
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // ==========================================================
  // FORMATO DE HORA
  // ==========================================================

  const formatTime = (
    date: Date,
  ): string => {
    const hours =
      String(
        date.getHours(),
      ).padStart(2, '0');

    const minutes =
      String(
        date.getMinutes(),
      ).padStart(2, '0');

    return `${hours}:${minutes}:00`;
  };

  // ==========================================================
  // COMPROBAR SI ES HOY
  // ==========================================================

  // ==========================================================
  // CARGAR VEHÍCULOS
  // ==========================================================

  const loadVehicles =
    useCallback(
      async () => {
        try {
          setLoadingVehicles(
            true,
          );

          const response =
            await vehicleService.getMyVehicles();
          setVehicles(response);

          if (
            response.some((vehicle) => vehicle.estado === true)
          ) {
            setSelectedVehicleId(
              response.find((vehicle) => vehicle.estado === true)!
                .idVehiculo,
            );
          } else {
            Alert.alert(
              t('mobile.reservation.noVehiclesTitle'),
              t('mobile.reservation.noVehiclesMessage'),
              [
                {
                  text: t('mobile.reservation.registerVehicle'),
                  onPress: () => {
                    navigation.navigate(
                      'AddVehicle',
                    );
                  },
                },
                {
                  text: t('mobile.reservation.close'),
                  style: 'cancel',
                },
              ],
              'info',
            );
          }
        } catch (
          error: any
        ) {
          const kind = classifyApiError(error);

          Alert.alert(
            t('mobile.reservation.error'),
            ['network', 'server_unavailable', 'timeout', 'server'].includes(kind)
              ? t(`apiErrors.${kind}`)
              : t('mobile.reservation.vehicleLoadError'),
            undefined,
            'error',
          );
        } finally {
          setLoadingVehicles(
            false,
          );
        }
      },
      [navigation, t],
    );

  // ==========================================================
  // RECARGAR VEHÍCULOS AL ENTRAR
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [loadVehicles]),
  );

  // ==========================================================
  // VALIDAR HORARIO
  // ==========================================================

  const validateTime =
    (): boolean => {
      const timeError = getReservationTimeError(selectedTime, serviceDuration);

      if (timeError === 'beforeOpening') {
        Alert.alert(
          t('mobile.reservation.invalidSchedule'),
          t('mobile.reservation.startsAfter', { hour: MIN_HOUR }),
          undefined,
          'warning',
        );

        return false;
      }

      if (timeError === 'afterClosing') {
        Alert.alert(
          t('mobile.reservation.invalidSchedule'),
          t('mobile.reservation.startsBefore', { hour: MAX_HOUR }),
          undefined,
          'warning',
        );

        return false;
      }

      // --------------------------------------------------------
      // VALIDAR DURACIÓN
      // --------------------------------------------------------

      if (
        serviceDuration > 0
      ) {
        if (timeError === 'durationAfterClosing') {
          Alert.alert(
            t('mobile.reservation.invalidSchedule'),
            t('mobile.reservation.endsAfter', { hour: MAX_HOUR }),
            undefined,
            'warning',
          );

          return false;
        }
      }

      return true;
    };

  // ==========================================================
  // CAMBIO DE FECHA
  // ==========================================================

  const handleDateChange = (
    event: any,
    date?: Date,
  ) => {
    setShowDatePicker(
      Platform.OS === 'ios',
    );

    if (!date) {
      return;
    }

    if (isPastLocalDate(date)) {
      Alert.alert(
        t('mobile.reservation.invalidDate'),
        t('mobile.reservation.pastDate'),
        undefined,
        'warning',
      );
      return;
    }

    setSelectedDate(date);
    if (isSameLocalDate(date, new Date()) && isPastLocalTime(selectedTime, date)) {
      Alert.alert(
        t('mobile.reservation.invalidTime'),
        t('mobile.reservation.pastTime'),
        undefined,
        'warning',
      );
    }
  };

  // ==========================================================
  // CAMBIO DE HORA
  // ==========================================================

  const handleTimeChange = (
    event: any,
    date?: Date,
  ) => {
    setShowTimePicker(
      Platform.OS === 'ios',
    );

    if (!date) {
      return;
    }

    if (isPastLocalTime(date, selectedDate)) {
      Alert.alert(
        t('mobile.reservation.invalidTime'),
        t('mobile.reservation.pastTime'),
        undefined,
        'warning',
      );
      return;
    }

    const timeError = getReservationTimeError(date, serviceDuration);
    if (timeError) {
      Alert.alert(
        t('mobile.reservation.invalidSchedule'),
        timeError === 'beforeOpening'
          ? t('mobile.reservation.startsAfter', { hour: MIN_HOUR })
          : timeError === 'afterClosing'
            ? t('mobile.reservation.startsBefore', { hour: MAX_HOUR })
            : t('mobile.reservation.endsAfter', { hour: MAX_HOUR }),
        undefined,
        'warning',
      );
      return;
    }

    setSelectedTime(date);
  };

  // ==========================================================
  // CREAR RESERVA
  // ==========================================================

  const handleCreateReservation =
    async () => {
      if (reservationSubmissionInProgress.current) {
        return;
      }

      reservationSubmissionInProgress.current = true;
      try {


















      // --------------------------------------------------------
      // VALIDAR SERVICIO
      // --------------------------------------------------------

      if (!serviceId) {
        Alert.alert(
          t('mobile.reservation.error'),
          t('mobile.reservation.serviceMissing'),
          undefined,
          'error',
        );



        return;
      }

      // --------------------------------------------------------
      // VALIDAR VEHÍCULO
      // --------------------------------------------------------

      if (
        !selectedVehicleId
      ) {
        Alert.alert(
          t('mobile.reservation.selectVehicleTitle'),
          t('mobile.reservation.selectVehicleMessage'),
          undefined,
          'warning',
        );

        return;
      }

      const selectedVehicle = activeVehicles.find((vehicle) => vehicle.idVehiculo === selectedVehicleId);
      if (!selectedVehicle || service?.estado !== true) {
        Alert.alert(
          t('mobile.reservation.error'),
          selectedVehicle ? t('mobile.serviceDetail.unavailable') : t('vehicles.status.inactive'),
          undefined,
          'error',
        );
        return;
      }

      // --------------------------------------------------------
      // VALIDAR FECHA
      // --------------------------------------------------------

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0,
      );

      const reservationDate =
        new Date(
          selectedDate,
        );

      reservationDate.setHours(
        0,
        0,
        0,
        0,
      );

      if (
        reservationDate <
        today
      ) {
        Alert.alert(
          t('mobile.reservation.invalidDate'),
          t('mobile.reservation.pastDate'),
          undefined,
          'warning',
        );

        return;
      }

      // --------------------------------------------------------
      // VALIDAR HORA SI ES HOY
      // --------------------------------------------------------

      if (isPastLocalTime(selectedTime, selectedDate)) {
        Alert.alert(
          t('mobile.reservation.invalidTime'),
          t('mobile.reservation.pastTime'),
          undefined,
          'warning',
        );

        return;
      }

      // --------------------------------------------------------
      // VALIDAR HORARIO
      // --------------------------------------------------------

      if (
        !validateTime()
      ) {
        return;
      }

      setCreatingReservation(true);
      try {
        const [currentService, currentVehicles] = await Promise.all([
          serviceService.getById(serviceId),
          vehicleService.getMyVehicles(),
        ]);
        const currentVehicle = currentVehicles.find((vehicle) => vehicle.idVehiculo === selectedVehicleId);
        if (currentService.estado !== true || !currentVehicle || currentVehicle.estado !== true) {
          setVehicles(currentVehicles);
          Alert.alert(
            t('mobile.reservation.error'),
            currentService.estado !== true ? t('mobile.serviceDetail.unavailable') : t('vehicles.status.inactive'),
            undefined,
            'error',
          );
          return;
        }
      } catch (availabilityError: any) {
        const status = availabilityError?.response?.status;
        const kind = classifyApiError(availabilityError);
        if (['network', 'server_unavailable', 'timeout', 'server'].includes(kind)) {
          Alert.alert(
            t('mobile.reservation.error'),
            t(`apiErrors.${kind}`),
            undefined,
            'error',
          );
          return;
        }
        if ([400, 404, 409, 422].includes(status)) {
          Alert.alert(
            t('mobile.reservation.error'),
            t('mobile.serviceDetail.unavailable'),
            undefined,
            'error',
          );
        } else {
          Alert.alert(
            t('mobile.reservation.error'),
            t('mobile.reservation.vehicleLoadError'),
            undefined,
            'error',
          );
        }
        return;
      }

      // --------------------------------------------------------
      // REQUEST
      // --------------------------------------------------------

      const reservationData:
        CreateReservationData =
        {
          fkIdVehiculo:
            selectedVehicleId,

          fkIdServicio:
            serviceId,

          fechaReserva:
            formatDate(
              selectedDate,
            ),

          horaReserva:
            formatTime(
              selectedTime,
            ),
        };

      try {
        const response =
          await reservationService.create(
            reservationData,
          );

        navigation.navigate('ReservationPayment', {
          reservation: response,
        });
      } catch (
        error: any
      ) {
        const kind = classifyReservationCreationError(error);
        if (kind === 'overlap') {
          Alert.alert(
            t('mobile.reservation.overlapTitle'),
            t('mobile.reservation.overlapMessage'),
            [
              {
                text: t('mobile.reservation.changeSchedule'),
                style: 'default',
              },
            ],
            'warning',
          );

          return;
        }

        if (kind === 'conflict') {
          Alert.alert(
            t('mobile.reservation.createErrorTitle'),
            t('mobile.reservation.genericCreateError'),
            undefined,
            'error',
          );

          return;
        }

        if (kind === 'invalid') {
          Alert.alert(
            t('mobile.reservation.invalidData'),
            t('mobile.reservation.genericCreateError'),
            undefined,
            'error',
          );
          return;
        }

        if (kind === 'unauthorized') {
          Alert.alert(
            t('mobile.reservation.expiredTitle'),
            t('mobile.reservation.expiredMessage'),
            undefined,
            'error',
          );

          return;
        }

        if (kind === 'server') {
          Alert.alert(
            t('mobile.reservation.serverTitle'),
            t('mobile.reservation.serverMessage'),
            undefined,
            'error',
          );

          return;
        }

        if (kind === 'timeout' || kind === 'network' || kind === 'server_unavailable') {
          Alert.alert(
            t('mobile.reservation.createErrorTitle'),
            t(`apiErrors.${kind}`),
            undefined,
            'error',
          );
          return;
        }

        Alert.alert(
          t('mobile.reservation.createErrorTitle'),
          t('mobile.reservation.genericCreateError'),
          undefined,
          'error',
        );
      }

      } finally {
        setCreatingReservation(false);
        reservationSubmissionInProgress.current = false;
      }
    };

  // ==========================================================
  // PRECIO
  // ==========================================================

  const formattedPrice =
    servicePrice !== null
      ? `$${servicePrice.toLocaleString(
          'es-CO',
        )}`
      : t('mobile.reservation.notAvailable');

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loadingVehicles
  ) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={
            colors.primary
          }
        />

        <Text
          style={[
            styles.loadingText,
            {
              color:
                colors.text,
            },
          ]}
        >
          {t('mobile.reservation.loadingVehicles')}
        </Text>
      </View>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <BackButton
            accessibilityLabel={t('mobile.reservation.back')}
            onPress={() => navigation.goBack()}
          />
          <Text accessibilityRole="header" style={[styles.pageTitle, { color: colors.text }]} numberOfLines={2}>
            {t('mobile.reservation.newTitle')}
          </Text>
        </View>

        {/* SERVICIO */}

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderLeftColor: colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {t('mobile.reservation.selectedService')}
          </Text>

          <Text
            style={[
              styles.serviceName,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            {serviceName}
          </Text>

          {serviceDescription ? (
            <Text
              style={[
                styles.description,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {serviceDescription}
            </Text>
          ) : null}

          <View
            style={
              styles.serviceInfoRow
            }
          >
            <View
              style={[styles.infoItem, { backgroundColor: theme.primarySoft }]}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {t('mobile.reservation.price')}
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {formattedPrice}
              </Text>
            </View>

            <View
              style={[styles.infoItem, { backgroundColor: theme.primarySoft }]}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {t('mobile.reservation.duration')}
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {serviceDuration >
                0
                  ? `${serviceDuration} ${t('mobile.home.minutes')}`
                  : t('mobile.reservation.notAvailable')}
              </Text>
            </View>
          </View>
        </View>

        {/* VEHÍCULO */}

        <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderLeftColor: colors.primary,
              },
            ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {t('mobile.reservation.selectVehicle')}
          </Text>

          {activeVehicles.length === 0 ? (
            <View
              style={
                styles.emptyVehicle
              }
            >
              <Text
                style={[
                  styles.emptyText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {t('mobile.reservation.noVehicles')}
              </Text>

              <Pressable
                style={[
                  styles.secondaryButton,
                  {
                    borderColor:
                      colors.primary,
                  },
                ]}
                onPress={() =>
                  navigation.navigate(
                    'AddVehicle',
                  )
                }
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  {t('mobile.reservation.registerVehicle')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.vehicleOptions}>
              {activeVehicles.map((vehicle) => {
                const selected = vehicle.idVehiculo === selectedVehicleId;
                const typeKey = vehicleTypeKeys[vehicle.tipoVehiculo];

                return (
                  <Pressable
                    key={vehicle.idVehiculo}
                    accessibilityRole="radio"
                    accessibilityLabel={`${vehicle.nombreMarca || ''} ${vehicle.placa || ''}`.trim()}
                    accessibilityState={{ selected }}
                    onPress={() => setSelectedVehicleId(vehicle.idVehiculo)}
                    style={[
                      styles.vehicleOption,
                      {
                        backgroundColor: selected ? theme.primarySoft : colors.inputBackground,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.vehicleIcon,
                        { backgroundColor: selected ? colors.primary : theme.primarySoft },
                      ]}
                    >
                      <Ionicons name="car-outline" size={24} color={selected ? colors.onPrimary : colors.primary} />
                    </View>
                    <View style={styles.vehicleDetails}>
                      <Text style={[styles.vehiclePlate, { color: colors.text }]}>{vehicle.placa || t('vehicles.fields.plate')}</Text>
                      <Text style={[styles.vehicleMeta, { color: colors.secondaryText }]} numberOfLines={1}>
                        {[vehicle.nombreMarca, typeKey ? t(typeKey) : vehicle.tipoVehiculo].filter(Boolean).join(' · ')}
                      </Text>
                    </View>
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={selected ? colors.primary : colors.secondaryText}
                    />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* FECHA */}

        <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderLeftColor: colors.primary,
              },
            ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {t('mobile.reservation.reservationDate')}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('mobile.reservation.reservationDate')}: ${selectedDate.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            style={[
              styles.selector,
              {
                backgroundColor:
                  colors.inputBackground,
                borderColor:
                  colors.border,
              },
            ]}
            onPress={() =>
              setShowDatePicker(
                true,
              )
            }
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text
              style={[
                styles.selectorText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {selectedDate.toLocaleDateString(
                'es-CO',
                {
                  weekday:
                    'long',
                  year:
                    'numeric',
                  month:
                    'long',
                  day:
                    'numeric',
                },
              )}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.secondaryText} />
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={
                selectedDate
              }
              mode="date"
              display={
                Platform.OS ===
                'ios'
                  ? 'spinner'
                  : 'default'
              }
              minimumDate={
                startOfLocalDay(new Date())
              }
              onChange={
                handleDateChange
              }
            />
          )}
        </View>

        {/* HORA */}

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {t('mobile.reservation.reservationTime')}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('mobile.reservation.reservationTime')}: ${selectedTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`}
            style={[
              styles.selector,
              {
                backgroundColor:
                  colors.inputBackground,
                borderColor:
                  colors.border,
              },
            ]}
            onPress={() =>
              setShowTimePicker(
                true,
              )
            }
          >
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text
              style={[
                styles.selectorText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {selectedTime.toLocaleTimeString(
                'es-CO',
                {
                  hour:
                    '2-digit',
                  minute:
                    '2-digit',
                },
              )}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.secondaryText} />
          </Pressable>

          {showTimePicker && (
            <DateTimePicker
              value={
                selectedTime
              }
              mode="time"
              display={
                Platform.OS ===
                'ios'
                  ? 'spinner'
                  : 'default'
              }
              onChange={
                handleTimeChange
              }
            />
          )}

          <Text
            style={[
              styles.scheduleHint,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {t('mobile.reservation.schedule', { min: MIN_HOUR, max: MAX_HOUR })}
          </Text>
        </View>

        {/* RESUMEN */}

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
              borderTopColor: colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {t('mobile.reservation.summary')}
          </Text>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={[
                styles.summaryLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {t('mobile.reservation.service')}
            </Text>

            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {serviceName}
            </Text>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={[
                styles.summaryLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {t('mobile.reservation.reservationDate')}
            </Text>

            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {formatDate(
                selectedDate,
              )}
            </Text>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={[
                styles.summaryLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {t('mobile.reservation.reservationTime')}
            </Text>

            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {formatTime(
                selectedTime,
              )}
            </Text>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={[
                styles.summaryLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {t('mobile.reservation.price')}
            </Text>

            <Text
              style={[
                styles.summaryPrice,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {formattedPrice}
            </Text>
          </View>
        </View>

        {/* CREAR RESERVA */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={creatingReservation ? `${t('mobile.reservation.confirm')}, ${t('accessibility.inProgress')}` : t('mobile.reservation.confirm')}
          accessibilityState={{ disabled: creatingReservation || !selectedVehicleId || activeVehicles.length === 0, busy: creatingReservation }}
          disabled={
            creatingReservation ||
            !selectedVehicleId ||
            activeVehicles.length ===
              0
          }
          onPress={
            handleCreateReservation
          }
          style={({
            pressed,
          }) => [
            styles.createButton,
            {
              backgroundColor:
                colors.primary,

              opacity:
                creatingReservation ||
                !selectedVehicleId ||
                activeVehicles.length ===
                  0
                  ? 0.5
                  : pressed
                    ? 0.8
                    : 1,
            },
          ]}
        >
          {creatingReservation ? (
            <ActivityIndicator
              color={theme.onPrimary}
            />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={21} color={theme.onPrimary} />
              <Text
                style={
                  [styles.createButtonText, { color: theme.onPrimary }]
                }
              >
                {t('mobile.reservation.confirm')}
              </Text>
            </>
          )}
        </Pressable>

        {/* CANCELAR */}

        <Pressable
          accessibilityRole="button"
          disabled={
            creatingReservation
          }
          onPress={() =>
            navigation.goBack()
          }
          style={[styles.cancelButton, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text
            style={[
              styles.cancelButtonText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {t('mobile.reservation.cancel')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 18,
      paddingTop: 8,
      paddingBottom: 48,
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 12,
    },

    loadingText: {
      fontSize: 15,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 60,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginHorizontal: 0,
      marginBottom: 14,
      borderWidth: 1,
      borderRadius: 18,
    },

    pageTitle: { flex: 1, minWidth: 0, fontSize: 22, lineHeight: 28, fontWeight: '800' },

    card: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 20,
      marginBottom: 14,
      elevation: 2,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 5,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      marginBottom: 14,
    },

    serviceName: {
      fontSize: 21,
      fontWeight: '700',
      marginBottom: 6,
    },

    description: {
      fontSize: 14,
      lineHeight: 21,
      marginBottom: 16,
    },

    serviceInfoRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },

    infoItem: {
      flexBasis: '48%',
      flexGrow: 1,
      minWidth: 125,
      borderRadius: 15,
      padding: 13,
    },

    infoLabel: {
      fontSize: 13,
      marginBottom: 4,
    },

    infoValue: {
      fontSize: 16,
      fontWeight: '700',
    },

    vehicleOptions: {
      gap: 10,
    },

    vehicleOption: {
      minHeight: 76,
      borderWidth: 1.5,
      borderRadius: 16,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    vehicleIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },

    vehicleDetails: {
      flex: 1,
      minWidth: 0,
    },

    vehiclePlate: {
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.3,
    },

    vehicleMeta: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '600',
    },

    emptyVehicle: {
      alignItems: 'center',
      paddingVertical: 10,
    },

    emptyText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 14,
    },

    secondaryButton: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 18,
      paddingVertical: 11,
    },

    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '700',
    },

    selector: {
      borderWidth: 1,
      borderRadius: 15,
      paddingHorizontal: 14,
      paddingVertical: 16,
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    selectorText: {
      flex: 1,
      minWidth: 0,
      fontSize: 15,
      fontWeight: '600',
    },

    scheduleHint: {
      fontSize: 13,
      marginTop: 10,
    },

    summaryCard: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      elevation: 2,
    },

    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingVertical: 10,
      gap: 12,
    },

    summaryLabel: {
      flexShrink: 1,
      fontSize: 14,
    },

    summaryValue: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'right',
      marginLeft: 20,
    },

    summaryPrice: {
      fontSize: 18,
      fontWeight: '800',
    },

    createButton: {
      minHeight: 58,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 20,
    },

    createButtonText: {
      fontSize: 16,
      fontWeight: '700',
    },

    cancelButton: {
      minHeight: 48,
      borderWidth: 1,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginTop: 10,
    },

    cancelButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
  });
