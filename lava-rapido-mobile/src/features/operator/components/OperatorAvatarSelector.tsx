import React from 'react'
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import type { ThemeTokens } from '../../../theme/themeTokens'
import type { AvatarKey, AvatarOption } from './operatorProfileTypes'
import styles from './operatorProfileStyles'

type Props = { avatars: AvatarOption[]; selectedAvatar: AvatarKey; savingAvatar: boolean; onChangeAvatar: (avatar: AvatarKey) => void; theme: ThemeTokens }

export default function OperatorAvatarSelector({ avatars, selectedAvatar, savingAvatar, onChangeAvatar, theme }: Props) {
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
              name="image-outline"
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
              {t('operator.profile.photoTitle')}
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
              {t('operator.profile.photoDescription')}
            </Text>
          </View>
        </View>

        <View
          style={styles.avatarGrid}
        >
          {avatars.map(
            (avatar, index) => {
              const isSelected =
                selectedAvatar ===
                avatar.key

              return (
                <TouchableOpacity
                  accessibilityRole="radio"
                  accessibilityLabel={t('accessibility.avatarOption', { number: index + 1 })}
                  accessibilityState={{ selected: isSelected, disabled: savingAvatar }}
                  key={
                    avatar.key
                  }
                  activeOpacity={0.8}
                  disabled={
                    savingAvatar
                  }
                  onPress={() =>
                    onChangeAvatar(
                      avatar.key
                    )
                  }
                  style={[
                    styles.avatarOption,
                    {
                      borderColor:
                        isSelected
                          ? theme.primary
                          : theme.border,
                      backgroundColor:
                        theme.interactiveSurface,
                    },
                    isSelected && {
                      borderWidth: 3,
                    },
                  ]}
                >
                  <Image
                    source={
                      avatar.image
                    }
                    style={
                      styles.avatarOptionImage
                    }
                    resizeMode="cover"
                  />

                  {isSelected && (
                    <View
                      style={[
                        styles.avatarCheck,
                        {
                          backgroundColor:
                            theme.primary,
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color={theme.onPrimary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              )
            }
          )}
        </View>

        {savingAvatar && (
          <View
            style={
              styles.avatarSaving
            }
          >
            <ActivityIndicator
              size="small"
              color={
                theme.primary
              }
            />

            <Text
              style={[
                styles.avatarSavingText,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              {t('operator.profile.savingAvatar')}
            </Text>
          </View>
        )}
      </View>
  )
}
