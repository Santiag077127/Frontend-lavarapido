const appJson = require('./app.json');

module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  const plugins = [...(config.plugins ?? appJson.expo.plugins ?? [])];

  if (googleMapsApiKey) {
    plugins.push([
      'react-native-maps',
      { androidGoogleMapsApiKey: googleMapsApiKey },
    ]);
  }

  return {
    ...appJson.expo,
    ...config,
    plugins,
  };
};
