import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { environment } from '../../environments/environment';
import { AccountApi, Account, LoopBackFilter } from '../shared/lb-sdk';
import { NgRedux } from '@angular-redux/store';
import { AccountActions } from './account.actions';
import { identifierModuleUrl } from '../../../node_modules/@angular/compiler';

const API_URL = environment.API_URL;

@Injectable()
export class AccountService {
  private API_URL = environment.API_URL;
  private account;
  DEFAULT_PASSWORD = '123456';

  constructor(private ngRedux: NgRedux<Account>, private accountApi: AccountApi) { }

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

  signup(account: Account): Observable<any> {
    return this.accountApi.create(account)
      .pipe(
        mergeMap(() => {
          return this.login(account.username, account.password);
        })
      );
  }

  login(username: string, password: string, rememberMe: boolean = true): Observable<any> {
    const credentials = {
      username: username,
      password: password
    };
    return this.accountApi.login(credentials, null, rememberMe)
      .pipe(
        mergeMap(() => {
          return this.accountApi.getCurrent({ include: 'restaurants' });
        }),
        map((acc: Account) => {
          this.ngRedux.dispatch({ type: AccountActions.UPDATE, payload: acc });
          return acc;
        })
      );
  }

  logout(): Observable<any> {
    const state = this.ngRedux.getState();
    if (state && state.id) {
      this.ngRedux.dispatch({ type: AccountActions.UPDATE, payload: new Account() });
    }
    return this.accountApi.logout();
  }

  getCurrent(forceGet: boolean = false): Observable<Account> {
    const state = this.ngRedux.getState();
    if (!state || !state.email || forceGet) {
      this.updateCurrent();
    }
    return this.ngRedux.select<Account>('account');
  }

  updateCurrent() {
    this.accountApi.getCurrent({ include: 'restaurants' })
      .subscribe((acc: Account) => {
        this.ngRedux.dispatch({ type: AccountActions.UPDATE, payload: acc });
      });
  }

  isAuthenticated(): boolean {
    return this.accountApi.isAuthenticated();
  }

  find(filter: LoopBackFilter = {}): Observable<Account[]> {
    return this.accountApi.find(filter);
  }

  findById(id: number, filter: LoopBackFilter = {}): Observable<Account> {
    return this.accountApi.findById(id, filter);
  }

  create(account: Account): Observable<any> {
    return this.accountApi.create(account);
  }

  replaceOrCreate(account: Account): Observable<any> {
    return this.accountApi.replaceOrCreate(account);
  }

  replaceById(id: number, account: Account) {
    return this.accountApi.replaceById(id, account);
  }

  rmAccount(id): Observable<any> {
    return this.accountApi.deleteById(id);
  }
}

