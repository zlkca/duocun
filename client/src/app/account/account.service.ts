import { throwError as observableThrowError, Observable ,  empty, of } from 'rxjs';
import { map, catchError, mergeMap, flatMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { environment } from '../../environments/environment';
import { Account } from './account.model';

import { NgRedux } from '@angular-redux/store';
import { AccountActions } from './account.actions';
import { AuthService } from './auth.service';
import { EntityService } from '../entity.service';

export interface IAccessToken {
  'id'?: string;
  'ttl'?: number;
  'created'?: Date;
  'userId'?: string;
}

const API_URL = environment.API_URL;

@Injectable()
export class AccountService extends EntityService {
  url;
  DEFAULT_PASSWORD = '123456';

  constructor(
    private ngRedux: NgRedux<Account>,
    public authSvc: AuthService,
    public http: HttpClient
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Accounts';
  }

  signup(account: Account): Observable<any> {
    return this.http.post(this.url + '/signup', account);
  }

  // login --- return {id: tokenId, ttl: 10000, userId: r._id}
  login(username: string, password: string, rememberMe: boolean = true): Observable<any> {
    const credentials = {
      username: username,
      password: password
    };
    return this.http.post(this.url + '/login', credentials);
  }

  logout(): Observable<any> {
    const state = this.ngRedux.getState();
    if (state && state._id) {
      this.ngRedux.dispatch({ type: AccountActions.UPDATE, payload: new Account() });
    }
    return this.http.post(this.url + '/logout', {});
  }

  // ------------------------------------
  // getCurrentUser
  // return Account object or null
  getCurrentUser(): Observable<any> {
    const id: any = this.authSvc.getUserId();
    // const url = id ? (this.url + '/' + id) : (this.url + '/__anonymous__');
    if (id) {
      return this.findById(id);
    } else {
      return of(null);
    }
  }

  getCurrent(forceGet: boolean = false): Observable<Account> {
    const self = this;
    const state: any = this.ngRedux.getState();
    if (!state || !state.account || !state.account._id || forceGet) {
      return this.getCurrentUser();
    } else {
      return this.ngRedux.select<Account>('account');
    }
  }

  wechatLogin(authCode: string) {
    const url = this.url + '/wechatLogin?code=' + authCode;
    return this.http.get(url);
  }

}

