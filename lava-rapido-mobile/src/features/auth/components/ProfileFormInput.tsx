import React, { useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import type { ThemeTokens } from '../../../theme/themeTokens'
import styles from './editProfileStyles'

type Props = {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  theme: ThemeTokens
  darkMode: boolean
  editable?: boolean
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType']
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize']
  autoCorrect?: boolean
  autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete']
  secureTextEntry?: boolean
  error?: boolean
  errorText?: string
  onBlur?: () => void
}

export default function ProfileFormInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  theme,
  darkMode,
  editable = true,
  keyboardType = 'default',
  autoCapitalize = 'words',
  autoCorrect,
  autoComplete,
  secureTextEntry = false,
  error = false,
  errorText,
  onBlur,
}: Props) {
  const { t } = useTranslation()
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <View
      style={styles.fieldContainer}
    >
      <Text
        style={[
          styles.label,
          {
            color:
              theme.text,
          },
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor:
              theme.inputBackground,

            borderColor: error ? theme.errorText : theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.inputIcon,
            {
              backgroundColor:
                theme.primaryContainer,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={19}
            color={theme.primary}
          />
        </View>

        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={
            onChangeText
          }
          placeholder={
            placeholder
          }
          placeholderTextColor={
            theme.textSecondary
          }
          editable={editable}
          keyboardType={
            keyboardType
          }
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry && !passwordVisible}
          style={[
            styles.input,
            {
              color:
                theme.text,
            },
          ]}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t(passwordVisible ? 'accessibility.hidePassword' : 'accessibility.showPassword')}
            accessibilityState={{ expanded: passwordVisible, disabled: !editable }}
            disabled={!editable}
            hitSlop={8}
            onPress={() => setPasswordVisible((visible) => !visible)}
          >
            <Ionicons
              name={passwordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error && errorText ? (
        <Text accessibilityRole="alert" style={[styles.fieldError, { color: theme.errorText }]}>
          {errorText}
        </Text>
      ) : null}
    </View>
  )
}
