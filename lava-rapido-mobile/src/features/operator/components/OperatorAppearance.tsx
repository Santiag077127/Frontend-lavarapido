import React from 'react'
import { Switch, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../../components/profile/LanguageSelector'
import type { ThemeTokens } from '../../../theme/themeTokens'
import styles from './operatorProfileStyles'

type Props = { theme: ThemeTokens; darkMode: boolean; setDarkMode: (value: boolean) => void }

export default function OperatorAppearance({ theme, darkMode, setDarkMode }: Props) {
  const { t } = useTranslation()
  return (
      <View
        style={[
          styles.card,
          styles.menuCard,
          {
            backgroundColor:
              theme.card,
            borderColor:
              theme.border,
          },
        ]}
      >
        <View
          style={styles.avatarTitleRow}
        >
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
              {t('operator.profile.appearance')}
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
              {t('operator.profile.appearanceDescription')}
            </Text>
          </View>
        </View>

        <LanguageSelector
          theme={theme}
          darkMode={darkMode}
        />

        <View
          style={[
            styles.switchRow,
            {
              borderBottomWidth: 0,
            },
          ]}
        >
          <View
            style={styles.switchLeft}
          >
            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor:
                    theme.primaryContainer,
                },
              ]}
            >
              <Ionicons
                name={
                  darkMode
                    ? 'moon-outline'
                    : 'sunny-outline'
                }
                size={20}
                color={theme.primary}
              />
            </View>

            <View
              style={
                styles.menuTextContainer
              }
            >
              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {t('operator.profile.darkMode')}
              </Text>

              <Text
                style={[
                  styles.menuDescription,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                {darkMode
                  ? t('operator.profile.enabled')
                  : t('operator.profile.disabled')}
              </Text>
            </View>
          </View>

          <Switch
            accessibilityLabel={t('operator.profile.darkMode')}
            value={darkMode}
            onValueChange={
              setDarkMode
            }
            trackColor={{
              false: theme.border,
              true: theme.primary,
            }}
            thumbColor={darkMode ? theme.onPrimary : theme.card}
          />
        </View>
      </View>
  )
}
