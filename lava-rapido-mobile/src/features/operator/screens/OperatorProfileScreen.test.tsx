import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { RefreshControl } from 'react-native'

import OperatorProfileScreen from './OperatorProfileScreen'

const mockGet = jest.fn()
const mockPut = jest.fn()
const mockSetToken = jest.fn()
const mockAlert = jest.fn()
const mockSetDarkMode = jest.fn()
const mockSetIsLoggedIn = jest.fn()

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}))
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
jest.mock('../../../components/profile/LanguageSelector', () => () => null)
jest.mock('../../../components/notifications/NotificationProvider', () => ({
  appAlert: { alert: (...args: unknown[]) => mockAlert(...args) },
}))
jest.mock('../../../components/notifications/ConfirmationModal', () => ({
  __esModule: true,
  default: ({ visible, confirmLabel, cancelLabel, onConfirm, onCancel }: {
    visible: boolean
    confirmLabel: string
    cancelLabel: string
    onConfirm: () => void
    onCancel: () => void
  }) => {
    if (!visible) return null
    const ReactModule = require('react')
    const { Pressable, Text, View } = require('react-native')
    return ReactModule.createElement(View, null,
      ReactModule.createElement(Pressable, { accessibilityRole: 'button', onPress: onConfirm },
        ReactModule.createElement(Text, null, confirmLabel)),
      ReactModule.createElement(Pressable, { accessibilityRole: 'button', onPress: onCancel },
        ReactModule.createElement(Text, null, cancelLabel)),
    )
  },
}))
jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    put: (...args: unknown[]) => mockPut(...args),
  },
  setToken: (...args: unknown[]) => mockSetToken(...args),
}))
jest.mock('../../../assets/images', () => ({
  images: { avatar1: 1, avatar2: 2, avatar3: 3, avatar4: 4, avatar5: 5 },
}))
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: new Proxy({}, { get: () => '#fff' }),
    darkMode: false,
    setDarkMode: (...args: unknown[]) => mockSetDarkMode(...args),
  }),
}))

const profile = {
  userId: 'operator-1',
  email: 'operator@example.test',
  firstName: 'Operator',
  lastName: 'User',
  phoneNumber: '3000000000',
  profilePicture: 'avatar_2',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGet.mockResolvedValue({ data: profile })
  mockPut.mockResolvedValue({ data: { ...profile, profilePicture: 'avatar_3' } })
})

test('loads the operator once and renders identity, role and personal data', async () => {
  const view = render(<OperatorProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />)
  await waitFor(() => expect(view.getByText('Operator User')).toBeTruthy(), { timeout: 10000 })

  expect(mockGet).toHaveBeenCalledTimes(1)
  expect(mockGet).toHaveBeenCalledWith('/api/users/profile')
  expect(view.getAllByText('operator@example.test')).toHaveLength(2)
  expect(view.getByText('operator.profile.accountInfo')).toBeTruthy()
  expect(view.getByText('operator.profile.protectedTitle')).toBeTruthy()
  expect(view.getAllByRole('radio')).toHaveLength(5)
  expect(view.getAllByRole('radio')[1].props.accessibilityState.selected).toBe(true)
  expect(view.getByLabelText('editProfile.profilePhoto').props.source).toBe(2)
})

test('preserves the avatar update payload and selected state', async () => {
  const view = render(<OperatorProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />)
  await waitFor(() => expect(view.getByText('Operator User')).toBeTruthy())

  fireEvent.press(view.getAllByRole('radio')[2])
  await waitFor(() => expect(mockPut).toHaveBeenCalledWith('/api/users/profile', {
    firstName: 'Operator',
    lastName: 'User',
    phoneNumber: '3000000000',
    profilePicture: 'avatar_3',
  }))
  await waitFor(() => expect(view.getAllByRole('radio')[2].props.accessibilityState.selected).toBe(true))
  expect(mockPut).toHaveBeenCalledTimes(1)
})

test('does not update the already selected avatar', async () => {
  const view = render(<OperatorProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />)
  await waitFor(() => expect(view.getByText('Operator User')).toBeTruthy())
  fireEvent.press(view.getAllByRole('radio')[1])
  expect(mockPut).not.toHaveBeenCalled()
})

test('keeps the selected avatar when the update fails', async () => {
  mockPut.mockRejectedValueOnce({ response: { status: 400 } })
  const view = render(<OperatorProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />)
  await waitFor(() => expect(view.getByText('Operator User')).toBeTruthy())
  fireEvent.press(view.getAllByRole('radio')[2])

  await waitFor(() => expect(mockAlert).toHaveBeenCalledWith(
    'operator.profile.errorTitle', 'operator.profile.badRequest', undefined, 'error',
  ))
  expect(view.getAllByRole('radio')[1].props.accessibilityState.selected).toBe(true)
  expect(mockPut).toHaveBeenCalledTimes(1)
})

test('keeps the existing appearance switch', async () => {
  const view = render(<OperatorProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />)
  await waitFor(() => expect(view.getByText('Operator User')).toBeTruthy())
  fireEvent(view.getByLabelText('operator.profile.darkMode'), 'valueChange', true)
  expect(mockSetDarkMode).toHaveBeenCalledWith(true)
})

test('requires confirmation for logout and preserves the session action', async () => {
  const view = render(<OperatorProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />)
  await waitFor(() => expect(view.getByText('Operator User')).toBeTruthy())

  fireEvent.press(view.getByText('operator.profile.logout'))
  expect(mockSetToken).not.toHaveBeenCalled()
  fireEvent.press(view.getByRole('button', { name: 'common.cancel' }))
  expect(mockSetToken).not.toHaveBeenCalled()
  fireEvent.press(view.getByText('operator.profile.logout'))
  fireEvent.press(view.getAllByRole('button', { name: 'operator.profile.logout' })[1])
  expect(mockSetToken).toHaveBeenCalledWith(null)
  expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false)
})

test('shows loading until the profile request finishes', async () => {
  let resolveProfile: (value: { data: typeof profile }) => void = () => {}
  mockGet.mockReturnValueOnce(new Promise(resolve => { resolveProfile = resolve }))
  const view = render(<OperatorProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />)
  expect(view.getByText('operator.profile.loading')).toBeTruthy()
  await act(async () => resolveProfile({ data: profile }))
  expect(view.getByText('Operator User')).toBeTruthy()
  expect(mockGet).toHaveBeenCalledTimes(1)
})

test('offers retry after a load error without duplicate requests', async () => {
  mockGet.mockRejectedValueOnce({ response: { status: 503 } })
  const view = render(<OperatorProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />)
  await waitFor(() => expect(view.getByText('operator.profile.loadErrorTitle')).toBeTruthy())
  expect(mockGet).toHaveBeenCalledTimes(1)
  fireEvent.press(view.getByText('common.retry'))
  await waitFor(() => expect(view.getByText('Operator User')).toBeTruthy())
  expect(mockGet).toHaveBeenCalledTimes(2)
})

test('refreshes on demand without changing the initial request count', async () => {
  const view = render(<OperatorProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />)
  await waitFor(() => expect(view.getByText('Operator User')).toBeTruthy())
  act(() => view.UNSAFE_getByType(RefreshControl).props.onRefresh())
  await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2))
})

test('preserves the session-expired action on unauthorized profile responses', async () => {
  mockGet.mockRejectedValueOnce({ response: { status: 401 } })
  render(<OperatorProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />)
  await waitFor(() => expect(mockAlert).toHaveBeenCalledWith(
    'operator.profile.sessionExpired', 'operator.profile.loginAgain', expect.any(Array), 'error',
  ))
  expect(mockSetToken).not.toHaveBeenCalled()
  act(() => mockAlert.mock.calls[0][2][0].onPress())
  expect(mockSetToken).toHaveBeenCalledWith(null)
  expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false)
})
