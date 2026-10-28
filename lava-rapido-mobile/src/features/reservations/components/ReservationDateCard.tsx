import React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTranslation } from 'react-i18next'
import { startOfLocalDay } from '../../../services/reservationSchedule'
import type { ReservationColors } from './reservationFormTypes'
import styles from './reservationFormStyles'

type Props = {
  selectedDate: Date
  showDatePicker: boolean
  onOpenDatePicker: () => void
  onDateChange: (event: any, date?: Date) => void
  colors: ReservationColors
}

export default function ReservationDateCard({ selectedDate, showDatePicker, onOpenDatePicker, onDateChange, colors }: Props) {
  const { t } = useTranslation()
  return (
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
            onPress={onOpenDatePicker}
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
                onDateChange
              }
            />
          )}
        </View>
  )
}
