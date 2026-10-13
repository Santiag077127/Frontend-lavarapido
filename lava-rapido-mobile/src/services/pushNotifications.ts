import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { getToken } from './api'
import { notificationService } from './notificationService'

type ExpoNotifications = typeof import('expo-notifications')

const installationKey = 'push-installation-id'
let handlerConfigured = false

export function isRemotePushSupported(): boolean {
  return Platform.OS === 'android' && Constants.appOwnership !== 'expo'
}

function notificationsModule(): ExpoNotifications | null {
  if (!isRemotePushSupported()) return null
  // Expo Go SDK 53 no longer includes Android remote push support. Keep this require
  // unreachable there so that Expo Go can still load the rest of the application.
  return require('expo-notifications') as ExpoNotifications
}

function configureHandler(notifications: ExpoNotifications): void {
  if (handlerConfigured) return
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false,
    }),
  })
  handlerConfigured = true
}

async function installationId(): Promise<string> {
  let id = await AsyncStorage.getItem(installationKey)
  if (!id) {
    id = `install-${Date.now()}-${Math.random().toString(36).slice(2)}`
    await AsyncStorage.setItem(installationKey, id)
  }
  return id
}

export function subscribeToPushResponses(onResponse: () => void): () => void {
  const notifications = notificationsModule()
  if (!notifications) return () => {}
  configureHandler(notifications)
  const subscription = notifications.addNotificationResponseReceivedListener(onResponse)
  if (notifications.getLastNotificationResponse()) onResponse()
  return () => subscription.remove()
}

export function clearLastPushResponse(): void {
  notificationsModule()?.clearLastNotificationResponse()
}

export async function registerPush(): Promise<void> {
  const notifications = notificationsModule()
  if (!notifications) return
  configureHandler(notifications)
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  if (typeof projectId !== 'string' || !projectId || !getToken()) return
  await notifications.setNotificationChannelAsync('general', {
    name: 'Notificaciones', importance: notifications.AndroidImportance.DEFAULT,
  })
  let permission = await notifications.getPermissionsAsync()
  if (!permission.granted) permission = await notifications.requestPermissionsAsync()
  if (!permission.granted) {
    await deactivatePush()
    return
  }
  const pushToken = (await notifications.getExpoPushTokenAsync({ projectId })).data
  await notificationService.register(await installationId(), pushToken)
}

export async function deactivatePush(): Promise<void> {
  if (!isRemotePushSupported()) return
  const authToken = getToken()
  if (!authToken) return
  const id = await AsyncStorage.getItem(installationKey)
  if (id) await notificationService.deactivate(id, authToken)
}
