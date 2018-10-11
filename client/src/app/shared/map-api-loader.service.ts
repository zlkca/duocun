import { environment } from '../../environments/environment';
const API_KEY = environment.GOOGLE_MAP.KEY;
const url = location.protocol + '//maps.googleapis.com/maps/api/js?callback=__onGoogleMapsLoaded&key=' + API_KEY + '&libraries=places';

export class GoogleMapsLoader {
  private static promise;
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

        // Add script tag to load google maps, which then triggers the callback, which resolves the promise with windows.google.maps.
        console.log('loading..');
        const node = document.createElement('script');
        node.src = url;
        node.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(node);
      });
    }

    // Always return promise. When 'load' is called many times, the promise is already resolved.
    return GoogleMapsLoader.promise;
  }
}
