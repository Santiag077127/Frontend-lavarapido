import React from 'react'
import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import type { ThemeTokens } from '../../../theme/themeTokens'
import styles from './operatorProfileStyles'
import { InfoItem } from './OperatorInformation'

type Props = { theme: ThemeTokens }

export default function OperatorRoleInformation({ theme }: Props) {
  const { t } = useTranslation()
  return (
    <>
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
              name="briefcase-outline"
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
              {t('operator.profile.accountInfo')}
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
              {t('operator.profile.accountDescription')}
            </Text>
          </View>
        </View>

        <InfoItem
          icon="shield-checkmark-outline"
          label={t('operator.profile.role')}
          value={t('operator.profile.operator')}
          theme={theme}
        />

        <InfoItem
          icon="checkmark-circle-outline"
          label={t('operator.profile.status')}
          value={t('vehicles.status.active')}
          theme={theme}
          last
        />
      </View>
      <View
        style={[
          styles.readOnlyCard,
          {
            backgroundColor: theme.interactiveSurface,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.readOnlyIcon,
            {
              backgroundColor: theme.primarySoft,
            },
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={theme.primary}
          />
        </View>

        <View
          style={
            styles.readOnlyContent
          }
        >
          <Text
            style={[
              styles.readOnlyTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            {t('operator.profile.protectedTitle')}
          </Text>

          <Text
            style={[
              styles.readOnlyText,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            {t('operator.profile.protectedMessage')}
          </Text>
        </View>
      </View>
    </>
  )
}
