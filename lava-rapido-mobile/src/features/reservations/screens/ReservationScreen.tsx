
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
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


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
import ScreenHeader from '../../../components/common/ScreenHeader';
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider';

import { vehicleService } from '../../vehicles/services/vehicleService';
import type { Vehicle } from '../../vehicles/types/vehicle.types';

import { reservationService } from '../services/reservationService';
import { classifyReservationCreationError } from '../../../services/reservationErrors';
import { classifyApiError, type ApiErrorKind } from '../../../services/api';
import { serviceService } from '../../../services/serviceService';
import styles from '../components/reservationFormStyles';
import SelectedServiceCard from '../components/SelectedServiceCard';
import VehicleSelectionCard from '../components/VehicleSelectionCard';
import ReservationDateCard from '../components/ReservationDateCard';
import ReservationTimeCard from '../components/ReservationTimeCard';
import ReservationSummaryCard from '../components/ReservationSummaryCard';
import RegisterLegalDocumentModal from '../../auth/components/RegisterLegalDocumentModal';
import type { LegalDocument } from '../../auth/legalContent';
import {
  getReservationTimeError,
  isPastLocalDate,
  isPastLocalTime,
  isSameLocalDate,
  RESERVATION_MAX_HOUR,
  RESERVATION_MIN_HOUR,
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
  const [vehicleLoadError, setVehicleLoadError] = useState<ApiErrorKind | null>(null);
  const vehicleLoadInProgress = useRef(false);

  const [
    creatingReservation,
    setCreatingReservation,
  ] = useState(false);
  const reservationSubmissionInProgress = useRef(false);
  const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(null);

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
        if (vehicleLoadInProgress.current) return;

        vehicleLoadInProgress.current = true;
        try {
          setLoadingVehicles(
            true,
          );
          setVehicleLoadError(null);

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
          setVehicleLoadError(kind);
        } finally {
          setLoadingVehicles(
            false,
          );
          vehicleLoadInProgress.current = false;
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
    <>
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
        bounces={false}
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustKeyboardInsets={false}
      >
        <ScreenHeader
          accessibilityLabel={t('mobile.reservation.back')}
          onBack={() => navigation.goBack()}
          title={t('mobile.reservation.newTitle')}
        />

        {/* SERVICIO */}

        <SelectedServiceCard
          serviceName={serviceName}
          serviceDescription={serviceDescription}
          formattedPrice={formattedPrice}
          serviceDuration={serviceDuration}
          colors={colors}
          theme={theme}
        />
        <VehicleSelectionCard
          activeVehicles={activeVehicles}
          selectedVehicleId={selectedVehicleId}
          vehicleLoadError={vehicleLoadError}
          loadingVehicles={loadingVehicles}
          onRetry={() => void loadVehicles()}
          onAddVehicle={() => navigation.navigate('AddVehicle')}
          onSelectVehicle={setSelectedVehicleId}
          colors={colors}
          theme={theme}
        />
        <ReservationDateCard
          selectedDate={selectedDate}
          showDatePicker={showDatePicker}
          onOpenDatePicker={() => setShowDatePicker(true)}
          onDateChange={handleDateChange}
          colors={colors}
        />
        <ReservationTimeCard
          selectedTime={selectedTime}
          showTimePicker={showTimePicker}
          onOpenTimePicker={() => setShowTimePicker(true)}
          onTimeChange={handleTimeChange}
          minHour={MIN_HOUR}
          maxHour={MAX_HOUR}
          colors={colors}
        />
        <ReservationSummaryCard
          serviceName={serviceName}
          selectedDateText={formatDate(selectedDate)}
          selectedTimeText={formatTime(selectedTime)}
          formattedPrice={formattedPrice}
          colors={colors}
          onOpenTerms={() => setLegalDocument('terms')}
        />

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
    <RegisterLegalDocumentModal
      document={legalDocument}
      onClose={() => setLegalDocument(null)}
      surfaceColor={theme.card}
      textColor={theme.text}
      secondaryTextColor={theme.textSecondary}
      buttonColor={theme.primary}
      onPrimaryColor={theme.onPrimary}
    />
    </>
  );
}

// ============================================================
