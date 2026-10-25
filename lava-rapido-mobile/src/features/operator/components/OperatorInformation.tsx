import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import type { ThemeTokens } from '../../../theme/themeTokens'
import type { UserProfile } from './operatorProfileTypes'
import styles from './operatorProfileStyles'

type Props = { profile: UserProfile; theme: ThemeTokens }

export default function OperatorInformation({ profile, theme }: Props) {
  const { t } = useTranslation()
  return (
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              theme.card,
            borderColor:
              theme.border,
          },
        ]}
      >
        <View
          style={styles.sectionHeader}
        >
          <View
            style={[
              styles.sectionIcon,
              {
                backgroundColor:
                  theme.primaryContainer,
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={theme.primary}
            />
          </View>

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              {t('operator.profile.personalInfo')}
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              {t('operator.profile.personalDescription')}
            </Text>
          </View>
        </View>

        <InfoItem
          icon="person-outline"
          label={t('operator.profile.firstName')}
          value={profile.firstName}
          theme={theme}
        />

        <InfoItem
          icon="person-outline"
          label={t('operator.profile.lastName')}
          value={profile.lastName}
          theme={theme}
        />

        <InfoItem
          icon="mail-outline"
          label={t('operator.profile.email')}
          value={profile.email}
          theme={theme}
        />

        <InfoItem
          icon="call-outline"
          label={t('operator.profile.phone')}
          value={profile.phoneNumber}
          theme={theme}
          last
        />
      </View>
  )
}

export function InfoItem({ icon, label, value, theme, last = false }: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  value: string
  theme: ThemeTokens
  last?: boolean
}) {
  const { t } = useTranslation()
  return (
    <View style={[styles.infoRow, { borderColor: theme.border }, last && { borderBottomWidth: 0 }]}>
      <View style={[styles.infoIcon, { backgroundColor: theme.primaryContainer }]}>
        <Ionicons name={icon} size={19} color={theme.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value || t('operator.profile.notRegistered')}</Text>
      </View>
    </View>
  )
}
