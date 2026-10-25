import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import { darkTheme, lightTheme } from '../../../theme/themeTokens'
import { ProfileAvatarSelector, ProfileIdentity, ProfileInformation, ProfilePreferences, type AvatarOption } from './ProfileSections'

const mockOnChangeAvatar = jest.fn()
const mockOnEditProfile = jest.fn()
const mockOnOpenVehicles = jest.fn()
const mockOnToggleDarkMode = jest.fn()

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
jest.mock('../../../components/profile/LanguageSelector', () => () => null)

const avatars: AvatarOption[] = [
  { key: 'avatar_1', image: 1 },
  { key: 'avatar_2', image: 2 },
]

beforeEach(() => jest.clearAllMocks())

test('shows identity fallbacks and preserves the photo accessibility label in both themes', () => {
  const light = render(
    <ProfileIdentity firstName="" lastName="" email="" avatarImage={1} isSmallScreen theme={lightTheme} />,
  )
  expect(light.getByText('profile.defaultUser')).toBeTruthy()
  expect(light.getByText('profile.noEmail')).toBeTruthy()
  expect(light.getByLabelText('editProfile.profilePhoto').props.source).toBe(1)
  expect(StyleSheet.flatten(light.getByText('profile.defaultUser').props.style).color).toBe(lightTheme.text)

  light.rerender(
    <ProfileIdentity firstName="Dark" lastName="User" email="dark@example.test" avatarImage={2} isSmallScreen={false} theme={darkTheme} />,
  )
  expect(light.getByText('Dark User')).toBeTruthy()
  expect(StyleSheet.flatten(light.getByText('Dark User').props.style).color).toBe(darkTheme.text)
});

test('shows all personal fields and the original missing-value message', () => {
  const view = render(
    <ProfileInformation firstName="Test" lastName="User" email="person@example.test" phoneNumber="" theme={lightTheme} />,
  )
  expect(view.getByText('profile.personalInfo')).toBeTruthy()
  expect(view.getByText('Test')).toBeTruthy()
  expect(view.getByText('User')).toBeTruthy()
  expect(view.getByText('person@example.test')).toBeTruthy()
  expect(view.getByText('profile.notRegistered')).toBeTruthy()
});

test('exposes selected avatars and blocks a change while an update is active', () => {
  const view = render(
    <ProfileAvatarSelector avatars={avatars} selectedAvatar="avatar_2" changingAvatar={false} onChangeAvatar={mockOnChangeAvatar} theme={lightTheme} />,
  )
  const radios = view.getAllByRole('radio')
  expect(radios[1].props.accessibilityState).toEqual({ selected: true, disabled: false })
  fireEvent.press(radios[0])
  expect(mockOnChangeAvatar).toHaveBeenCalledWith('avatar_1')

  mockOnChangeAvatar.mockClear()
  view.rerender(
    <ProfileAvatarSelector avatars={avatars} selectedAvatar="avatar_2" changingAvatar onChangeAvatar={mockOnChangeAvatar} theme={darkTheme} />,
  )
  const disabled = view.getAllByRole('radio')[0]
  expect(disabled.props.accessibilityState.disabled).toBe(true)
  fireEvent.press(disabled)
  expect(mockOnChangeAvatar).not.toHaveBeenCalled()
});

test('delegates menu navigation and the theme switch without changing their labels', () => {
  const view = render(
    <ProfilePreferences theme={darkTheme} darkMode onToggleDarkMode={mockOnToggleDarkMode} onEditProfile={mockOnEditProfile} onOpenVehicles={mockOnOpenVehicles} />,
  )
  expect(view.getByText('profile.enabled')).toBeTruthy()
  fireEvent.press(view.getByRole('button', { name: 'profile.edit' }))
  fireEvent.press(view.getByRole('button', { name: 'profile.vehicles' }))
  fireEvent(view.getByLabelText('profile.darkMode'), 'valueChange', false)
  expect(mockOnEditProfile).toHaveBeenCalledTimes(1)
  expect(mockOnOpenVehicles).toHaveBeenCalledTimes(1)
  expect(mockOnToggleDarkMode).toHaveBeenCalledWith(false)
});
