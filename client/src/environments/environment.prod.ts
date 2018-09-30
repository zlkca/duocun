export const environment = {
  production: true,
  API_BASE: 'http://' + window.location.hostname,
  API_URL: window.location.origin + '/api/',
  APP_URL: window.location.origin,
  MEDIA_URL: window.location.origin + '/media/',
  APP: 'etuan',
  GOOGLE_MAP: {
      KEY: 'AIzaSyBotSR2YeQMWKxPl4bN1wuwxNTvtWaT_xc'
  },
  GOOGLE_LOGIN: {
      CLIENT_ID: '489357362854-cktl4l0mnbj70b4rrcu771on38865d2v.apps.googleusercontent.com'
  },
  GOOGLE_ANALYTICS: {
      CLIENT_ID: 'UA-113187324-2'
  },
  STRIPE: {
      CLIENT_KEY: 'pk_test_RzVW9LLaIZANExpYhNg2x4Zu'
  }
};
