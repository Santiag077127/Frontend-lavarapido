import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import type { ThemeTokens } from '../../../theme/themeTokens'
import styles from './editProfileStyles'

type Props = { onChangePassword: () => void; theme: ThemeTokens }

export default function ProfileSecuritySection({ onChangePassword, theme }: Props) {
  const { t } = useTranslation()
  return (
        <View
          style={[
            styles.formCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.primaryContainer }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.emailHeaderText}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('changePassword.title')}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                {t('changePassword.subtitle')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('changePassword.menuTitle')}
            accessibilityHint={t('changePassword.menuDescription')}
            activeOpacity={0.85}
            onPress={onChangePassword}
            style={[styles.securityAction, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}
          >
            <View style={[styles.securityActionIcon, { backgroundColor: theme.primaryContainer }]}>
              <Ionicons name="key-outline" size={19} color={theme.primary} />
            </View>
            <View style={styles.securityActionText}>
              <Text style={[styles.securityActionTitle, { color: theme.text }]}>
                {t('changePassword.menuTitle')}
              </Text>
              <Text style={[styles.securityActionDescription, { color: theme.textSecondary }]}>
                {t('changePassword.menuDescription')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
  )
}
