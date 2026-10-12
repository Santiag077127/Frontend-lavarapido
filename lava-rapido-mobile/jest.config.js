module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/src/features/notifications/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
