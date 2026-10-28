import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import type { ThemeTokens } from '../../../theme/themeTokens'
import ProfileFormInput from './ProfileFormInput'
import styles from './editProfileStyles'

type Props = {
  firstName: string
  lastName: string
  phoneNumber: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onCancel: () => void
  onSave: () => void
  saving: boolean
  savingEmail: boolean
  theme: ThemeTokens
  darkMode: boolean
}

export default function PersonalInformationForm({ firstName, lastName, phoneNumber, onFirstNameChange, onLastNameChange, onPhoneChange, onCancel, onSave, saving, savingEmail, theme, darkMode }: Props) {
  const { t } = useTranslation()
  return (
        <View
          style={[
            styles.formCard,
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

            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {t('editProfile.personalInfo')}
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
                {t('editProfile.modifyData')}
              </Text>
            </View>
          </View>

          <ProfileFormInput
            label={t('editProfile.firstName')}
            value={firstName}
            onChangeText={
              onFirstNameChange
            }
            placeholder={t('editProfile.firstNamePlaceholder')}
            icon="person-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving && !savingEmail}
          />

          <ProfileFormInput
            label={t('editProfile.lastName')}
            value={lastName}
            onChangeText={
              onLastNameChange
            }
            placeholder={t('editProfile.lastNamePlaceholder')}
            icon="person-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving && !savingEmail}
          />

          <ProfileFormInput
            label={t('editProfile.phone')}
            value={phoneNumber}
            onChangeText={
              onPhoneChange
            }
            placeholder={t('editProfile.phonePlaceholder')}
            icon="call-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving && !savingEmail}
            keyboardType="phone-pad"
          />

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              disabled={saving || savingEmail}
              onPress={onCancel}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  opacity: saving || savingEmail ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons name="close-outline" size={20} color={theme.text} />
              <Text style={[styles.cancelText, { color: theme.text }]}>
                {t('editProfile.cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving || savingEmail, busy: saving }}
              accessibilityLiveRegion="polite"
              disabled={saving || savingEmail}
              onPress={onSave}
              accessibilityLabel={saving ? `${t('editProfile.save')}, ${t('accessibility.inProgress')}` : t('editProfile.save')}
              style={[
                styles.saveButton,
                {
                  backgroundColor: theme.primary,
                  opacity: saving || savingEmail ? 0.75 : 1,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.onPrimary} />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.onPrimary} />
              )}
              <Text style={[styles.saveText, { color: theme.onPrimary }]}>
                {saving ? t('editProfile.saving') : t('editProfile.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
  )
}
