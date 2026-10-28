import assert from 'node:assert/strict';
import test from 'node:test';

test('changeEmail sends the authenticated change-email contract and returns the updated profile', async () => {
  process.env.EXPO_PUBLIC_API_URL ??= 'https://api.example.test';
  Object.assign(globalThis, { __DEV__: true });

  const { default: api } = await import('./api.ts');
  const { userService } = await import('./userService.ts');
  const profile = {
    userId: 'user-1',
    email: 'new@example.com',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '3000000000',
    profilePicture: null,
  };
  const originalAdapter = api.defaults.adapter;
  let requestUrl: string | undefined;
  let requestBody: unknown;

  api.defaults.adapter = async (config) => {
    requestUrl = config.url;
    requestBody = typeof config.data === 'string'
      ? JSON.parse(config.data)
      : config.data;
    return {
      data: profile,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };

  try {
    const updatedProfile = await userService.changeEmail({
      currentPassword: 'current-password',
      newEmail: 'new@example.com',
    });

    assert.equal(requestUrl, '/api/users/email');
    assert.deepEqual(requestBody, {
      currentPassword: 'current-password',
      newEmail: 'new@example.com',
    });
    assert.deepEqual(updatedProfile, profile);
  } finally {
    api.defaults.adapter = originalAdapter;
  }
});
