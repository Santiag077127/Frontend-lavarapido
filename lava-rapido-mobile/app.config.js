const appJson = require('./app.json');

module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  const passwordResetUrl = process.env.EXPO_PUBLIC_PASSWORD_RESET_URL;
  const plugins = [...(config.plugins ?? appJson.expo.plugins ?? [])];
  const android = { ...(appJson.expo.android ?? {}), ...(config.android ?? {}) };

  if (googleMapsApiKey) {
    plugins.push([
      'react-native-maps',
      { androidGoogleMapsApiKey: googleMapsApiKey },
    ]);
  }

  if (passwordResetUrl) {
    try {
      const url = new URL(passwordResetUrl);
      if (url.protocol === 'https:' && url.pathname === '/reset-password') {
        android.intentFilters = [
          ...(android.intentFilters ?? []),
          {
            action: 'VIEW',
            autoVerify: true,
            data: [{ scheme: 'https', host: url.hostname, path: '/reset-password' }],
            category: ['BROWSABLE', 'DEFAULT'],
          },
        ];
      }
    } catch {
      // The app ignores an invalid optional link configuration.
    }
  }

  return {
    ...appJson.expo,
    ...config,
    plugins,
    android,
  };
};
