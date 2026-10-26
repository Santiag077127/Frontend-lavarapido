import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { ReservationColors } from './reservationFormTypes'
import styles from './reservationFormStyles'

type Props = {
  serviceName: string
  selectedDateText: string
  selectedTimeText: string
  formattedPrice: string
  colors: ReservationColors
  onOpenTerms: () => void
}

export default function ReservationSummaryCard({ serviceName, selectedDateText, selectedTimeText, formattedPrice, colors, onOpenTerms }: Props) {
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
          <View style={[styles.policyNotice, { borderTopColor: colors.border }]}>
            <Text style={[styles.policyText, { color: colors.secondaryText }]}>
              {t('mobile.reservation.cancellationPolicySummary')}
            </Text>
            <Pressable accessibilityRole="link" onPress={onOpenTerms}>
              <Text style={[styles.policyLink, { color: colors.primary }]}>
                {t('mobile.reservation.readCancellationPolicy')}
              </Text>
            </Pressable>
          </View>
        </View>
  )
}
