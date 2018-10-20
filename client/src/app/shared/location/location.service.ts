
import { throwError as observableThrowError, Observable } from 'rxjs';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { catchError, map, mergeMap } from 'rxjs/operators';
import 'rxjs/add/observable/empty';

import { Injectable } from '@angular/core';
import { ILocation, ILatLng } from './location.model';
import { NgRedux } from '@angular-redux/store';
import { environment } from '../../../environments/environment';
import { LocationActions } from './location.actions';
import { HttpClient } from '@angular/common/http';
import { Http, Headers, Response, RequestOptions } from '@angular/http';

// import { GoogleMapsLoader } from '../map-api-loader.service';

declare let google: any;
const APP = environment.APP;
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GEOCODE_KEY = 'AIzaSyAjpSxjBTkdzKMcqAAmq72UY1-DTjl8b0s';

@Injectable()
export class LocationService {
  private geocoder;

  constructor(private ngRedux: NgRedux<ILocation>,
    private http: Http) {
    try {
      if (google) {
        this.geocoder = new google.maps.Geocoder();
      }
    } catch (error) {
      this.geocoder = null;
    }

    // GoogleMapsLoader.load().then((_mapsApi) => {
    //   // debugger;
    //   this.geocoder = new _mapsApi.Geocoder();
    //   this.google = google;
    //   // this.geocoderStatus = _mapsApi.GeocoderStatus;
    // });

  }

  get(): Observable<ILocation> {
    const state = this.ngRedux.getState();
    if (!state || !state.lat || !state.lng) {
      const s = localStorage.getItem('location-' + APP);
      if (s) {
        const location = JSON.parse(s);
        this.ngRedux.dispatch({ type: LocationActions.UPDATE, payload: location });
      } else {
        this.clear();
      }
    }

    return this.ngRedux.select<ILocation>('location');
  }

  set(location: ILocation) {
    localStorage.setItem('location-' + APP, JSON.stringify(location));
    this.ngRedux.dispatch({ type: LocationActions.UPDATE, payload: location });
  }

  clear() {
    localStorage.removeItem('location-' + APP);
    this.ngRedux.dispatch({ type: LocationActions.CLEAR });
  }

  getLocationFromGeocode(geocodeResult): ILocation {
    const addr = geocodeResult && geocodeResult.address_components;
    const oLocation = geocodeResult.geometry.location;
    if (addr && addr.length) {
      const loc: ILocation = {
        street_number: '',
        street_name: '',
        sub_locality: '',
        city: '',
        province: '',
        postal_code: '',
        lat: typeof oLocation.lat === 'function' ? oLocation.lat() : oLocation.lat,
        lng: typeof oLocation.lng === 'function' ? oLocation.lng() : oLocation.lng
      };

      addr.forEach(compo => {
        if (compo.types.indexOf('street_number') !== -1) {
          loc.street_number = compo.long_name;
        }
        if (compo.types.indexOf('route') !== -1) {
          loc.street_name = compo.long_name;
        }
        if (compo.types.indexOf('postal_code') !== -1) {
          loc.postal_code = compo.long_name;
        }
        if (compo.types.indexOf('sublocality_level_1') !== -1 && compo.types.indexOf('sublocality') !== -1) {
          loc.sub_locality = compo.long_name;
        }
        if (compo.types.indexOf('locality') !== -1) {
          loc.city = compo.long_name;
        }
        if (compo.types.indexOf('administrative_area_level_1') !== -1) {
          loc.province = compo.long_name;
        }
      });
      return loc;
    } else {
      return null;
    }
  }

  getCurrentLocation(): Observable<ILocation> {
    const self = this;
    return this.getCurrentPosition().pipe(mergeMap(pos => {
      return self.reqLocationByLatLng(pos);
    }));
    // const pos = { lat: 43.761539, lng: -79.411079 }; // default

    // return fromPromise(new Promise((resolve, reject) => {

    //   if (navigator && navigator.geolocation) {
    //     navigator.geolocation.getCurrentPosition(geo => {
    //       const lat = geo.coords.latitude;
    //       const lng = geo.coords.longitude;
    //       if (lat && lng) {
    //         pos.lat = lat;
    //         pos.lng = lng;
    //       }

    //       this.geocoder.geocode({ 'location': pos }, (results) => {
    //         const loc: ILocation = this.getLocationFromGeocode(results[0]);
    //         if (loc) {
    //           loc.lat = pos.lat;
    //           loc.lng = pos.lng;
    //           this.set(loc);
    //           resolve(loc);
    //         } else {
    //           reject(loc);
    //         }
    //       });
    //     }, err => { // if mobile browser doesn't support
    //       if (this.geocoder) {
    //         this.geocoder.geocode({ 'location': pos }, (results) => {
    //           const loc: ILocation = this.getLocationFromGeocode(results[0]);
    //           if (loc) {
    //             loc.lat = pos.lat;
    //             loc.lng = pos.lng;
    //             this.set(loc);
    //             resolve(loc);
    //           } else {
    //             reject(loc);
    //           }
    //         });
    //       } else { // no internet
    //         reject();
    //       }
    //     }
    //     );
    //   } else {
    //     reject();
    //   }
    // }));
  }

  getCurrentPosition(): Observable<ILatLng> {
    const pos: ILatLng = { lat: 43.761539, lng: -79.411079 }; // default
    return fromPromise(new Promise((resolve, reject) => {
      if (window.navigator && window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(geo => {
          const lat = geo.coords.latitude;
          const lng = geo.coords.longitude;
          if (lat && lng) {
            pos.lat = lat;
            pos.lng = lng;
          }
          resolve(pos);
        });
      } else {
        reject(pos);
      }
    }));
  }

  reqLocationByLatLngV1(pos): Observable<ILocation> {
    return fromPromise(new Promise((resolve, reject) => {
      this.geocoder.geocode({ 'location': pos }, (results) => {
        if (results && results.length > 0) {
          const loc: ILocation = this.getLocationFromGeocode(results[0]);
          resolve(loc);
        } else {
          reject();
        }
      }, err => {
        console.log(err);
        reject();
      });
    }));
  }

  // obsolete cross domain issue
  reqLocationByLatLng(pos): Observable<any> {
    const url = encodeURI(GEOCODE_URL + '?latlng=' + pos.lat + ',' + pos.lng + '&sensor=false&key=' + GEOCODE_KEY);
    const header: Headers = new Headers();
    const options = new RequestOptions({ headers: header, method: 'get'});
    return this.http.get(url, options).pipe(map((res: any) => {
      const geoCode = JSON.parse(res._body).results[0];
      return this.getLocationFromGeocode(geoCode);
    }));
    // return fromPromise(new Promise((resolve, reject) => {
    //   this.http.get(url).pipe(map((res: any) => {
    //     if (res.results && res.results.length > 0) {
    //       const loc: ILocation = this.getLocationFromGeocode(res.results[0]);
    //       resolve(loc);
    //     } else {
    //       reject();
    //     }
    //   }, err => {
    //     reject();
    //   }));
    // }));
  }

  // obsolete cross domain issue
  getLocation(sAddr: string): Observable<ILocation> {
    const url = encodeURI(GEOCODE_URL + '?address=' + sAddr.replace(/\s/g, '+') + '&sensor=false&key=' + GEOCODE_KEY);
    return this.http.get(url)
      .pipe(map((res: any) => {
        if (res.results && res.results.length > 0) {
          const loc = this.getLocationFromGeocode(res.results[0]);
          return loc;
        } else {
          return null;
        }
      }, err => {
        return null;
      }));
  }

  getAddrString(location: ILocation) {
    const city = location.sub_locality ? location.sub_locality : location.city;
    return location.street_number + ' ' + location.street_name + ', ' + city + ', ' + location.province;
    // + ', ' + location.postal_code;
  }
}

