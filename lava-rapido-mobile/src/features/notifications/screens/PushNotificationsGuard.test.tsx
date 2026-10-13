/// <reference types="jest" />

const mockPlatform = { OS: 'android' }
let mockAppOwnership: string | null = 'expo'
const mockRemove = jest.fn()
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
jest.mock('expo-constants', () => ({ __esModule: true, default: { get appOwnership() { return mockAppOwnership }, expoConfig: { extra: { eas: { projectId: 'project-id' } } } } }))
jest.mock('expo-notifications', () => mockNotifications)
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
})

test('omite la inicialización de push remoto en Expo Go', async () => {
  expect(isRemotePushSupported()).toBe(false)
  const unsubscribe = subscribeToPushResponses(jest.fn())
  await registerPush()
  unsubscribe()
  expect(mockNotifications.addNotificationResponseReceivedListener).not.toHaveBeenCalled()
  expect(mockNotifications.setNotificationHandler).not.toHaveBeenCalled()
  expect(mockNotifications.setNotificationChannelAsync).not.toHaveBeenCalled()
})

test('conserva el listener para un build Android compatible', () => {
  mockAppOwnership = 'standalone'
  expect(isRemotePushSupported()).toBe(true)
  const unsubscribe = subscribeToPushResponses(jest.fn())
  expect(mockNotifications.setNotificationHandler).toHaveBeenCalled()
  expect(mockNotifications.addNotificationResponseReceivedListener).toHaveBeenCalled()
  unsubscribe()
  expect(mockRemove).toHaveBeenCalled()
})
