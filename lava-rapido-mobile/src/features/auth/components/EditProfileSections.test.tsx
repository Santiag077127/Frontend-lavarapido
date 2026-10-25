import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import { darkTheme, lightTheme } from '../../../theme/themeTokens'
import ProfileAvatarPicker from './ProfileAvatarPicker'
import PersonalInformationForm from './PersonalInformationForm'
import EmailChangeForm from './EmailChangeForm'
import ProfileSecuritySection from './ProfileSecuritySection'
import ProfileFormInput from './ProfileFormInput'
import type { AvatarOption } from './editProfileTypes'

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))

const avatars: AvatarOption[] = [
  { key: 'avatar_1', image: 1 },
  { key: 'avatar_2', image: 2 },
]
const onSelectAvatar = jest.fn()
const onFirstNameChange = jest.fn()
const onLastNameChange = jest.fn()
const onPhoneChange = jest.fn()
const onCancel = jest.fn()
const onSave = jest.fn()
const onEmailChange = jest.fn()
const onEmailBlur = jest.fn()
const onPasswordChange = jest.fn()
const onSubmit = jest.fn()
const onChangePassword = jest.fn()

beforeEach(() => jest.clearAllMocks())

test('renders avatar selection and blocks interaction during a save', () => {
  const view = render(
    <ProfileAvatarPicker avatars={avatars} selectedAvatar="avatar_1" getAvatarImage={key => key === 'avatar_1' ? 1 : 2} onSelectAvatar={onSelectAvatar} saving={false} savingEmail={false} theme={lightTheme} />,
  )
  expect(view.getByText('editProfile.profilePhoto')).toBeTruthy()
  expect(view.getAllByRole('radio')[0].props.accessibilityState.selected).toBe(true)
  fireEvent.press(view.getAllByRole('radio')[1])
  expect(onSelectAvatar).toHaveBeenCalledWith('avatar_2')

  onSelectAvatar.mockClear()
  view.rerender(
    <ProfileAvatarPicker avatars={avatars} selectedAvatar="avatar_1" getAvatarImage={() => 1} onSelectAvatar={onSelectAvatar} saving savingEmail={false} theme={darkTheme} />,
  )
  fireEvent.press(view.getAllByRole('radio')[1])
  expect(onSelectAvatar).not.toHaveBeenCalled()
  expect(StyleSheet.flatten(view.getByText('editProfile.profilePhoto').props.style).color).toBe(darkTheme.text)
})

test('preserves personal field order and delegates save and cancel', () => {
  const view = render(
    <PersonalInformationForm firstName="Test" lastName="User" phoneNumber="3000000000" onFirstNameChange={onFirstNameChange} onLastNameChange={onLastNameChange} onPhoneChange={onPhoneChange} onCancel={onCancel} onSave={onSave} saving={false} savingEmail={false} theme={lightTheme} darkMode={false} />,
  )
  const tree = JSON.stringify(view.toJSON())
  expect(tree.indexOf('editProfile.phone')).toBeLessThan(tree.indexOf('editProfile.save'))
  fireEvent.changeText(view.getByLabelText('editProfile.firstName'), 'Changed')
  fireEvent.press(view.getByRole('button', { name: 'editProfile.save' }))
  fireEvent.press(view.getByRole('button', { name: 'editProfile.cancel' }))
  expect(onFirstNameChange).toHaveBeenCalledWith('Changed')
  expect(onSave).toHaveBeenCalledTimes(1)
  expect(onCancel).toHaveBeenCalledTimes(1)

  view.rerender(
    <PersonalInformationForm firstName="Test" lastName="User" phoneNumber="3000000000" onFirstNameChange={onFirstNameChange} onLastNameChange={onLastNameChange} onPhoneChange={onPhoneChange} onCancel={onCancel} onSave={onSave} saving savingEmail={false} theme={darkTheme} darkMode />,
  )
  expect(view.getByRole('button', { name: 'editProfile.save, accessibility.inProgress' }).props.accessibilityState).toEqual({ disabled: true, busy: true })
  expect(StyleSheet.flatten(view.getByText('editProfile.personalInfo').props.style).color).toBe(darkTheme.text)
});

test('keeps current email, validation warning, password input and busy submit state', () => {
  const props = {
    currentEmail: 'old@example.test', newEmail: 'invalid', currentPassword: 'password',
    emailTouched: true, onEmailChange, onEmailBlur, onPasswordChange, onSubmit,
    saving: false, savingEmail: false, theme: lightTheme, darkMode: false,
  }
  const view = render(<EmailChangeForm {...props} />)
  expect(view.getByText('emailChange.currentEmail')).toBeTruthy()
  expect(view.getByRole('alert').props.children).toBe('emailChange.invalidEmail')
  expect(view.getByLabelText('emailChange.currentPassword').props.secureTextEntry).toBe(true)
  fireEvent.press(view.getByRole('button', { name: 'emailChange.submit' }))
  expect(onSubmit).toHaveBeenCalledTimes(1)

  onSubmit.mockClear()
  view.rerender(<EmailChangeForm {...props} savingEmail theme={darkTheme} darkMode />)
  const submit = view.getByRole('button', { name: 'emailChange.submit' })
  expect(submit.props.accessibilityState).toEqual({ disabled: true, busy: true })
  fireEvent.press(submit)
  expect(onSubmit).not.toHaveBeenCalled()
})

test('preserves password visibility accessibility and change-password navigation', () => {
  const view = render(
    <ProfileFormInput label="Password" value="secret" onChangeText={() => {}} placeholder="Password" icon="lock-closed-outline" theme={lightTheme} darkMode={false} secureTextEntry />,
  )
  expect(view.getByLabelText('Password').props.secureTextEntry).toBe(true)
  fireEvent.press(view.getByRole('button', { name: 'accessibility.showPassword' }))
  expect(view.getByLabelText('Password').props.secureTextEntry).toBe(false)

  const security = render(<ProfileSecuritySection onChangePassword={onChangePassword} theme={darkTheme} />)
  fireEvent.press(security.getByRole('button', { name: 'changePassword.menuTitle' }))
  expect(onChangePassword).toHaveBeenCalledTimes(1)
  expect(security.getByRole('button', { name: 'changePassword.menuTitle' }).props.accessibilityHint).toBe('changePassword.menuDescription')
})
