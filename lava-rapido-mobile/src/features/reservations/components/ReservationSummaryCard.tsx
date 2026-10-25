import React from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { ReservationColors } from './reservationFormTypes'
import styles from './reservationFormStyles'

type Props = {
  serviceName: string
  selectedDateText: string
  selectedTimeText: string
  formattedPrice: string
  colors: ReservationColors
}

export default function ReservationSummaryCard({ serviceName, selectedDateText, selectedTimeText, formattedPrice, colors }: Props) {
  const { t } = useTranslation()
  return (
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
              {selectedDateText}
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
              {selectedTimeText}
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
  )
}
