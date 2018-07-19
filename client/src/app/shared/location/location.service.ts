import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ILocation } from './location.model';
import { NgRedux } from '@angular-redux/store';
import { environment } from '../../../environments/environment';
import { LocationActions } from './location.actions';
import { HttpClient } from '@angular/common/http';

declare let google: any;
const APP = environment.APP;
const geocodeURL = 'http://maps.googleapis.com/maps/api/geocode/json';

@Injectable()
export class LocationService {
    private geocoder;
    constructor(private ngRedux: NgRedux<ILocation>, private http: HttpClient) {
        if (google) {
            this.geocoder = new google.maps.Geocoder();
        }
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

    getCurrentPosition(): Promise<any> {
        const pos = { lat: 43.761539, lng: -79.411079 }; // default
        if (navigator) {
            navigator.geolocation.getCurrentPosition(geo => {
                const lat = geo.coords.latitude;
                const lng = geo.coords.longitude;
                if (lat && lng) {
                    pos.lat = lat;
                    pos.lng = lng;
                }
            });
        }

        const promise = new Promise((resolve, reject) => {
            this.geocoder.geocode({ 'location': pos }, (results) => {
                const addr = results[0] && results[0].address_components;
                if (addr && addr.length) {
                    const loc = {
                        street_number: '',
                        street_name: '',
                        sub_locality: '',
                        city: '',
                        province: '',
                        postal_code: '',
                        lat: pos.lat,
                        lng: pos.lng
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
                        if (compo.types.indexOf('sublocality_level_1') !== -1 || compo.types.indexOf('sublocality') != -1) {
                            loc.sub_locality = compo.long_name;
                        }
                        if (compo.types.indexOf('locality') !== -1) {
                            loc.city = compo.long_name;
                        }
                        if (compo.types.indexOf('administrative_area_level_1') !== -1) {
                            loc.province = compo.long_name;
                        }
                    });

                    this.set(loc);

                }
                resolve();
            });
        });
        return promise;
    }

}

