import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getToken } from './api';
import { notificationService } from './notificationService';

const installationKey = 'push-installation-id';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false,
  }),
});

async function installationId(): Promise<string> {
  let id = await AsyncStorage.getItem(installationKey);
  if (!id) {
    id = `install-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(installationKey, id);
  }
  return id;
}

export async function registerPush(): Promise<void> {
  if (Platform.OS !== 'android' || Constants.appOwnership === 'expo') return;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (typeof projectId !== 'string' || !projectId || !getToken()) return;
  await Notifications.setNotificationChannelAsync('general', {
    name: 'Notificaciones', importance: Notifications.AndroidImportance.DEFAULT,
  });
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    await deactivatePush();
    return;
  }
  const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await notificationService.register(await installationId(), pushToken);
}

export async function deactivatePush(): Promise<void> {
  const authToken = getToken();
  if (!authToken) return;
  const id = await AsyncStorage.getItem(installationKey);
  if (id) await notificationService.deactivate(id, authToken);
}
