import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { isValidEmail } from '../../../services/validators'
import type { ThemeTokens } from '../../../theme/themeTokens'
import ProfileFormInput from './ProfileFormInput'
import styles from './editProfileStyles'

type Props = {
  currentEmail: string | null | undefined
  newEmail: string
  currentPassword: string
  emailTouched: boolean
  onEmailChange: (value: string) => void
  onEmailBlur: () => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
  saving: boolean
  savingEmail: boolean
  theme: ThemeTokens
  darkMode: boolean
}

export default function EmailChangeForm({ currentEmail, newEmail, currentPassword, emailTouched, onEmailChange, onEmailBlur, onPasswordChange, onSubmit, saving, savingEmail, theme, darkMode }: Props) {
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
              <Ionicons name="mail-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.emailHeaderText}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('emailChange.title')}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                {t('emailChange.subtitle')}
              </Text>
            </View>
          </View>

          <Text style={[styles.helperText, styles.currentEmail, { color: theme.textSecondary }]}>
            {t('emailChange.currentEmail', {
              email: currentEmail || t('editProfile.noEmail'),
            })}
          </Text>

          <ProfileFormInput
            label={t('emailChange.newEmail')}
            value={newEmail}
            onChangeText={onEmailChange}
            onBlur={onEmailBlur}
            placeholder={t('emailChange.newEmailPlaceholder')}
            icon="mail-outline"
            theme={theme}
            darkMode={darkMode}
            error={emailTouched && newEmail.trim().length > 0 && !isValidEmail(newEmail)}
            errorText={t('emailChange.invalidEmail')}
            editable={!saving && !savingEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />

          <ProfileFormInput
            label={t('emailChange.currentPassword')}
            value={currentPassword}
            onChangeText={onPasswordChange}
            placeholder={t('emailChange.currentPassword')}
            icon="lock-closed-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving && !savingEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            secureTextEntry
          />

          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ disabled: saving || savingEmail, busy: savingEmail }}
            accessibilityLiveRegion="polite"
            accessibilityLabel={t('emailChange.submit')}
            disabled={saving || savingEmail}
            onPress={onSubmit}
            style={[
              styles.saveButton,
              styles.emailSubmitButton,
              {
                backgroundColor: theme.primary,
                opacity: saving || savingEmail ? 0.75 : 1,
              },
            ]}
          >
            {savingEmail
              ? <ActivityIndicator size="small" color={theme.onPrimary} />
              : <Ionicons name="mail-outline" size={20} color={theme.onPrimary} />}
            <Text style={[styles.saveText, { color: theme.onPrimary }]}>
              {savingEmail ? t('emailChange.saving') : t('emailChange.submit')}
            </Text>
          </TouchableOpacity>
        </View>
  )
}
