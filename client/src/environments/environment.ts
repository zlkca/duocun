// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
   production: false,
   API_URL: "http://localhost:8000/api/",
   APP_URL: window.location.origin,//"http://localhost:5001",
   MEDIA_URL: "http://localhost:8000/media/",
   APP: "etuan",
   GOOGLE_MAP:{
  	KEY:'AIzaSyA-gMQDHCiCYKG-QQlmX7_dBC7kj-sP-uQ'
   },
  GOOGLE_LOGIN:{
  	CLIENT_ID:'489357362854-cktl4l0mnbj70b4rrcu771on38865d2v.apps.googleusercontent.com'
  },
  GOOGLE_ANALYTICS:{
    CLIENT_ID:'UA-113187324-2'
  },
  STRIPE:{
    CLIENT_KEY:'pk_test_RzVW9LLaIZANExpYhNg2x4Zu'
  }
};
