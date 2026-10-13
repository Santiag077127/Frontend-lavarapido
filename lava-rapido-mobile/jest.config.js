module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/src/features/notifications/**/*.test.tsx', '**/src/features/reservations/screens/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
