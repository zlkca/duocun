import { environment } from '../../environments/environment';
const API_KEY = environment.GOOGLE_MAP.KEY;
const url = window.location.protocol
  + '//maps.googleapis.com/maps/api/js?callback=__onGoogleMapsLoaded&key='
  + API_KEY + '&libraries=places';

export class GoogleMapsLoader {
  private static promise;
  private static ApiLoaded;
  public static loadJs() {

    if (!this.ApiLoaded) {
      // Add script tag to load google maps, which then triggers the callback, which resolves the promise with windows.google.maps.
      console.log('loading..');
      const node = document.createElement('script');
      node.src = url;
      node.type = 'text/javascript';
      document.getElementsByTagName('head')[0].appendChild(node);
      this.ApiLoaded = true;
    }
  }

  public static load() {

    // First time 'load' is called?
    if (!GoogleMapsLoader.promise) {

      // Make promise to load
      GoogleMapsLoader.promise = new Promise((resolve) => {

        // Set callback for when google maps is loaded.
        window['__onGoogleMapsLoaded'] = (ev) => {
          console.log('google maps api loaded');
          resolve(window['google']['maps']);
        };
      });
    }

    // Always return promise. When 'load' is called many times, the promise is already resolved.
    return GoogleMapsLoader.promise;
  }
}
