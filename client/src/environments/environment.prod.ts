export const environment = {
  production: true,
  API_VERSION: 'api',
  SECURE: window.location.protocol === 'https:',
  API_BASE: window.location.protocol + '//' + window.location.hostname, // deprecated
  API_URL: 'https://duocun.com.cn/api/', // window.location.origin + '/api/',

  APP_URL: window.location.origin,
  MEDIA_URL: 'https://duocun.com.cn/media/', // window.location.origin + '/media/',
  GROCERY_APP_URL: 'http://duocun.com.cn/grocery',
  APP: 'duocun',
  AUTH_PREFIX: '',
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
    API_KEY: 'pk_live_vV7H1l4X9k2r8uf6JDf9lGsb'
  },
  WECHAT: {
    APP_ID: 'wx0591bdd165898739',
    REDIRECT_URL: 'https://duocun.com.cn'
  },
  DEFAULT_ADMIN: {
    ID: '5d3a34afac8ce150f3bb70c2',
    NAME: 'duocun'
  },
  language: 'zh'
};
