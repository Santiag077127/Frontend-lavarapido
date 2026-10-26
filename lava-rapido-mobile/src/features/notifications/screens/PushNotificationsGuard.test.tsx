/// <reference types="jest" />

const mockPlatform = { OS: 'android' }
let mockAppOwnership: string | null = 'expo'
let mockExpoVersion: string | null = '58.0.0'
const mockRemove = jest.fn()
const mockNotificationsModuleLoaded = jest.fn()
const mockNotifications = {
  AndroidImportance: { DEFAULT: 3 },
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: mockRemove })),
  getLastNotificationResponse: jest.fn(() => null),
  clearLastNotificationResponse: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}

jest.mock('react-native', () => ({ Platform: mockPlatform }))
jest.mock('expo-constants', () => ({ __esModule: true, default: { get appOwnership() { return mockAppOwnership }, get expoVersion() { return mockExpoVersion }, expoConfig: { extra: { eas: { projectId: 'project-id' } } } } }))
jest.mock('expo-notifications', () => {
  mockNotificationsModuleLoaded()
  return mockNotifications
})
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn() } }))
jest.mock('../../../services/api', () => ({ getToken: jest.fn(() => null) }))
jest.mock('../../../services/notificationService', () => ({ notificationService: { register: jest.fn(), deactivate: jest.fn() } }))

let isRemotePushSupported: typeof import('../../../services/pushNotifications').isRemotePushSupported
let registerPush: typeof import('../../../services/pushNotifications').registerPush
let subscribeToPushResponses: typeof import('../../../services/pushNotifications').subscribeToPushResponses

beforeAll(() => {
  ({ isRemotePushSupported, registerPush, subscribeToPushResponses } = require('../../../services/pushNotifications'))
})

beforeEach(() => {
  jest.clearAllMocks()
  mockPlatform.OS = 'android'
  mockAppOwnership = 'expo'
  mockExpoVersion = '58.0.0'
})

test('omite la inicialización de push remoto en Expo Go', async () => {
  expect(isRemotePushSupported()).toBe(false)
  const unsubscribe = subscribeToPushResponses(jest.fn())
  await registerPush()
  unsubscribe()
  expect(mockNotificationsModuleLoaded).not.toHaveBeenCalled()
  expect(mockNotifications.addNotificationResponseReceivedListener).not.toHaveBeenCalled()
  expect(mockNotifications.setNotificationHandler).not.toHaveBeenCalled()
  expect(mockNotifications.setNotificationChannelAsync).not.toHaveBeenCalled()
})

test('conserva el listener para un build Android compatible', () => {
  mockAppOwnership = 'standalone'
  mockExpoVersion = null
  expect(isRemotePushSupported()).toBe(true)
  const unsubscribe = subscribeToPushResponses(jest.fn())
  expect(mockNotificationsModuleLoaded).toHaveBeenCalledTimes(1)
  expect(mockNotifications.setNotificationHandler).toHaveBeenCalled()
  expect(mockNotifications.addNotificationResponseReceivedListener).toHaveBeenCalled()
  unsubscribe()
  expect(mockRemove).toHaveBeenCalled()
})

test('skips push in Expo Go when appOwnership is unavailable', () => {
  mockAppOwnership = null
  expect(isRemotePushSupported()).toBe(false)
  subscribeToPushResponses(jest.fn())
  expect(mockNotificationsModuleLoaded).not.toHaveBeenCalled()
})

test('keeps push enabled in development builds outside Expo Go', () => {
  mockAppOwnership = null
  mockExpoVersion = null
  expect(isRemotePushSupported()).toBe(true)
})
