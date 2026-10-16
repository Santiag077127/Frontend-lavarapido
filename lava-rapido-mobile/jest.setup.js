globalThis.IS_REACT_ACT_ENVIRONMENT = true;
process.env.EXPO_PUBLIC_API_URL ??= 'https://api.example.test';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Expo installs fetch lazily. Resolve it before Jest tears down the test environment.
void globalThis.fetch;
