import { Injectable } from '@angular/core';
import { ILocation, ILatLng, ILocationHistory, IPlace } from './location.model';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../account/auth.service';
import { EntityService } from '../entity.service';
import { mergeMap, map } from '../../../node_modules/rxjs/operators';

declare let google: any;

@Injectable({
  providedIn: 'root'
})
export class LocationService extends EntityService {

  private geocoder: any;

  constructor(
    public http: HttpClient,
    public authSvc: AuthService
  ) {
    super(authSvc, http);
    this.url = this.getBaseUrl() + 'Locations';

    try {
      if (google) {
        this.geocoder = new google.maps.Geocoder();
      }
    } catch (error) {
      this.geocoder = null;
    }
  }

  // find(filter: any): Observable<any> {
  //   let headers: HttpHeaders = new HttpHeaders();
  //   headers = headers.append('Content-Type', 'application/json');
  //   const accessTokenId = this.auth.getAccessTokenId();
  //   if (accessTokenId) {
  //     headers = headers.append('Authorization', LoopBackConfig.getAuthPrefix() + accessTokenId);
  //     // httpParams = httpParams.append('access_token', LoopBackConfig.getAuthPrefix() + accessTokenId);
  //   }
  //   headers = headers.append('filter', JSON.stringify(filter));
  //   const url = this.url + `Locations`;
  //   return this.http.get(url, {headers: headers});
  // }

  reqPlaces(input: string): Observable<any> {
    const url = encodeURI(this.url + '/Places/' + input);
    return this.doGet(url);
  }

  // getCurrentLocation(): Promise<ILocation> {
  //   const self = this;
  //   return new Promise((resolve, reject) => {
  //     self.getCurrentPosition().then(pos => {
  //       self.reqLocationByLatLng(pos).subscribe((x: ILocation) => {
  //         resolve(x);
  //       });
  //     });
  //   });
  // }

  // reqLocationByLatLng(pos): Observable<ILocation> {
  //   const url = super.getBaseUrl() + 'geocodeLocations?lat=' + pos.lat + '&lng=' + pos.lng;
  //   return this.http.get(url).pipe(
  //     map((xs: any[]) => {
  //       const geoLocations = xs.filter(r => r.types.indexOf('street_address') !== -1);
  //       return this.getLocationFromGeocode(geoLocations[0]);
  //     })
  //   );
  // }

  reqLocationByAddress(address: string): Observable<any> {
    const url = encodeURI(this.url + '/Geocodes/' + address); // super.getBaseUrl() + 'geocodeLocations?address=' + address;
    return this.doGet(url);
  }

  getCurrentPosition(): Promise<ILatLng> {
    const pos: ILatLng = { lat: 43.761539, lng: -79.411079 }; // default
    return new Promise((resolve, reject) => {
      if (window.navigator && window.navigator.geolocation) {
        const options = {
          // maximumAge: 5 * 60 * 1000,
          timeout: 10 * 1000
        };

        window.navigator.geolocation.getCurrentPosition(geo => {
          const lat = geo.coords.latitude;
          const lng = geo.coords.longitude;
          if (lat && lng) {
            pos.lat = lat;
            pos.lng = lng;
          }
          resolve(pos);
        }, err => {
          // error.code can be:
          //   0: unknown error
          //   1: permission denied
          //   2: position unavailable (error response from location provider)
          //   3: timed out
          console.log('browser geocode exception: ' + err.code);
          reject(pos);
        }, options);
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
        placeId: geocodeResult.place_id,
        streetNumber: '',
        streetName: '',
        subLocality: '',
        city: '',
        province: '',
        postalCode: '',
        lat: typeof oLocation.lat === 'function' ? oLocation.lat() : oLocation.lat,
        lng: typeof oLocation.lng === 'function' ? oLocation.lng() : oLocation.lng
      };

      addr.forEach(compo => {
        if (compo.types.indexOf('street_number') !== -1) {
          loc.streetNumber = compo.short_name;
        }
        if (compo.types.indexOf('route') !== -1) {
          loc.streetName = compo.short_name;
        }
        if (compo.types.indexOf('postal_code') !== -1) {
          loc.postalCode = compo.short_name;
        }
        if (compo.types.indexOf('sublocality_level_1') !== -1 && compo.types.indexOf('sublocality') !== -1) {
          loc.subLocality = compo.short_name;
        }
        if (compo.types.indexOf('locality') !== -1) {
          loc.city = compo.short_name;
        }
        if (compo.types.indexOf('administrative_area_level_1') !== -1) {
          loc.province = compo.short_name;
        }
      });
      return loc;
    } else {
      return null;
    }
  }

  toProvinceAbbr(input, to = 'abbr') {
    const provinces = [
      ['Alberta', 'AB'],
      ['British Columbia', 'BC'],
      ['Manitoba', 'MB'],
      ['New Brunswick', 'NB'],
      ['Newfoundland', 'NF'],
      ['Northwest Territory', 'NT'],
      ['Nova Scotia', 'NS'],
      ['Nunavut', 'NU'],
      ['Ontario', 'ON'],
      ['Prince Edward Island', 'PE'],
      ['Quebec', 'QC'],
      ['Saskatchewan', 'SK'],
      ['Yukon', 'YT'],
    ];

    const states = [
      ['Alabama', 'AL'],
      ['Alaska', 'AK'],
      ['American Samoa', 'AS'],
      ['Arizona', 'AZ'],
      ['Arkansas', 'AR'],
      ['Armed Forces Americas', 'AA'],
      ['Armed Forces Europe', 'AE'],
      ['Armed Forces Pacific', 'AP'],
      ['California', 'CA'],
      ['Colorado', 'CO'],
      ['Connecticut', 'CT'],
      ['Delaware', 'DE'],
      ['District Of Columbia', 'DC'],
      ['Florida', 'FL'],
      ['Georgia', 'GA'],
      ['Guam', 'GU'],
      ['Hawaii', 'HI'],
      ['Idaho', 'ID'],
      ['Illinois', 'IL'],
      ['Indiana', 'IN'],
      ['Iowa', 'IA'],
      ['Kansas', 'KS'],
      ['Kentucky', 'KY'],
      ['Louisiana', 'LA'],
      ['Maine', 'ME'],
      ['Marshall Islands', 'MH'],
      ['Maryland', 'MD'],
      ['Massachusetts', 'MA'],
      ['Michigan', 'MI'],
      ['Minnesota', 'MN'],
      ['Mississippi', 'MS'],
      ['Missouri', 'MO'],
      ['Montana', 'MT'],
      ['Nebraska', 'NE'],
      ['Nevada', 'NV'],
      ['New Hampshire', 'NH'],
      ['New Jersey', 'NJ'],
      ['New Mexico', 'NM'],
      ['New York', 'NY'],
      ['North Carolina', 'NC'],
      ['North Dakota', 'ND'],
      ['Northern Mariana Islands', 'NP'],
      ['Ohio', 'OH'],
      ['Oklahoma', 'OK'],
      ['Oregon', 'OR'],
      ['Pennsylvania', 'PA'],
      ['Puerto Rico', 'PR'],
      ['Rhode Island', 'RI'],
      ['South Carolina', 'SC'],
      ['South Dakota', 'SD'],
      ['Tennessee', 'TN'],
      ['Texas', 'TX'],
      ['US Virgin Islands', 'VI'],
      ['Utah', 'UT'],
      ['Vermont', 'VT'],
      ['Virginia', 'VA'],
      ['Washington', 'WA'],
      ['West Virginia', 'WV'],
      ['Wisconsin', 'WI'],
      ['Wyoming', 'WY'],
    ];
    const regions = states.concat(provinces);
    const camelcase = input.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    const uppercase = input.toUpperCase();
    if (to === 'abbr') {
      for (let i = 0; i < regions.length; i++) {
        if (regions[i][0] === camelcase) {
          return (regions[i][1]);
        } else if (regions[i][1] === uppercase) {
          return regions[i][1];
        }
      }
    } else if (to === 'name') {
      for (let i = 0; i < regions.length; i++) {
        if (regions[i][1] === uppercase) {
          return (regions[i][0]);
        } else if (regions[i][0] === camelcase) {
          return regions[i][0];
        }
      }
    }
  }

  getAddrString(location: ILocation) {
    if (location) {
      const city = location.subLocality ? location.subLocality : location.city;
      const province = this.toProvinceAbbr(location.province);
      const streetName = this.toStreetAbbr(location.streetName);
      return location.streetNumber + ' ' + streetName + ', ' + city + ', ' + province;
    } else {
      return '';
    }
  }

  toStreetAbbr(streetName: string) {
    return streetName.replace(' Street', ' St').replace(' Avenue', ' Ave');
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



  // ---------------------------------
  // return --- km
  // get surface distance between current location and restaurant
  getDirectDistance(center: ILatLng, location: ILatLng) {
    const lat1 = center.lat;
    const lng1 = center.lng;

    if (location) {
      const lat2 = location.lat;
      const lng2 = location.lng;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLng = (lng2 - lng1) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(lat1 * (Math.PI / 180)) * Math.cos((lat2) * (Math.PI / 180))
        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const d = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return Math.round(d / 10) / 100;
    } else {
      return 0;
    }
  }

  toPlaces(lhs: ILocationHistory[]) {
    const options: IPlace[] = [];
    if (!lhs || lhs.length === 0) {
      return options;
    } else {
      for (let i = lhs.length - 1; i >= 0; i--) {
        const lh = lhs[i];
        const loc = lh.location;
        const p: IPlace = {
          structured_formatting: {
            main_text: loc.streetNumber + ' ' + loc.streetName,
            secondary_text: (loc.subLocality ? loc.subLocality : loc.city) + ',' + loc.province
          },
          location: loc
        };
        options.push(p);
      }
      return options;
    }
  }
}
