import { Injectable } from '@angular/core';
import * as Cookies from 'js-cookie';
import { ILocation } from '../location/location.model';

const COOKIE_EXPIRY_DAYS = 365;

@Injectable()
export class AuthService {

  constructor(
  ) {

  }

  setAccessTokenId(token: string) {
    if (token) {
      Cookies.set('duocun-token-id', token, { expires: COOKIE_EXPIRY_DAYS });
    }
  }

  getAccessTokenId(): string {
    const tokenId = Cookies.get('duocun-token-id');
    return tokenId ? tokenId : null;
  }


  // setLocation(loc: ILocation) {
  //   Cookies.remove('duocun-location');
  //   Cookies.set('duocun-location', JSON.stringify(loc));
  // }

  // getLocation(): ILocation {
  //   const s = Cookies.get('duocun-location');
  //   return s ? JSON.parse(s) : null;
  // }


  removeCookies() {
    Cookies.remove('duocun-token-id');
  }
}
