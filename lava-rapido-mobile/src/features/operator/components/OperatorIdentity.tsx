import React from 'react'
import { Image, View, Text, type ImageSourcePropType } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import type { ThemeTokens } from '../../../theme/themeTokens'
import type { UserProfile } from './operatorProfileTypes'
import styles from './operatorProfileStyles'

type Props = { profile: UserProfile; currentAvatar: ImageSourcePropType; isSmallScreen: boolean; theme: ThemeTokens }

export default function OperatorIdentity({ profile, currentAvatar, isSmallScreen, theme }: Props) {
  const { t } = useTranslation()
  const fullName = [profile.firstName ?? '', profile.lastName ?? ''].join(' ').trim()
  return (
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor:
              theme.card,
            borderColor:
              theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.avatarBorder,
            {
              borderColor:
                theme.primary,
            },
          ]}
        >
          <Image
            source={currentAvatar}
            accessibilityLabel={t('editProfile.profilePhoto')}
            style={[
              styles.avatar,
              {
                width:
                  isSmallScreen
                    ? 95
                    : 115,
                height:
                  isSmallScreen
                    ? 95
                    : 115,
                borderRadius:
                  isSmallScreen
                    ? 48
                    : 58,
              },
            ]}
            resizeMode="cover"
          />

          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  theme.success,
                borderColor:
                  theme.card,
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.name,
            {
              color:
                theme.text,
              fontSize:
                isSmallScreen
                  ? 21
                  : 24,
            },
          ]}
          numberOfLines={2}
        >
          {fullName || t('operator.profile.operator')}
        </Text>

        <Text
          style={[
            styles.email,
            {
              color:
                theme.textSecondary,
            },
          ]}
          numberOfLines={1}
        >
          {profile.email ||
            t('operator.profile.noEmail')}
        </Text>

        <View
          style={[
            styles.profileBadge,
            {
              backgroundColor:
                theme.primaryContainer,
            },
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color={theme.primary}
          />

          <Text
            style={[
              styles.profileBadgeText,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            {t('operator.profile.operator').toUpperCase()}
          </Text>
        </View>
      </View>
  )
}
