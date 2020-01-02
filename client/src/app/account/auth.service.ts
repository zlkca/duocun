import { Injectable } from '@angular/core';
import * as Cookies from 'js-cookie';
import { ILocation } from '../location/location.model';

const COOKIE_EXPIRY_DAYS = 365;

@Injectable()
export class AuthService {

  constructor(
  ) {

  }

  setAccessToken(token: string) {
    Cookies.set('duocun-token', token, { expires: COOKIE_EXPIRY_DAYS });
  }


  setAccessTokenId(token: string) {
    Cookies.set('duocun-token-id', token, { expires: COOKIE_EXPIRY_DAYS });
  }

  getAccessTokenId(): string {
    // return localStorage.getItem('token');
    return Cookies.get('duocun-token-id');
  }

  setUserId(id: string) {
    Cookies.remove('duocun-userId');
    Cookies.set('duocun-userId', id, { expires: COOKIE_EXPIRY_DAYS });
  }

  getUserId(): string {
    return Cookies.get('duocun-userId');
  }


  // setLocation(loc: ILocation) {
  //   Cookies.remove('duocun-location');
  //   Cookies.set('duocun-location', JSON.stringify(loc));
  // }

  // getLocation(): ILocation {
  //   const s = Cookies.get('duocun-location');
  //   return s ? JSON.parse(s) : null;
  // }

  // removeLocation() {
  //   Cookies.remove('duocun-location');
  // }

  removeCookies() {
    // Cookies.remove('duocun-location');
    Cookies.remove('duocun-userId');
    Cookies.remove('duocun-token');
  }
}
