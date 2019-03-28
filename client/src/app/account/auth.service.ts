import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  setAccessToken(token: string) {
    localStorage.setItem('token', token);
  }

  getAccessToken(): string {
    return localStorage.getItem('token');
  }
}
