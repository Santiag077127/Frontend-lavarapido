import React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTranslation } from 'react-i18next'
import type { ReservationColors } from './reservationFormTypes'
import styles from './reservationFormStyles'

type Props = {
  selectedTime: Date
  showTimePicker: boolean
  onOpenTimePicker: () => void
  onTimeChange: (event: any, date?: Date) => void
  minHour: number
  maxHour: number
  colors: ReservationColors
}

export default function ReservationTimeCard({ selectedTime, showTimePicker, onOpenTimePicker, onTimeChange, minHour, maxHour, colors }: Props) {
  const { t } = useTranslation()
  return (
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
            onPress={onOpenTimePicker}
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
                onTimeChange
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
            {t('mobile.reservation.schedule', { min: minHour, max: maxHour })}
          </Text>
        </View>
  )
}
