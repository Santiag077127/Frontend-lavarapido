import React from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { ReservationColors, ReservationSectionTheme } from './reservationFormTypes'
import styles from './reservationFormStyles'

type Props = {
  serviceName: string
  serviceDescription: string
  formattedPrice: string
  serviceDuration: number
  colors: ReservationColors
  theme: ReservationSectionTheme
}

export default function SelectedServiceCard({ serviceName, serviceDescription, formattedPrice, serviceDuration, colors, theme }: Props) {
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
  )
}
