import { Injectable } from '@angular/core';
import * as Cookies from 'js-cookie';
import { ILocation } from '../location/location.model';

@Injectable()
export class AuthService {

  constructor(
  ) {

  }

  setAccessToken(token: string) {
    // localStorage.setItem('token', token);
    Cookies.remove('duocun-token');
    Cookies.set('duocun-token', token);
  }

  getAccessToken(): string {
    // return localStorage.getItem('token');
    return Cookies.get('duocun-token');
  }

  setUserId(id: string) {
    Cookies.remove('duocun-userId');
    Cookies.set('duocun-userId', id);
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
