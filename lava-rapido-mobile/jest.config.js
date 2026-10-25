module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/App.test.tsx', '**/src/navigation/**/*.test.tsx', '**/src/services/api.session.test.tsx', '**/src/services/authSession.test.tsx', '**/src/features/auth/**/*.test.tsx', '**/src/features/notifications/**/*.test.tsx', '**/src/features/reservations/**/*.test.ts', '**/src/features/reservations/**/*.test.tsx', '**/src/features/map/**/*.test.tsx', '**/src/features/profile/**/*.test.tsx', '**/src/features/operator/**/*.test.tsx', '**/src/features/vehicles/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/features/map/**/*.{ts,tsx}', '!src/features/map/data/leafletResources.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/leafletResources\\.ts$'],
  coverageProvider: 'v8',
  coverageDirectory: 'coverage/map',
};
