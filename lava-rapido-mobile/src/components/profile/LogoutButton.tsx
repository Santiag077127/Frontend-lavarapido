import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ThemeTokens } from '../../theme/themeTokens'

type Props = {
  label: string
  theme: ThemeTokens
  onPress: () => void
  disabled?: boolean
  busy?: boolean
}

export default function LogoutButton({ label, theme, onPress, disabled = false, busy = false }: Props) {
  const unavailable = disabled || busy
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: unavailable, busy }}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.errorBackground, borderColor: theme.errorBorder, shadowColor: theme.errorAction },
        pressed && !unavailable && styles.pressed,
        unavailable && styles.unavailable,
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.errorAction }]}>
          {busy
            ? <ActivityIndicator size="small" color={theme.errorOnAction} />
            : <Ionicons name="log-out-outline" size={21} color={theme.errorOnAction} />}
        </View>
        <Text style={[styles.label, { color: theme.errorText }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={21} color={theme.errorText} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: { minHeight: 60, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderWidth: 1, elevation: 1, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 4 },
  content: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '800', fontSize: 15.5, marginLeft: 8 },
  pressed: { opacity: 0.72 },
  unavailable: { opacity: 0.55 },
})
