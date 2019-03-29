import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError, mergeMap, flatMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { environment } from '../../environments/environment';
import { AccountApi, Account, LoopBackFilter, LoopBackConfig } from '../lb-sdk';
import { NgRedux } from '@angular-redux/store';
import { AccountActions } from './account.actions';
import { AuthService } from './auth.service';

export interface IAccessToken {
  'id'?: string;
  'ttl'?: number;
  'created'?: Date;
  'userId'?: string;
}

const API_URL = environment.API_URL;

@Injectable()
export class AccountService {
  private url = environment.API_URL + 'Accounts';
  private account;
  DEFAULT_PASSWORD = '123456';

  constructor(
    private ngRedux: NgRedux<Account>,
    private accountApi: AccountApi,
    private authSvc: AuthService,
    private http: HttpClient
  ) {

  }

  signup(account: Account): Observable<any> {
    return this.http.post(this.url + '/signup', account);
  }

  // login --- return {id: tokenId, ttl: 10000, userId: r.id}
  login(username: string, password: string, rememberMe: boolean = true): Observable<any> {
    const credentials = {
      username: username,
      password: password
    };
    return this.http.post(this.url + '/login', credentials);
  }

  logout(): Observable<any> {
    const state = this.ngRedux.getState();
    if (state && state.id) {
      this.ngRedux.dispatch({ type: AccountActions.UPDATE, payload: new Account() });
    }
    return this.accountApi.logout();
  }

  // ------------------------------------
  // getCurrentUser
  // return Account object or null
  getCurrentUser(): Observable<any> {
    const id: any = this.authSvc.getUserId();
    const url = id ? (this.url + '/' + id) : (this.url + '/__anonymous__');
    return this.http.get(url);
  }

  getCurrent(forceGet: boolean = false): Observable<Account> {
    const self = this;
    const state: any = this.ngRedux.getState();
    if (!state || !state.account.id || forceGet) {
      return this.getCurrentUser().pipe(
        flatMap((acc: Account) => {
          self.ngRedux.dispatch({ type: AccountActions.UPDATE, payload: acc });
          return new Observable(observer => observer.next(acc));
        })
      );
    } else {
      return this.ngRedux.select<Account>('account');
    }
  }

  find(filter?: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.authSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', LoopBackConfig.getAuthPrefix() + accessTokenId);
      // httpParams = httpParams.append('access_token', LoopBackConfig.getAuthPrefix() + accessTokenId);
    }
    if (filter) {
      headers = headers.append('filter', JSON.stringify(filter));
    }
    return this.http.get(this.url, {headers: headers});
  }

  findById(id: number, filter?: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.authSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', LoopBackConfig.getAuthPrefix() + accessTokenId);
      // httpParams = httpParams.append('access_token', LoopBackConfig.getAuthPrefix() + accessTokenId);
    }
    if (filter) {
      headers = headers.append('filter', JSON.stringify(filter));
    }
    const url = id ? (this.url + '/' + id) : (this.url + '/__anonymous__');
    return this.http.get(url, {headers: headers});
  }

  create(account: Account): Observable<any> {
    return this.http.post(this.url, account);
  }

  replaceById(id: number, account: Account) {
    return this.http.put(this.url, account);
  }

  rmAccount(id): Observable<any> {
    return this.http.get(this.url);
  }

  // getUserList(query?: string): Observable<User[]> {
  //     const url = API_URL + 'users' + (query ? query : '');
  //     const headers = new HttpHeaders().set('Content-Type', 'application/json');
  //     return this.http.get(url, { 'headers': headers }).pipe(map((res: any) => {
  //         let a: User[] = [];
  //         if (res.data && res.data.length > 0) {
  //             for (let i = 0; i < res.data.length; i++) {
  //                 a.push(new User(res.data[i]));
  //             }
  //         }
  //         return a;
  //     }),
  //         catchError((err) => {
  //             return observableThrowError(err.message || err);
  //         }), );
  // }

  // getUser(id: number): Observable<User> {
  //     const url = this.API_URL + 'users/' + id;
  //     const headers = new HttpHeaders().set('Content-Type', 'application/json');
  //     return this.http.get(url, { 'headers': headers }).pipe(map((res: any) => {
  //         return new User(res.data);
  //     }),
  //         catchError((err) => {
  //             return observableThrowError(err.message || err);
  //         }), );
  // }

  // saveUser(d: User): Observable<User> {
  //     const url = this.API_URL + 'users';
  //     const headers = new HttpHeaders().set('Content-Type', 'application/json');
  //     const data = {
  //         'id': d.id,
  //         'username': d.username,
  //         'email': d.email,
  //         'password': d.password,
  //         'first_name': d.first_name,
  //         'last_name': d.last_name,
  //         'portrait': d.portrait,
  //         'type': d.type,
  //     };
  // }

  // getUserList(query?: string): Observable<User[]> {
  //     const url = API_URL + 'users' + (query ? query : '');
  //     const headers = new HttpHeaders().set('Content-Type', 'application/json');
  //     return this.http.get(url, { 'headers': headers }).pipe(map((res: any) => {
  //         let a: User[] = [];
  //         if (res.data && res.data.length > 0) {
  //             for (let i = 0; i < res.data.length; i++) {
  //                 a.push(new User(res.data[i]));
  //             }
  //         }
  //         return a;
  //     }),
  //     catchError((err) => {
  //         return observableThrowError(err.message || err);
  //     }), );
  // }

  // getUser(id: number): Observable<User> {
  //     const url = this.API_URL + 'users/' + id;
  //     const headers = new HttpHeaders().set('Content-Type', 'application/json');
  //     return this.http.get(url, { 'headers': headers }).pipe(map((res: any) => {
  //         return new User(res.data);
  //     }),
  //     catchError((err) => {
  //         return observableThrowError(err.message || err);
  //     }), );
  // }

  // saveUser(d: User): Observable<User> {
  //     const url = this.API_URL + 'user';
  //     const headers = new HttpHeaders().set('Content-Type', 'application/json');
  //     const data = {
  //         'username': d.username,
  //         'first_name': d.first_name,
  //         'last_name': d.last_name,
  //         'portrait': d.portrait,
  //         'type': d.type,
  //     };

  //     return this.http.post(url, data, { 'headers': headers }).pipe(map((res: any) => {
  //         return new User(res.data);
  //     }),
  //     catchError((err) => {
  //         return observableThrowError(err.message || err);
  //     }), );
  // }

  


}

