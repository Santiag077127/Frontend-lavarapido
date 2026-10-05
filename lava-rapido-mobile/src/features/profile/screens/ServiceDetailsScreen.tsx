
import React, { useCallback, useContext, useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useFocusEffect } from '@react-navigation/native'

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { ThemeContext } from '../../../theme/ThemeContext'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../../../utils/formatters'
import { reservationService } from '../../reservations/services/reservationService'
import { ratingService, type RatingResponse } from '../../../services/ratingService'

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

  const [reservation, setReservation] = useState(route.params.reservation)
  const [rating, setRating] = useState<RatingResponse | null>(null)
  const [ratingLoading, setRatingLoading] = useState(true)
  const [ratingLoadError, setRatingLoadError] = useState(false)
  const [ratingModalVisible, setRatingModalVisible] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [ratingSuccess, setRatingSuccess] = useState(false)
  const submitLock = useRef(false)

  const loadRatingState = useCallback(async (isActive: () => boolean) => {
    setRatingLoading(true)
    setRatingLoadError(false)
    try {
      const latestReservation = await reservationService.getById(reservation.idReserva)
      if (!isActive()) return
      setReservation(latestReservation)

      if (latestReservation.estado !== 'FINALIZADA') {
        setRating(null)
        setRatingSuccess(false)
        return
      }

      try {
        const existingRating = await ratingService.getByReservation(latestReservation.idReserva)
        if (isActive()) {
          setRating(existingRating)
          setRatingSuccess(false)
        }
      } catch (error) {
        if ((error as { response?: { status?: number } }).response?.status === 404) {
          if (isActive()) {
            setRating(null)
            setRatingSuccess(false)
          }
        } else {
          throw error
        }
      }
    } catch {
      if (isActive()) setRatingLoadError(true)
    } finally {
      if (isActive()) setRatingLoading(false)
    }
  }, [reservation.idReserva])

  useFocusEffect(useCallback(() => {
    let active = true
    void loadRatingState(() => active)
    return () => { active = false }
  }, [loadRatingState]))

  const canRate = reservation.estado === 'FINALIZADA' && !rating && !ratingLoading && !ratingLoadError

  const submitRating = async () => {
    if (submitLock.current || selectedRating < 1 || selectedRating > 5 || !canRate) {
      if (selectedRating < 1 || selectedRating > 5) setRatingError('selectRating')
      return
    }

    submitLock.current = true
    setSubmitting(true)
    setRatingError(null)
    try {
      const created = await ratingService.submit({
        reservaId: reservation.idReserva,
        puntuacion: selectedRating,
        comentario: comment.trim() || null,
      })
      setRating(created)
      setRatingSuccess(true)
      setRatingModalVisible(false)
      setComment('')
    } catch (error) {
      const failure = error as { response?: { status?: number; data?: { error?: unknown } } }
      const status = failure.response?.status
      const message = failure.response?.data?.error
      if (typeof message === 'string' && message.toLowerCase().includes('finalizadas')) {
        setRatingError('notFinished')
      } else if (typeof message === 'string' && message.toLowerCase().includes('ya tiene una calificacion')) {
        setRatingModalVisible(false)
        void loadRatingState(() => true)
      } else if (status === 401 || status === 403) {
        setRatingError('unauthorized')
      } else if (status === 404) {
        setRatingError('notFound')
      } else if (!status) {
        setRatingError('connectionError')
      } else {
        setRatingError('genericError')
      }
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

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
    <>
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

      {reservation.estado === 'FINALIZADA' && (
        <View style={[styles.ratingCard, { backgroundColor: theme.card }]}>
          {ratingLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : ratingLoadError ? (
            <>
              <Text style={[styles.ratingMessage, { color: theme.textSecondary }]}>
                {t('ratingFlow.loadError')}
              </Text>
              <TouchableOpacity
                style={[styles.ratingButton, { backgroundColor: theme.primary }]}
                onPress={() => { void loadRatingState(() => true) }}
              >
                <Text style={styles.ratingButtonText}>{t('mobile.services.retry')}</Text>
              </TouchableOpacity>
            </>
          ) : rating ? (
            <>
              <Text style={[styles.ratingMessage, { color: theme.text }]}>
                {ratingSuccess ? t('ratingFlow.success') : t('ratingFlow.alreadyRatedLabel')}
              </Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= rating.puntuacion ? 'star' : 'star-outline'}
                    size={25}
                    color="#F5A623"
                  />
                ))}
                <Text style={[styles.ratingValue, { color: theme.text }]}>{rating.puntuacion}/5</Text>
              </View>
              {!!rating.comentario && (
                <Text style={[styles.ratingComment, { color: theme.textSecondary }]}>{rating.comentario}</Text>
              )}
            </>
          ) : canRate ? (
            <TouchableOpacity
              style={[styles.ratingButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setSelectedRating(0)
                setComment('')
                setRatingError(null)
                setRatingModalVisible(true)
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="star-outline" size={19} color="#FFFFFF" />
              <Text style={styles.ratingButtonText}>{t('ratingFlow.rateService')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

    </ScrollView>

      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !submitting && setRatingModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.ratingModal, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('ratingFlow.title')}</Text>
              <Pressable
                onPress={() => !submitting && setRatingModalVisible(false)}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel={t('ratingFlow.close')}
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalService, { color: theme.text }]}>
                {reservation.nombreServicio || t('mobile.services.serviceFallback')}
              </Text>
              <Text style={[styles.ratingQuestion, { color: theme.textSecondary }]}>
                {t('ratingFlow.question')}
              </Text>

              <View style={styles.starSelector}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => {
                      setSelectedRating(star)
                      setRatingError(null)
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={t('ratingFlow.stars', { count: star })}
                    accessibilityState={{ selected: selectedRating === star }}
                    hitSlop={5}
                  >
                    <Ionicons
                      name={star <= selectedRating ? 'star' : 'star-outline'}
                      size={38}
                      color="#F5A623"
                    />
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: theme.text }]}>{t('ratingFlow.comment')}</Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                maxLength={300}
                multiline
                editable={!submitting}
                placeholder={t('ratingFlow.commentPlaceholder')}
                placeholderTextColor={theme.placeholder}
                textAlignVertical="top"
                style={[styles.commentInput, {
                  color: theme.text,
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                }]}
              />
              <Text style={[styles.characterCount, { color: theme.textSecondary }]}>{comment.length}/300</Text>

              {!!ratingError && (
                <Text style={[styles.formError, { color: theme.errorText }]}>
                  {t(`ratingFlow.${ratingError}`)}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.ratingButton, styles.submitButton, { backgroundColor: theme.primary, opacity: submitting ? 0.65 : 1 }]}
                onPress={() => { void submitRating() }}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? <ActivityIndicator color="#FFFFFF" /> : (
                  <Text style={styles.ratingButtonText}>{t('ratingFlow.submit')}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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

  ratingCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    alignItems: 'center',
    gap: 12,
  },

  ratingButton: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  ratingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  ratingMessage: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },

  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  ratingValue: {
    marginLeft: 7,
    fontWeight: '700',
  },

  ratingComment: {
    fontSize: 14,
    alignSelf: 'stretch',
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },

  ratingModal: {
    maxHeight: '90%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  modalService: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },

  ratingQuestion: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 15,
  },

  starSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 18,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  commentInput: {
    minHeight: 100,
    maxHeight: 180,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },

  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 5,
  },

  formError: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },

  submitButton: {
    marginTop: 16,
    marginBottom: 8,
  },

})

