import { Injectable } from '@angular/core';
import * as Cookies from 'js-cookie';

@Injectable()
export class AuthService {

  setAccessToken(token: string) {
    // localStorage.setItem('token', token);
    Cookies.set('token', token);
  }

  getAccessToken(): string {
    // return localStorage.getItem('token');
    return Cookies.get('token');
  }
}
