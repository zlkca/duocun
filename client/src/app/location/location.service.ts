import { Injectable } from '@angular/core';
import { ILocation, ILatLng, ILocationHistory, IDistance } from './location.model';
import { Observable } from 'rxjs';
import { LoopBackConfig } from '../lb-sdk';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from '../../../node_modules/rxjs/operators';
import { resolve } from 'path';
import { LoopBackAuth } from '../lb-sdk/services/core/auth.service';


declare let google: any;

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private geocoder: any;
  private url = [
    LoopBackConfig.getPath(),
    LoopBackConfig.getApiVersion()
  ].join('/');

  constructor(
    private http: HttpClient,
    private auth: LoopBackAuth
  ) {
    try {
      if (google) {
        this.geocoder = new google.maps.Geocoder();
      }
    } catch (error) {
      this.geocoder = null;
    }
  }

  save(locationHistory: ILocationHistory): Observable<any> {
    const url = this.url + '/Locations';
    return this.http.post(url, locationHistory);
  }

  find(filter: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.auth.getAccessTokenId();
    if (accessTokenId) {
      headers = headers.append('Authorization', LoopBackConfig.getAuthPrefix() + accessTokenId);
      // httpParams = httpParams.append('access_token', LoopBackConfig.getAuthPrefix() + accessTokenId);
    }
    headers = headers.append('filter', JSON.stringify(filter));
    const url = this.url + `/Locations`;
    return this.http.get(url, {headers: headers});
  }

  reqPlaces(input: string): Observable<any> {
    const url = this.url + `/places?input=${input}`;
    return this.http.get(url);
  }

  getCurrentLocation(): Promise<ILocation> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.getCurrentPosition().then(pos => {
        self.reqLocationByLatLng(pos).then(x => {
          resolve(x);
        });
      });
    });
  }

  reqLocationByLatLng(pos): Promise<any> {
    const url = this.url + `/geocode?lat=${pos.lat}&lng=${pos.lng}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(x => {
        const ret = this.getLocationFromGeocode(x);
        resolve(ret);
      });
    });
  }

  reqLocationByAddress(address: string): Promise<any> {
    const url = this.url + `/geocode?address=${address}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(x => {
        const ret = this.getLocationFromGeocode(x);
        resolve(ret);
      });
    });
  }

  getCurrentPosition(): Promise<ILatLng> {
    const pos: ILatLng = { lat: 43.761539, lng: -79.411079 }; // default
    return new Promise((resolve, reject) => {
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
    });
  }

  getLocationFromGeocode(geocodeResult): ILocation {
    const addr = geocodeResult && geocodeResult.address_components;
    const oLocation = geocodeResult.geometry.location;
    if (addr && addr.length) {
      const loc: ILocation = {
        place_id: geocodeResult.place_id,
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

  getAddrString(location: ILocation) {
    const city = location.sub_locality ? location.sub_locality : location.city;
    return location.street_number + ' ' + location.street_name + ', ' + city + ', ' + location.province;
    // + ', ' + location.postal_code;
  }

  getAddrStringByPlace(place) {
    const terms = place.terms;

    if (terms && terms.length >= 4) {
      let s = terms[0].value + ' ' + terms[1].value;
      for (let i = 2; i < terms.length; i++) {
        s += ', ' + terms[i].value;
      }
      return s;
    } else {
      return '';
    }
  }

  getDistances(origin: ILatLng, destinations: ILatLng[]): Observable<any> { // IDistance[]
    const url = [
      LoopBackConfig.getPath(),
      LoopBackConfig.getApiVersion(),
      'distances'
    ].join('/');

    return this.http.post(url, {origins: [origin], destinations: destinations});
  }
}
