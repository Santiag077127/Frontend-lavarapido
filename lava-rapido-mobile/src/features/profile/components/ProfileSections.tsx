import React from 'react'
import { ActivityIndicator, Image, type ImageSourcePropType, Switch, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

import LanguageSelector from '../../../components/profile/LanguageSelector'
import type { ThemeTokens } from '../../../theme/themeTokens'
import styles from './profileStyles'

export type AvatarKey = 'avatar_1' | 'avatar_2' | 'avatar_3' | 'avatar_4' | 'avatar_5'

export type AvatarOption = { key: AvatarKey; image: ImageSourcePropType }

type IdentityProps = {
  firstName: string
  lastName: string
  email: string
  avatarImage: ImageSourcePropType
  isSmallScreen: boolean
  theme: ThemeTokens
}

export function ProfileIdentity({ firstName, lastName, email, avatarImage, isSmallScreen, theme }: IdentityProps) {
  const { t } = useTranslation()
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim()

  return (
    <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.avatarBorder, { borderColor: theme.primary }]}>
        <Image
          source={avatarImage}
          accessibilityLabel={t('editProfile.profilePhoto')}
          style={[styles.avatar, {
            width: isSmallScreen ? 95 : 115,
            height: isSmallScreen ? 95 : 115,
            borderRadius: isSmallScreen ? 48 : 58,
          }]}
          resizeMode="cover"
        />
        <View style={[styles.statusDot, { backgroundColor: theme.success, borderColor: theme.card }]} />
      </View>

      <View style={styles.profileIdentity}>
        <View style={[styles.profileBadge, { backgroundColor: theme.primaryContainer }]}>
          <Ionicons name="person-circle-outline" size={15} color={theme.primary} />
          <Text style={[styles.profileBadgeText, { color: theme.primary }]}>{t('profile.title')}</Text>
        </View>
        <Text style={[styles.name, { color: theme.text, fontSize: isSmallScreen ? 20 : 23 }]} numberOfLines={2}>
          {fullName || t('profile.defaultUser')}
        </Text>
        <Text style={[styles.email, { color: theme.textSecondary }]} numberOfLines={2}>
          {email || t('profile.noEmail')}
        </Text>
      </View>
    </View>
  )
}

type InformationProps = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  theme: ThemeTokens
}

function InfoItem({ icon, label, value, theme, last = false }: {
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
        <Text style={[styles.infoValue, { color: theme.text }]}>{value || t('profile.notRegistered')}</Text>
      </View>
    </View>
  )
}

export function ProfileInformation({ firstName, lastName, email, phoneNumber, theme }: InformationProps) {
  const { t } = useTranslation()

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.primaryContainer }]}>
          <Ionicons name="person-outline" size={20} color={theme.primary} />
        </View>
        <View style={styles.sectionHeaderText}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.personalInfo')}</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>{t('profile.registeredData')}</Text>
        </View>
      </View>
      <InfoItem icon="person-outline" label={t('profile.firstName')} value={firstName} theme={theme} />
      <InfoItem icon="person-outline" label={t('profile.lastName')} value={lastName} theme={theme} />
      <InfoItem icon="mail-outline" label={t('profile.email')} value={email} theme={theme} />
      <InfoItem icon="call-outline" label={t('profile.phone')} value={phoneNumber} theme={theme} last />
    </View>
  )
}

type AvatarSelectorProps = {
  avatars: AvatarOption[]
  selectedAvatar: AvatarKey
  changingAvatar: boolean
  onChangeAvatar: (avatar: AvatarKey) => void
  theme: ThemeTokens
}

export function ProfileAvatarSelector({ avatars, selectedAvatar, changingAvatar, onChangeAvatar, theme }: AvatarSelectorProps) {
  const { t } = useTranslation()

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.avatarTitleRow}>
        <View style={styles.sectionHeaderText}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.chooseAvatar')}</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>{t('profile.avatarDescription')}</Text>
        </View>
        {changingAvatar && <ActivityIndicator size="small" color={theme.primary} />}
      </View>
      <View style={[styles.avatarGrid, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
        {avatars.map((item, index) => {
          const selected = selectedAvatar === item.key
          return (
            <TouchableOpacity
              key={item.key}
              accessibilityRole="radio"
              accessibilityLabel={t('accessibility.avatarOption', { number: index + 1 })}
              accessibilityState={{ selected, disabled: changingAvatar }}
              activeOpacity={0.75}
              disabled={changingAvatar}
              onPress={() => onChangeAvatar(item.key)}
              style={[styles.avatarOption, {
                borderColor: selected ? theme.primary : 'transparent',
                backgroundColor: selected ? theme.primaryContainer : 'transparent',
              }]}
            >
              <Image source={item.image} style={styles.avatarMini} resizeMode="cover" />
              {selected && (
                <View style={[styles.check, { backgroundColor: theme.primary, borderColor: theme.card }]}>
                  <Ionicons name="checkmark" size={13} color={theme.onPrimary} />
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

type PreferencesProps = {
  theme: ThemeTokens
  darkMode: boolean
  onToggleDarkMode: (value: boolean) => void
  onEditProfile: () => void
  onOpenVehicles: () => void
}

function MenuItem({ icon, title, description, onPress, theme }: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  title: string
  description: string
  onPress: () => void
  theme: ThemeTokens
}) {
  return (
    <TouchableOpacity accessibilityRole="button" style={[styles.menuItem, { borderColor: theme.border }]} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.menuIcon, { backgroundColor: theme.primaryContainer }]}>
          <Ionicons name={icon} size={20} color={theme.primary} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.menuDescription, { color: theme.textSecondary }]}>{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.icon} />
    </TouchableOpacity>
  )
}

export function ProfilePreferences({ theme, darkMode, onToggleDarkMode, onEditProfile, onOpenVehicles }: PreferencesProps) {
  const { t } = useTranslation()

  return (
    <View style={[styles.card, styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <MenuItem icon="create-outline" title={t('profile.edit')} description={t('profile.editDescription')} onPress={onEditProfile} theme={theme} />
      <MenuItem icon="car-outline" title={t('profile.vehicles')} description={t('profile.vehiclesDescription')} onPress={onOpenVehicles} theme={theme} />
      <LanguageSelector theme={theme} darkMode={darkMode} />
      <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
        <View style={styles.switchLeft}>
          <View style={[styles.menuIcon, { backgroundColor: theme.primaryContainer }]}>
            <Ionicons name={darkMode ? 'moon-outline' : 'sunny-outline'} size={20} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.menuTitle, { color: theme.text }]}>{t('profile.darkMode')}</Text>
            <Text style={[styles.menuDescription, { color: theme.textSecondary }]}>
              {darkMode ? t('profile.enabled') : t('profile.disabled')}
            </Text>
          </View>
        </View>
        <Switch
          accessibilityLabel={t('profile.darkMode')}
          value={darkMode}
          onValueChange={onToggleDarkMode}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={darkMode ? theme.onPrimary : theme.card}
        />
      </View>
    </View>
  )
}
