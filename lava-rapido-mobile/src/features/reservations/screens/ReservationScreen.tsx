
import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

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

import { vehicleService } from '../../vehicles/services/vehicleService';
import type { Vehicle } from '../../vehicles/types/vehicle.types';

import { reservationService } from '../services/reservationService';

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

const MIN_HOUR = 6;
const MAX_HOUR = 20;

// ============================================================
// COMPONENTE
// ============================================================

export default function ReservationScreen() {
  const navigation =
    useNavigation<ReservationNavigationProp>();

  const route =
    useRoute<ReservationRouteProp>();

  const { darkMode } =
    useContext(ThemeContext);

  // ----------------------------------------------------------
  // SERVICIO RECIBIDO
  // ----------------------------------------------------------

  const service: Service | undefined =
    route.params?.service;

  const serviceId =
    service?.idServicio ?? '';

  const serviceName =
    service?.nombre ??
    'Servicio de lavado';

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

  // ==========================================================
  // COLORES
  // ==========================================================

  const colors = useMemo(
    () => ({
      background: darkMode
        ? '#121212'
        : '#F5F7FA',

      card: darkMode
        ? '#1E1E1E'
        : '#FFFFFF',

      text: darkMode
        ? '#FFFFFF'
        : '#1F2937',

      secondaryText: darkMode
        ? '#BDBDBD'
        : '#6B7280',

      border: darkMode
        ? '#333333'
        : '#E5E7EB',

      primary: '#2563EB',

      inputBackground: darkMode
        ? '#2A2A2A'
        : '#FFFFFF',

      danger: '#DC2626',

      success: '#16A34A',
    }),
    [darkMode],
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

  const isToday = (
    date: Date,
  ): boolean => {
    const today =
      new Date();

    return (
      date.getFullYear() ===
        today.getFullYear() &&
      date.getMonth() ===
        today.getMonth() &&
      date.getDate() ===
        today.getDate()
    );
  };

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

          console.log(
            '========== CARGANDO VEHÍCULOS ==========',
          );

          const response =
            await vehicleService.getMyVehicles();

          console.log(
            'VEHÍCULOS OBTENIDOS:',
            response,
          );

          setVehicles(response);

          if (
            response.length > 0
          ) {
            setSelectedVehicleId(
              response[0]
                .idVehiculo,
            );
          } else {
            Alert.alert(
              'Sin vehículos',
              'Debes registrar un vehículo antes de crear una reserva.',
              [
                {
                  text: 'Registrar vehículo',
                  onPress: () => {
                    navigation.navigate(
                      'RegisterVehicle',
                    );
                  },
                },
                {
                  text: 'Cancelar',
                  style: 'cancel',
                },
              ],
            );
          }
        } catch (
          error: any
        ) {
          console.error(
            '========== ERROR CARGANDO VEHÍCULOS ==========',
          );

          console.error(
            'ERROR:',
            error,
          );

          console.error(
            'STATUS:',
            error?.response
              ?.status,
          );

          console.error(
            'DATA:',
            error?.response
              ?.data,
          );

          console.error(
            'MESSAGE:',
            error?.message,
          );

          Alert.alert(
            'Error',
            'No se pudieron cargar tus vehículos.',
          );
        } finally {
          setLoadingVehicles(
            false,
          );
        }
      },
      [navigation],
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
      const hours =
        selectedTime.getHours();

      const minutes =
        selectedTime.getMinutes();

      const startMinutes =
        hours * 60 + minutes;

      const minimumMinutes =
        MIN_HOUR * 60;

      const maximumMinutes =
        MAX_HOUR * 60;

      if (
        startMinutes <
        minimumMinutes
      ) {
        Alert.alert(
          'Horario no válido',
          `El servicio debe comenzar después de las ${MIN_HOUR}:00.`,
        );

        return false;
      }

      if (
        startMinutes >=
        maximumMinutes
      ) {
        Alert.alert(
          'Horario no válido',
          `El servicio debe comenzar antes de las ${MAX_HOUR}:00.`,
        );

        return false;
      }

      // --------------------------------------------------------
      // VALIDAR DURACIÓN
      // --------------------------------------------------------

      if (
        serviceDuration > 0
      ) {
        const endMinutes =
          startMinutes +
          serviceDuration;

        if (
          endMinutes >
          maximumMinutes
        ) {
          Alert.alert(
            'Horario no válido',
            `El servicio termina después de las ${MAX_HOUR}:00. Selecciona una hora más temprana.`,
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

    setSelectedDate(date);
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

    setSelectedTime(date);
  };

  // ==========================================================
  // CREAR RESERVA
  // ==========================================================

  const handleCreateReservation =
    async () => {
      if (
        creatingReservation
      ) {
        return;
      }

      console.log(
        '========== INICIANDO CREACIÓN DE RESERVA ==========',
      );

      console.log(
        'SERVICE OBJECT:',
        service,
      );

      console.log(
        'SERVICE ID:',
        serviceId,
      );

      console.log(
        'SERVICE NAME:',
        serviceName,
      );

      console.log(
        'SERVICE PRICE:',
        servicePrice,
      );

      console.log(
        'SERVICE DURATION:',
        serviceDuration,
      );

      console.log(
        'SELECTED VEHICLE:',
        selectedVehicleId,
      );

      console.log(
        'SELECTED DATE:',
        formatDate(
          selectedDate,
        ),
      );

      console.log(
        'SELECTED TIME:',
        formatTime(
          selectedTime,
        ),
      );

      // --------------------------------------------------------
      // VALIDAR SERVICIO
      // --------------------------------------------------------

      if (!serviceId) {
        Alert.alert(
          'Error',
          'No se encontró el servicio seleccionado.',
        );

        console.error(
          'ERROR: serviceId no existe',
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
          'Selecciona un vehículo',
          'Debes seleccionar un vehículo para continuar.',
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
          'Fecha no válida',
          'No puedes seleccionar una fecha anterior a hoy.',
        );

        return;
      }

      // --------------------------------------------------------
      // VALIDAR HORA SI ES HOY
      // --------------------------------------------------------

      if (
        isToday(
          selectedDate,
        )
      ) {
        const now =
          new Date();

        const selectedMinutes =
          selectedTime.getHours() *
            60 +
          selectedTime.getMinutes();

        const currentMinutes =
          now.getHours() *
            60 +
          now.getMinutes();

        if (
          selectedMinutes <
          currentMinutes
        ) {
          Alert.alert(
            'Hora no válida',
            'La hora seleccionada ya pasó. Selecciona una hora futura.',
          );

          return;
        }
      }

      // --------------------------------------------------------
      // VALIDAR HORARIO
      // --------------------------------------------------------

      if (
        !validateTime()
      ) {
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

      console.log(
        '========== REQUEST RESERVA ==========',
      );

      console.log(
        'reservationData:',
        reservationData,
      );

      console.log(
        'JSON:',
        JSON.stringify(
          reservationData,
          null,
          2,
        ),
      );

      console.log(
        '=====================================',
      );

      try {
        setCreatingReservation(
          true,
        );

        const response =
          await reservationService.create(
            reservationData,
          );

        console.log(
          '========== RESERVA CREADA ==========',
        );

        console.log(
          'RESPONSE:',
          response,
        );

        console.log(
          'ID RESERVA:',
          response?.idReserva,
        );

        console.log(
          'ESTADO:',
          response?.estado,
        );

        console.log(
          '====================================',
        );

        Alert.alert(
          'Reserva creada',
          'Tu reserva fue creada correctamente.',
          [
            {
              text: 'Aceptar',
              onPress: () => {
                navigation.navigate(
                  'MainTabs',
                );
              },
            },
          ],
        );
      } catch (
        error: any
      ) {
        console.error(
          '========== ERROR CREANDO RESERVA ==========',
        );

        console.error(
          'ERROR COMPLETO:',
          error,
        );

        console.error(
          'STATUS:',
          error?.response
            ?.status,
        );

        console.error(
          'DATA:',
          error?.response
            ?.data,
        );

        console.error(
          'MESSAGE:',
          error?.message,
        );

        console.error(
          'HEADERS:',
          error?.response
            ?.headers,
        );

        console.error(
          'REQUEST URL:',
          error?.config
            ?.url,
        );

        console.error(
          'REQUEST METHOD:',
          error?.config
            ?.method,
        );

        console.error(
          'REQUEST DATA:',
          error?.config
            ?.data,
        );

        console.error(
          '============================================',
        );

        // ------------------------------------------------------
        // OBTENER MENSAJE DEL BACKEND
        // ------------------------------------------------------

        const responseData =
          error?.response
            ?.data;

        let backendMessage =
          'No se pudo crear la reserva.';

        if (
          typeof responseData ===
          'string'
        ) {
          backendMessage =
            responseData;
        } else if (
          responseData?.message
        ) {
          backendMessage =
            responseData.message;
        } else if (
          responseData?.error
        ) {
          backendMessage =
            responseData.error;
        } else if (
          responseData?.detail
        ) {
          backendMessage =
            responseData.detail;
        }

        // ------------------------------------------------------
        // ERROR DE SOLAPAMIENTO
        // ------------------------------------------------------

        const normalizedMessage =
          backendMessage
            .toLowerCase();

        const isOverlapError =
          normalizedMessage.includes(
            'reserva solapada',
          ) ||
          normalizedMessage.includes(
            'solapada',
          ) ||
          normalizedMessage.includes(
            'horario',
          ) &&
          normalizedMessage.includes(
            'vehículo',
          );

        if (
          isOverlapError
        ) {
          Alert.alert(
            'Horario no disponible',
            'Este vehículo ya tiene una reserva que coincide con el horario seleccionado. Selecciona otra hora o fecha.',
            [
              {
                text: 'Cambiar horario',
                style: 'default',
              },
            ],
          );

          return;
        }

        // ------------------------------------------------------
        // OTROS ERRORES 400
        // ------------------------------------------------------

        if (
          error?.response
            ?.status === 400
        ) {
          Alert.alert(
            'Datos no válidos',
            backendMessage,
          );

          return;
        }

        // ------------------------------------------------------
        // ERROR DE AUTORIZACIÓN
        // ------------------------------------------------------

        if (
          error?.response
            ?.status === 401
        ) {
          Alert.alert(
            'Sesión expirada',
            'Tu sesión ha expirado. Inicia sesión nuevamente.',
          );

          return;
        }

        // ------------------------------------------------------
        // ERROR DE SERVIDOR
        // ------------------------------------------------------

        if (
          error?.response
            ?.status >= 500
        ) {
          Alert.alert(
            'Error del servidor',
            'No fue posible procesar la reserva en este momento. Intenta nuevamente más tarde.',
          );

          return;
        }

        // ------------------------------------------------------
        // ERROR GENERAL
        // ------------------------------------------------------

        Alert.alert(
          'Error al crear reserva',
          backendMessage,
        );
      } finally {
        setCreatingReservation(
          false,
        );
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
      : 'Precio no disponible';

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
          Cargando vehículos...
        </Text>
      </View>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <View
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
      >
        {/* HEADER */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.backButton
            }
          >
            <Text
              style={[
                styles.backText,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              ←
            </Text>
          </Pressable>

          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Nueva reserva
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {/* SERVICIO */}

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
            Servicio seleccionado
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
              style={
                styles.infoItem
              }
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
                Precio
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
              style={
                styles.infoItem
              }
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
                Duración
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
                  ? `${serviceDuration} min`
                  : 'No disponible'}
              </Text>
            </View>
          </View>
        </View>

        {/* VEHÍCULO */}

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
            Selecciona tu vehículo
          </Text>

          {vehicles.length ===
          0 ? (
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
                No tienes vehículos
                registrados.
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
                    'RegisterVehicle',
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
                  Registrar vehículo
                </Text>
              </Pressable>
            </View>
          ) : (
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor:
                    colors.inputBackground,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Picker
                selectedValue={
                  selectedVehicleId
                }
                onValueChange={(
                  value,
                ) =>
                  setSelectedVehicleId(
                    value,
                  )
                }
                style={{
                  color:
                    colors.text,
                }}
              >
                {vehicles.map(
                  (
                    vehicle,
                  ) => (
                    <Picker.Item
                      key={
                        vehicle.idVehiculo
                      }
                      label={`${vehicle.nombreMarca ?? ''} - ${vehicle.placa ?? ''} (${vehicle.tipoVehiculo ?? ''})`.trim()}
                      value={
                        vehicle.idVehiculo
                      }
                    />
                  ),
                )}
              </Picker>
            </View>
          )}
        </View>

        {/* FECHA */}

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
            Fecha de reserva
          </Text>

          <Pressable
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
                new Date()
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
            Hora de reserva
          </Text>

          <Pressable
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
            Horario permitido:{' '}
            {MIN_HOUR}:00 a{' '}
            {MAX_HOUR}:00
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
            Resumen
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
              Servicio
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
              Fecha
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
              Hora
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
              Precio
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
          disabled={
            creatingReservation ||
            !selectedVehicleId ||
            vehicles.length ===
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
                vehicles.length ===
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
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.createButtonText
              }
            >
              Confirmar reserva
            </Text>
          )}
        </Pressable>

        {/* CANCELAR */}

        <Pressable
          disabled={
            creatingReservation
          }
          onPress={() =>
            navigation.goBack()
          }
          style={
            styles.cancelButton
          }
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
            Cancelar
          </Text>
        </Pressable>
      </ScrollView>
    </View>
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
      padding: 20,
      paddingBottom: 40,
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
      marginBottom: 20,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    backText: {
      fontSize: 32,
      fontWeight: '500',
    },

    headerTitle: {
      flex: 1,
      fontSize: 24,
      fontWeight: '700',
      marginLeft: 4,
    },

    headerSpacer: {
      width: 42,
    },

    card: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 18,
      marginBottom: 16,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      marginBottom: 12,
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
      gap: 30,
    },

    infoItem: {
      flex: 1,
    },

    infoLabel: {
      fontSize: 13,
      marginBottom: 4,
    },

    infoValue: {
      fontSize: 16,
      fontWeight: '700',
    },

    pickerContainer: {
      borderWidth: 1,
      borderRadius: 12,
      overflow: 'hidden',
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
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 15,
    },

    selectorText: {
      fontSize: 16,
    },

    scheduleHint: {
      fontSize: 13,
      marginTop: 10,
    },

    summaryCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 18,
      marginBottom: 20,
    },

    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingVertical: 8,
    },

    summaryLabel: {
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
      minHeight: 54,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 20,
    },

    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    cancelButton: {
      alignItems: 'center',
      justifyContent:
        'center',
      paddingVertical: 16,
    },

    cancelButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
  });
