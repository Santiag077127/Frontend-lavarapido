import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { RefreshControl } from 'react-native';

import ProfileScreen from './ProfileScreen';

const mockGet = jest.fn();
const mockPut = jest.fn();
const mockSetToken = jest.fn();
const mockClassifyApiError = jest.fn();
const mockAlert = jest.fn();
const mockNavigate = jest.fn();
const mockSetDarkMode = jest.fn();
const mockSetIsLoggedIn = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('../../../components/profile/LanguageSelector', () => () => null);
jest.mock('../../../components/notifications/NotificationProvider', () => ({
  appAlert: { alert: (...args: unknown[]) => mockAlert(...args) },
}));
jest.mock('../../../components/notifications/ConfirmationModal', () => ({
  __esModule: true,
  default: ({ visible, confirmLabel, cancelLabel, onConfirm, onCancel }: {
    visible: boolean;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => {
    if (!visible) return null;
    const ReactModule = require('react');
    const { Pressable, Text, View } = require('react-native');
    return ReactModule.createElement(View, null,
      ReactModule.createElement(Pressable, { accessibilityRole: 'button', onPress: onConfirm },
        ReactModule.createElement(Text, null, confirmLabel)),
      ReactModule.createElement(Pressable, { accessibilityRole: 'button', onPress: onCancel },
        ReactModule.createElement(Text, null, cancelLabel)),
    );
  },
}));
jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    put: (...args: unknown[]) => mockPut(...args),
  },
  setToken: (...args: unknown[]) => mockSetToken(...args),
  classifyApiError: (...args: unknown[]) => mockClassifyApiError(...args),
}));
jest.mock('../../../assets/images', () => ({
  images: { avatar1: 1, avatar2: 2, avatar3: 3, avatar4: 4, avatar5: 5 },
}));
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: new Proxy({}, { get: () => '#fff' }),
    darkMode: false,
    setDarkMode: (...args: unknown[]) => mockSetDarkMode(...args),
  }),
}));

const profile = {
  userId: 'user-1',
  email: 'person@example.test',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '3000000000',
  profilePicture: 'avatar_2',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue({ data: profile });
  mockPut.mockResolvedValue({ data: { ...profile, profilePicture: 'avatar_3' } });
  mockClassifyApiError.mockReturnValue('server_unavailable');
});

test('loads the profile once and shows the user identity and personal data', async () => {
  const view = render(<ProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />);
  await waitFor(() => expect(view.getByText('Test User')).toBeTruthy());

  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockGet).toHaveBeenCalledWith('/api/users/profile');
  expect(view.getAllByText('person@example.test')).toHaveLength(2);
  expect(view.getByText('3000000000')).toBeTruthy();
  expect(view.getByLabelText('editProfile.profilePhoto').props.source).toBe(2);
  expect(view.getAllByRole('radio')).toHaveLength(5);
  expect(view.getAllByRole('radio')[1].props.accessibilityState.selected).toBe(true);
});

test('preserves edit and vehicle navigation and theme control', async () => {
  const view = render(<ProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />);
  await waitFor(() => expect(view.getByText('Test User')).toBeTruthy());

  fireEvent.press(view.getByRole('button', { name: 'profile.edit' }));
  fireEvent.press(view.getByRole('button', { name: 'profile.vehicles' }));
  fireEvent(view.getByLabelText('profile.darkMode'), 'valueChange', true);

  expect(mockNavigate.mock.calls).toEqual([['EditProfile'], ['MyVehicles']]);
  expect(mockSetDarkMode).toHaveBeenCalledWith(true);
});

test('updates the avatar with the existing profile contract', async () => {
  const view = render(<ProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />);
  await waitFor(() => expect(view.getByText('Test User')).toBeTruthy());

  fireEvent.press(view.getAllByRole('radio')[2]);
  await waitFor(() => expect(mockPut).toHaveBeenCalledWith('/api/users/profile', {
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '3000000000',
    profilePicture: 'avatar_3',
  }));
  await waitFor(() => expect(view.getAllByRole('radio')[2].props.accessibilityState.selected).toBe(true));
  expect(mockPut).toHaveBeenCalledTimes(1);
});

test('does not show terms in the profile while preserving the other profile options', async () => {
  const view = render(<ProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />);
  await waitFor(() => expect(view.getByText('Test User')).toBeTruthy());

  expect(view.queryByText(/Términos y condiciones/i)).toBeNull();
  expect(view.queryByText('legal.paymentInterruption.title')).toBeNull();
  expect(view.getByText('profile.vehicles')).toBeTruthy();
  expect(view.getByText('profile.darkMode')).toBeTruthy();
  expect(view.getByRole('button', { name: 'profile.logout' })).toBeTruthy();
});

test('requires confirmation before clearing the local session', async () => {
  const view = render(<ProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />);
  await waitFor(() => expect(view.getByText('Test User')).toBeTruthy());

  fireEvent.press(view.getByRole('button', { name: 'profile.logout' }));
  expect(mockSetToken).not.toHaveBeenCalled();
  fireEvent.press(view.getByRole('button', { name: 'profile.cancel' }));
  expect(mockSetToken).not.toHaveBeenCalled();

  fireEvent.press(view.getByRole('button', { name: 'profile.logout' }));
  fireEvent.press(view.getAllByRole('button', { name: 'profile.logout' })[1]);
  expect(mockSetToken).toHaveBeenCalledWith(null);
  expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
});

test('offers retry after a load failure without issuing duplicate requests', async () => {
  mockGet.mockRejectedValueOnce({ response: { status: 503 } });
  const view = render(<ProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />);
  await waitFor(() => expect(view.getByText('profile.emptyTitle')).toBeTruthy());
  expect(mockGet).toHaveBeenCalledTimes(1);

  fireEvent.press(view.getByRole('button', { name: 'profile.retry' }));
  await waitFor(() => expect(view.getByText('Test User')).toBeTruthy());
  expect(mockGet).toHaveBeenCalledTimes(2);
});

test('refreshes the profile on demand', async () => {
  const view = render(<ProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />);
  await waitFor(() => expect(view.getByText('Test User')).toBeTruthy());

  act(() => view.UNSAFE_getByType(RefreshControl).props.onRefresh());
  await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
});

test('keeps the loading state visible until the profile request resolves', async () => {
  let resolveProfile: (value: { data: typeof profile }) => void = () => {};
  mockGet.mockReturnValueOnce(new Promise((resolve) => {
    resolveProfile = resolve;
  }));
  const view = render(<ProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />);
  expect(view.getByText('profile.loading')).toBeTruthy();
  expect(mockGet).toHaveBeenCalledTimes(1);

  await act(async () => resolveProfile({ data: profile }));
  expect(view.getByText('Test User')).toBeTruthy();
});

test('preserves the session-expired confirmation before logging out', async () => {
  mockGet.mockRejectedValueOnce({ response: { status: 401 } });
  render(<ProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />);

  await waitFor(() => expect(mockAlert).toHaveBeenCalledWith(
    'profile.sessionExpired', 'profile.loginAgain', expect.any(Array), 'error',
  ));
  expect(mockSetToken).not.toHaveBeenCalled();
  const actions = mockAlert.mock.calls[0][2];
  act(() => actions[0].onPress());
  expect(mockSetToken).toHaveBeenCalledWith(null);
  expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
});

test('retains the selected avatar and shows an error if the update fails', async () => {
  mockPut.mockRejectedValueOnce({ response: { status: 503 } });
  const view = render(<ProfileScreen setIsLoggedIn={mockSetIsLoggedIn} />);
  await waitFor(() => expect(view.getByText('Test User')).toBeTruthy());

  fireEvent.press(view.getAllByRole('radio')[2]);
  await waitFor(() => expect(mockAlert).toHaveBeenCalledWith(
    'profile.errorTitle', 'apiErrors.server_unavailable', undefined, 'error',
  ));
  expect(view.getAllByRole('radio')[1].props.accessibilityState.selected).toBe(true);
  expect(mockPut).toHaveBeenCalledTimes(1);
});
