import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError, mergeMap, flatMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { environment } from '../../environments/environment';
import { AccountApi, Account, LoopBackFilter, LoopBackConfig } from '../lb-sdk';
import { NgRedux } from '@angular-redux/store';
import { AccountActions } from './account.actions';

export interface IAccessToken {
  'id'?: string;
  'ttl'?: number;
  'created'?: Date;
  'userId'?: string;
}

const API_URL = environment.API_URL;

@Injectable()
export class AccountService {
  private API_URL = environment.API_URL;
  private account;
  DEFAULT_PASSWORD = '123456';

  constructor(
    private ngRedux: NgRedux<Account>,
    private accountApi: AccountApi,
    private http: HttpClient
  ) { }

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
    // return this.accountApi.create(account)
    //   .pipe(
    //     mergeMap(() => {
    //       return this.login(account.username, account.password);
    //     })
    //   );
    return this.http.post(LoopBackConfig.getPath() + '/' + LoopBackConfig.getApiVersion() + '/Accounts/signup', account);
  }

  login(username: string, password: string, rememberMe: boolean = true): Observable<any> {
    const credentials = {
      username: username,
      password: password
    };
    const self = this;
    return this.accountApi.login(credentials, null, rememberMe)
      .pipe(
        mergeMap(() => {
          return self.accountApi.getCurrent({ include: 'restaurants' });
        }),
        map((acc: Account) => {
          self.ngRedux.dispatch({ type: AccountActions.UPDATE, payload: acc });
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
    const self = this;
    const state: any = this.ngRedux.getState();
    if (!state || !state.account.id || forceGet) {
      return this.accountApi.getCurrent({ include: 'restaurants' }).pipe(
        flatMap((acc: Account) => {
          self.ngRedux.dispatch({ type: AccountActions.UPDATE, payload: acc });
          return new Observable(observer => observer.next(acc));
        })
      );
    } else {
      return this.ngRedux.select<Account>('account');
    }
  }

  updateCurrent() {
    const self = this;
    this.accountApi.getCurrent({ include: 'restaurants' })
      .subscribe((acc: Account) => {
        self.ngRedux.dispatch({ type: AccountActions.UPDATE, payload: acc });
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

