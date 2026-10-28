import React from 'react'
import { Image, Text, TouchableOpacity, View, type ImageSourcePropType } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import type { ThemeTokens } from '../../../theme/themeTokens'
import type { AvatarKey, AvatarOption } from './editProfileTypes'
import styles from './editProfileStyles'

type Props = {
  avatars: AvatarOption[]
  selectedAvatar: AvatarKey
  getAvatarImage: (avatar: AvatarKey) => ImageSourcePropType
  onSelectAvatar: (avatar: AvatarKey) => void
  saving: boolean
  savingEmail: boolean
  theme: ThemeTokens
}

export default function ProfileAvatarPicker({ avatars, selectedAvatar, getAvatarImage, onSelectAvatar, saving, savingEmail, theme }: Props) {
  const { t } = useTranslation()
  return (
        <View
          style={[
            styles.profileCard,
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
              styles.avatarWrapper,
              {
                borderColor:
                  theme.primary,
              },
            ]}
          >
            <Image
              source={getAvatarImage(
                selectedAvatar
              )}
              style={styles.mainAvatar}
              resizeMode="cover"
            />
          </View>

          <Text
            style={[
              styles.avatarTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            {t('editProfile.profilePhoto')}
          </Text>

          <Text
            style={[
              styles.avatarSubtitle,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            {t('editProfile.chooseAvatar')}
          </Text>

          <View
            style={styles.avatarGrid}
          >
            {avatars.map((item, index) => {
              const selected =
                selectedAvatar ===
                item.key

              return (
                <TouchableOpacity
                  key={item.key}
                  accessibilityRole="radio"
                  accessibilityLabel={t('accessibility.avatarOption', { number: index + 1 })}
                  accessibilityState={{ selected }}
                  activeOpacity={0.75}
                  disabled={saving || savingEmail}
                  onPress={() =>
                    onSelectAvatar(
                      item.key
                    )
                  }
                  style={[
                    styles.avatarOption,
                    {
                      borderColor:
                        selected
                          ? theme.primary
                          : 'transparent',

                      backgroundColor:
                        selected
                          ? theme.primaryContainer
                          : 'transparent',
                    },
                  ]}
                >
                  <Image
                    source={item.image}
                    style={
                      styles.smallAvatar
                    }
                    resizeMode="cover"
                  />

                  {selected && (
                    <View
                      style={[
                        styles.avatarCheck,
                        {
                          backgroundColor:
                            theme.primary,
                          borderColor:
                            theme.card,
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={theme.onPrimary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
  )
}
