
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'

import { ThemeContext } from '../../../theme/ThemeContext'

import api from '../../../services/api'

import { reservationService } from '../../reservations/services/reservationService'

import type {
  ReservationResponse,
  ReservationStatus,
} from '../../reservations/types/reservation.types'


interface UserProfile {
  userId: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  profilePicture?: string | null
}


export default function MyServicesScreen() {

  const navigation = useNavigation<any>()

  const {
    theme,
    darkMode,
  } = useContext(ThemeContext)

  const [reservations, setReservations] =
    useState<ReservationResponse[]>([])

  const [loading, setLoading] =
    useState(true)


  /*
   * CARGAR RESERVAS DEL USUARIO AUTENTICADO
   */
  const loadReservations = useCallback(
    async () => {

      try {

        setLoading(true)

        /*
         * Primero obtenemos el perfil del usuario
         * autenticado mediante el token.
         */
        const profileResponse =
          await api.get<UserProfile>(
            '/api/users/profile'
          )

        const userId =
          profileResponse.data.userId

        if (!userId) {
          throw new Error(
            'No se encontró el ID del usuario autenticado.'
          )
        }

        /*
         * Luego obtenemos las reservas
         * pertenecientes a ese usuario.
         */
        const data =
          await reservationService.getByUser(
            userId
          )

        setReservations(data)

      } catch (error: any) {

        console.error(
          'ERROR CARGANDO MIS SERVICIOS:',
          error?.response?.data ||
          error?.message ||
          error
        )

        setReservations([])

        Alert.alert(
          'Error',
          'No fue posible cargar tus servicios.'
        )

      } finally {

        setLoading(false)

      }

    },
    []
  )


  /*
   * ACTUALIZAR CADA VEZ QUE SE ENTRA
   * A LA PANTALLA
   */
  useFocusEffect(
    useCallback(() => {

      loadReservations()

    }, [loadReservations])
  )


  /*
   * COLOR DEL ESTADO
   */
  const renderStatusColor = (
    status: ReservationStatus
  ) => {

    switch (status) {

      case 'EN_PROCESO':
        return '#F39C12'

      case 'PENDIENTE':
        return '#3498DB'

      case 'ASIGNADA':
        return '#8E44AD'

      case 'FINALIZADA':
        return '#27AE60'

      case 'CANCELADA':
        return '#E74C3C'

      default:
        return '#999'

    }

  }


  /*
   * TEXTO DEL ESTADO
   */
  const renderStatusText = (
    status: ReservationStatus
  ) => {

    switch (status) {

      case 'EN_PROCESO':
        return 'En proceso'

      case 'PENDIENTE':
        return 'Pendiente'

      case 'ASIGNADA':
        return 'Asignada'

      case 'FINALIZADA':
        return 'Finalizado'

      case 'CANCELADA':
        return 'Cancelado'

      default:
        return status

    }

  }


  /*
   * FORMATEAR FECHA
   */
  const formatDate = (
    date: string
  ) => {

    if (!date) {
      return ''
    }

    const [year, month, day] =
      date.split('-')

    return `${day}/${month}/${year}`

  }


  /*
   * FORMATEAR HORA
   */
  const formatTime = (
    time: string
  ) => {

    if (!time) {
      return ''
    }

    const [hour, minute] =
      time.split(':')

    return `${hour}:${minute}`

  }


  /*
   * LOADING
   */
  if (loading) {

    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              theme.background,
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
              color: theme.text,
            },
          ]}
        >
          Cargando tus servicios...
        </Text>

      </View>
    )

  }


  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >

      <Text
        style={[
          styles.title,
          {
            color: theme.text,
          },
        ]}
      >
        Mis Servicios
      </Text>


      <FlatList
        data={reservations}

        keyExtractor={(item) =>
          item.idReserva
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          reservations.length === 0
            ? styles.emptyList
            : styles.listContent
        }

        refreshing={loading}

        onRefresh={loadReservations}

        ListEmptyComponent={

          <View
            style={styles.emptyContainer}
          >

            <Ionicons
              name="car-outline"
              size={60}
              color={
                darkMode
                  ? '#777'
                  : '#999'
              }
            />

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              No tienes servicios
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color: darkMode
                    ? '#BDBDBD'
                    : '#666',
                },
              ]}
            >
              Cuando realices una reserva,
              aparecerá aquí.
            </Text>

          </View>

        }


        renderItem={({
          item,
        }) => (

          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
          >

            {/* HEADER */}

            <View
              style={styles.top}
            >

              <View
                style={styles.titleContainer}
              >

                <Text
                  style={[
                    styles.serviceTitle,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.nombreServicio ||
                    'Servicio'}
                </Text>

                <Text
                  style={[
                    styles.vehicleText,
                    {
                      color:
                        darkMode
                          ? '#BDBDBD'
                          : '#666',
                    },
                  ]}
                >
                  {item.placaVehiculo}
                  {' • '}
                  {item.tipoVehiculo}
                </Text>

              </View>


              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      renderStatusColor(
                        item.estado
                      ),
                  },
                ]}
              >

                <Text
                  style={styles.statusText}
                >
                  {renderStatusText(
                    item.estado
                  )}
                </Text>

              </View>

            </View>


            {/* FECHA Y HORA */}

            <View
              style={styles.infoRow}
            >

              <Ionicons
                name="calendar-outline"
                size={18}
                color="#1E6FB9"
              />

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {formatDate(
                  item.fechaReserva
                )}
                {' - '}
                {formatTime(
                  item.horaReserva
                )}
              </Text>

            </View>


            {/* DURACIÓN */}

            <View
              style={styles.infoRow}
            >

              <Ionicons
                name="time-outline"
                size={18}
                color="#1E6FB9"
              />

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                Duración:{' '}
                {item.duracionServicio}
                {' minutos'}
              </Text>

            </View>


            {/* PRECIO */}

            <View
              style={styles.infoRow}
            >

              <Ionicons
                name="cash-outline"
                size={18}
                color="#1E6FB9"
              />

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                $
                {item.precioServicio.toLocaleString(
                  'es-CO'
                )}
              </Text>

            </View>


            {/* UBICACIÓN */}

            <View
              style={styles.infoRow}
            >

              <Ionicons
                name="location-outline"
                size={18}
                color="#1E6FB9"
              />

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                Servicio de lavado
              </Text>

            </View>


            {/* BOTONES */}

            <View
              style={styles.actions}
            >

              {/* SEGUIMIENTO */}

              <TouchableOpacity
                style={[
                  styles.trackButton,
                  {
                    opacity:
                      item.estado ===
                      'CANCELADA'
                        ? 0.5
                        : 1,
                  },
                ]}
                disabled={
                  item.estado ===
                  'CANCELADA'
                }
                onPress={() =>
                  navigation.navigate(
                    'Map'
                  )
                }
              >

                <Ionicons
                  name="map-outline"
                  size={18}
                  color="#fff"
                />

                <Text
                  style={styles.trackText}
                >
                  Seguimiento
                </Text>

              </TouchableOpacity>


              {/* VER DETALLES */}

              <TouchableOpacity
                style={[
                  styles.detailsButton,
                  {
                    borderColor:
                      '#1E6FB9',
                  },
                ]}
                onPress={() =>
                  navigation.navigate(
                    'ServiceDetails',
                    {
                      reservation: item,
                    }
                  )
                }
              >

                <Text
                  style={[
                    styles.detailsText,
                    {
                      color:
                        '#1E6FB9',
                    },
                  ]}
                >
                  Ver detalles
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        )}
      />

    </View>

  )
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  listContent: {
    paddingBottom: 40,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },

  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,

    elevation: 4,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,

    shadowRadius: 4,
  },

  top: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },

  serviceTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },

  vehicleText: {
    marginTop: 5,
    fontSize: 13,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },

  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  infoText: {
    marginLeft: 10,
    fontSize: 15,
    flex: 1,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 7,
  },

  trackButton: {
    flex: 1,
    backgroundColor: '#1E6FB9',
    height: 50,
    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',
  },

  trackText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },

  detailsButton: {
    flex: 1,
    borderWidth: 1.5,
    height: 50,
    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsText: {
    fontWeight: 'bold',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 15,
    fontSize: 15,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
  },

  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

})

