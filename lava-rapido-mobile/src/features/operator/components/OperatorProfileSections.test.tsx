import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import { darkTheme, lightTheme } from '../../../theme/themeTokens'
import OperatorIdentity from './OperatorIdentity'
import OperatorInformation from './OperatorInformation'
import OperatorAvatarSelector from './OperatorAvatarSelector'
import OperatorRoleInformation from './OperatorRoleInformation'
import OperatorAppearance from './OperatorAppearance'
import type { AvatarOption, UserProfile } from './operatorProfileTypes'

const mockOnChangeAvatar = jest.fn()
const mockSetDarkMode = jest.fn()

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
jest.mock('../../../components/profile/LanguageSelector', () => () => null)

const profile: UserProfile = {
  userId: 'operator-1',
  email: 'operator@example.test',
  firstName: 'Operator',
  lastName: 'User',
  phoneNumber: '3000000000',
  profilePicture: 'avatar_2',
}
const avatars: AvatarOption[] = [
  { key: 'avatar_1', image: 1 },
  { key: 'avatar_2', image: 2 },
]

beforeEach(() => jest.clearAllMocks())

test('renders operator identity, avatar and role styling in both themes', () => {
  const view = render(
    <OperatorIdentity profile={profile} currentAvatar={2} isSmallScreen theme={lightTheme} />,
  )
  expect(view.getByText('Operator User')).toBeTruthy()
  expect(view.getByLabelText('editProfile.profilePhoto').props.source).toBe(2)
  expect(view.getByText('OPERATOR.PROFILE.OPERATOR')).toBeTruthy()
  expect(StyleSheet.flatten(view.getByText('Operator User').props.style).color).toBe(lightTheme.text)

  view.rerender(
    <OperatorIdentity profile={{ ...profile, firstName: '', lastName: '', email: '' }} currentAvatar={1} isSmallScreen={false} theme={darkTheme} />,
  )
  expect(view.getByText('operator.profile.operator')).toBeTruthy()
  expect(view.getByText('operator.profile.noEmail')).toBeTruthy()
  expect(StyleSheet.flatten(view.getByText('operator.profile.noEmail').props.style).color).toBe(darkTheme.textSecondary)
})

test('shows personal fields and the original missing-value fallback', () => {
  const view = render(
    <OperatorInformation profile={{ ...profile, phoneNumber: '' }} theme={lightTheme} />,
  )
  expect(view.getByText('operator.profile.personalInfo')).toBeTruthy()
  expect(view.queryByText('3000000000')).toBeNull()
  expect(view.getByText('operator.profile.notRegistered')).toBeTruthy()
  expect(view.getByText('operator@example.test')).toBeTruthy()
})

test('keeps operator avatar selection and disables options while saving', () => {
  const view = render(
    <OperatorAvatarSelector avatars={avatars} selectedAvatar="avatar_2" savingAvatar={false} onChangeAvatar={mockOnChangeAvatar} theme={lightTheme} />,
  )
  const radios = view.getAllByRole('radio')
  expect(radios[1].props.accessibilityState).toEqual({ selected: true, disabled: false })
  fireEvent.press(radios[0])
  expect(mockOnChangeAvatar).toHaveBeenCalledWith('avatar_1')

  mockOnChangeAvatar.mockClear()
  view.rerender(
    <OperatorAvatarSelector avatars={avatars} selectedAvatar="avatar_2" savingAvatar onChangeAvatar={mockOnChangeAvatar} theme={darkTheme} />,
  )
  expect(view.getByText('operator.profile.savingAvatar')).toBeTruthy()
  expect(view.getAllByRole('radio')[0].props.accessibilityState.disabled).toBe(true)
  fireEvent.press(view.getAllByRole('radio')[0])
  expect(mockOnChangeAvatar).not.toHaveBeenCalled()
})

test('retains operator-only role and protected information', () => {
  const view = render(<OperatorRoleInformation theme={darkTheme} />)
  expect(view.getByText('operator.profile.accountInfo')).toBeTruthy()
  expect(view.getByText('operator.profile.role')).toBeTruthy()
  expect(view.getByText('vehicles.status.active')).toBeTruthy()
  expect(view.getByText('operator.profile.protectedTitle')).toBeTruthy()
  expect(view.getByText('operator.profile.protectedMessage')).toBeTruthy()
})

test('preserves operator appearance labels and delegates the theme switch', () => {
  const view = render(
    <OperatorAppearance theme={darkTheme} darkMode setDarkMode={mockSetDarkMode} />,
  )
  expect(view.getByText('operator.profile.appearance')).toBeTruthy()
  expect(view.getByText('operator.profile.enabled')).toBeTruthy()
  fireEvent(view.getByLabelText('operator.profile.darkMode'), 'valueChange', false)
  expect(mockSetDarkMode).toHaveBeenCalledWith(false)
})
