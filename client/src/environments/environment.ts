// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  API_VERSION: 'api',
  SECURE: window.location.protocol === 'https:',
  API_BASE: window.location.protocol + '//' + window.location.hostname + ':8000',
  API_URL: 'http://localhost:8000/api/',
  APP_URL: window.location.origin,
  MEDIA_URL: 'http://localhost:8000/',
  APP: 'duocun',
  AUTH_PREFIX: '',
  GOOGLE_MAP: {
    KEY: ''
  },
  GOOGLE_LOGIN: {
    CLIENT_ID: '489357362854-cktl4l0mnbj70b4rrcu771on38865d2v.apps.googleusercontent.com'
  },
  GOOGLE_ANALYTICS: {
    CLIENT_ID: 'UA-113187324-2'
  },
  STRIPE: {
    API_KEY: 'pk_test_IQkfGbooEHrkJ90xj3fMjxwM'
  },
  WECHAT: {
    APP_ID: 'wx0591bdd165898739',
    REDIRECT_URL: 'https://duocun.com.cn'
  },
  DEFAULT_ADMIN: {
    ID: '5d3a34afac8ce150f3bb70c2',
    NAME: 'duocun'
  }
};
