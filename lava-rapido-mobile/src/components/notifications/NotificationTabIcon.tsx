import React, { useContext } from 'react'
import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { useNotification } from './NotificationProvider'
import { ThemeContext } from '../../theme/ThemeContext'

type Props = {
  color: string
  size: number
}

export default function NotificationTabIcon({ color, size }: Props) {
  const { theme } = useContext(ThemeContext)
  const { hasUnreadNotifications } = useNotification()

  return (
    <View style={[styles.icon, { width: size + 4, height: size + 4 }]}>
      <Ionicons name="notifications" size={size} color={color} />
      {hasUnreadNotifications && (
        <View
          testID="notification-unread-dot"
          pointerEvents="none"
          style={[styles.dot, { borderColor: theme.card }]}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
    backgroundColor: '#F97316',
  },
})
