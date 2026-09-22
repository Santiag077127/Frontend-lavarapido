
import React, { useContext } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { ThemeContext } from '../../../theme/ThemeContext'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../../../utils/formatters'

import type { RootStackParamList } from '../../../navigation/types'

import type { ReservationResponse } from '../../reservations/types/reservation.types'

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ServiceDetails'
>

export default function ServiceDetailsScreen({
  route,
  navigation,
}: Props) {

  const { theme, darkMode } = useContext(ThemeContext)
  const { t } = useTranslation()

  const { reservation } = route.params

  const renderStatusColor = (
    status: ReservationResponse['estado']
  ) => {

    switch (status) {

      case 'EN_PROCESO':
        return '#F39C12'

      case 'PENDIENTE':
        return '#3498DB'

      case 'ASIGNADA':
        return '#9B59B6'

      case 'FINALIZADA':
        return '#27AE60'

      case 'CANCELADA':
        return '#E74C3C'

      default:
        return '#999'
    }
  }


  const renderStatusText = (
    status: ReservationResponse['estado']
  ) => {

    switch (status) {

      case 'EN_PROCESO':
        return t('mobile.reservationDetail.status.inProcess')

      case 'PENDIENTE':
        return t('mobile.reservationDetail.status.pending')

      case 'ASIGNADA':
        return t('mobile.reservationDetail.status.assigned')

      case 'FINALIZADA':
        return t('mobile.reservationDetail.status.finished')

      case 'CANCELADA':
        return t('mobile.reservationDetail.status.cancelled')

      default:
        return t('mobile.reservationDetail.status.unknown')
    }
  }

  const formatDate = (date: string) => {

    if (!date) {
      return t('mobile.services.notAvailable')
    }

    const [year, month, day] = date.split('-')

    return `${day}/${month}/${year}`
  }

  const formatTime = (time: string) => {

    if (!time) {
      return t('mobile.services.notAvailable')
    }

    return time.substring(0, 5)
  }

  const isInProcess =
    reservation.estado === 'EN_PROCESO' ||
    reservation.estado === 'FINALIZADA'

  const isFinished =
    reservation.estado === 'FINALIZADA'

  return (

    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.card,
          },
        ]}
      >

        <View style={styles.iconContainer}>

          <Ionicons
            name="car-sport"
            size={40}
            color="#fff"
          />

        </View>

        <Text
          style={[
            styles.title,
            {
              color: theme.text,
            },
          ]}
        >
          {reservation.nombreServicio || t('mobile.services.serviceFallback')}
        </Text>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                renderStatusColor(reservation.estado),
            },
          ]}
        >

          <Text style={styles.statusText}>
            {renderStatusText(reservation.estado)}
          </Text>

        </View>

      </View>

      {/* INFORMACIÓN DEL SERVICIO */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
          },
        ]}
      >

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          {t('mobile.reservationDetail.serviceInfo')}
        </Text>

        <Text
          style={[
            styles.reservationId,
            {
              color: darkMode
                ? '#BDBDBD'
                : '#666',
            },
          ]}
        >
          {t('mobile.reservationDetail.reservation')} #{reservation.idReserva}
        </Text>

        {!!reservation.descripcionServicio && (
          <Text
            style={[
              styles.serviceDescription,
              {
                color: theme.text,
              },
            ]}
          >
            {reservation.descripcionServicio}
          </Text>
        )}

        {/* Fecha */}

        <View style={styles.infoRow}>

          <Ionicons
            name="calendar-outline"
            size={22}
            color="#1E6FB9"
          />

          <View style={styles.infoContent}>

            <Text
              style={[
                styles.label,
                {
                  color: darkMode
                    ? '#BDBDBD'
                    : '#666',
                },
              ]}
            >
              {t('mobile.reservationDetail.date')}
            </Text>

            <Text
              style={[
                styles.value,
                {
                  color: theme.text,
                },
              ]}
            >
              {formatDate(reservation.fechaReserva)}
            </Text>

          </View>

        </View>

        {/* Hora */}

        <View style={styles.infoRow}>

          <Ionicons
            name="time-outline"
            size={22}
            color="#1E6FB9"
          />

          <View style={styles.infoContent}>

            <Text
              style={[
                styles.label,
                {
                  color: darkMode
                    ? '#BDBDBD'
                    : '#666',
                },
              ]}
            >
              {t('mobile.reservationDetail.time')}
            </Text>

            <Text
              style={[
                styles.value,
                {
                  color: theme.text,
                },
              ]}
            >
              {formatTime(reservation.horaReserva)}
            </Text>

          </View>

        </View>

        {/* Vehículo */}

        <View style={styles.infoRow}>

          <Ionicons
            name="car-outline"
            size={22}
            color="#1E6FB9"
          />

          <View style={styles.infoContent}>

            <Text
              style={[
                styles.label,
                {
                  color: darkMode
                    ? '#BDBDBD'
                    : '#666',
                },
              ]}
            >
              {t('mobile.reservationDetail.vehicle')}
            </Text>

            <Text
              style={[
                styles.value,
                {
                  color: theme.text,
                },
              ]}
            >
              {reservation.tipoVehiculo}
            </Text>

          </View>

        </View>

        {/* Placa */}

        <View style={styles.infoRow}>

          <Ionicons
            name="pricetag-outline"
            size={22}
            color="#1E6FB9"
          />

          <View style={styles.infoContent}>

            <Text
              style={[
                styles.label,
                {
                  color: darkMode
                    ? '#BDBDBD'
                    : '#666',
                },
              ]}
            >
              {t('mobile.reservationDetail.plate')}
            </Text>

            <Text
              style={[
                styles.value,
                {
                  color: theme.text,
                },
              ]}
            >
              {reservation.placaVehiculo}
            </Text>

          </View>

        </View>

        {/* Precio */}

        <View style={styles.infoRow}>

          <Ionicons
            name="cash-outline"
            size={22}
            color="#1E6FB9"
          />

          <View style={styles.infoContent}>

            <Text
              style={[
                styles.label,
                {
                  color: darkMode
                    ? '#BDBDBD'
                    : '#666',
                },
              ]}
            >
              {t('mobile.reservationDetail.price')}
            </Text>

            <Text
              style={[
                styles.value,
                {
                  color: theme.text,
                },
              ]}
            >
              {formatCurrency(reservation.precioServicio)}
            </Text>

          </View>

        </View>

        {/* Duración */}

        <View style={styles.infoRow}>

          <Ionicons
            name="hourglass-outline"
            size={22}
            color="#1E6FB9"
          />

          <View style={styles.infoContent}>

            <Text
              style={[
                styles.label,
                {
                  color: darkMode
                    ? '#BDBDBD'
                    : '#666',
                },
              ]}
            >
              {t('mobile.reservationDetail.duration')}
            </Text>

            <Text
              style={[
                styles.value,
                {
                  color: theme.text,
                },
              ]}
            >
              {reservation.duracionServicio} {t('mobile.reservationDetail.minutes')}
            </Text>

          </View>

        </View>

      </View>

      {/* ESTADO DEL PROCESO */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
          },
        ]}
      >

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          {t('mobile.reservationDetail.processStatus')}
        </Text>

        <View style={styles.timeline}>

          {/* RESERVA */}

          <View style={styles.step}>

            <View style={styles.activeDot} />

            <Text
              style={[
                styles.stepText,
                {
                  color: theme.text,
                },
              ]}
            >
              {t('mobile.reservationDetail.confirmed')}
            </Text>

          </View>

          <View style={styles.line} />

          {/* EN SERVICIO */}

          <View style={styles.step}>

            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    isInProcess
                      ? '#1E6FB9'
                      : '#ccc',
                },
              ]}
            />

            <Text
              style={[
                styles.stepText,
                {
                  color: theme.text,
                },
              ]}
            >
              {t('mobile.reservationDetail.inService')}
            </Text>

          </View>

          <View style={styles.line} />

          {/* FINALIZADO */}

          <View style={styles.step}>

            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    isFinished
                      ? '#27AE60'
                      : '#ccc',
                },
              ]}
            />

            <Text
              style={[
                styles.stepText,
                {
                  color: theme.text,
                },
              ]}
            >
              {t('mobile.reservationDetail.finished')}
            </Text>

          </View>

        </View>

      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },

  header: {
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E6FB9',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 15,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 50,
  },

  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,

    elevation: 4,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  reservationId: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },

  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },

  infoContent: {
    marginLeft: 15,
    flex: 1,
  },

  label: {
    fontSize: 13,
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
  },

  timeline: {
    marginTop: 10,
  },

  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#27AE60',
  },

  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  line: {
    width: 2,
    height: 35,
    backgroundColor: '#ccc',
    marginLeft: 6,
    marginVertical: 4,
  },

  stepText: {
    marginLeft: 15,
    fontSize: 15,
  },

})

