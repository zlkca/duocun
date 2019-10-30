import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './account/auth.service';

export interface IEntity {
  id ?: string;
}

@Injectable()
export class EntityService {
  authPrefix = environment.AUTH_PREFIX;
  public url = environment.API_URL;

  constructor(
    public cookieSvc: AuthService,
    public http: HttpClient
  ) {
  }

  getBaseUrl() {
    return environment.API_URL;
  }

  // without database join
  quickFind(filter?: any, distinct?: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
      // httpParams = httpParams.append('access_token', LoopBackConfig.getAuthPrefix() + accessTokenId);
    }
    if (filter) {
      headers = headers.append('filter', JSON.stringify(filter));
    }
    if (distinct) {
      headers = headers.append('distinct', JSON.stringify(distinct));
    }
    return this.http.get(this.url + '/qFind', { headers: headers });
  }

  // with database join
  find(filter?: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
      // httpParams = httpParams.append('access_token', LoopBackConfig.getAuthPrefix() + accessTokenId);
    }
    if (filter) {
      headers = headers.append('filter', JSON.stringify(filter));
    }
    return this.http.get(this.url, {headers: headers});
  }

  findById(id: string, filter?: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
    }
    if (filter) {
      headers = headers.append('filter', JSON.stringify(filter));
    }
    return this.http.get(this.url + '/' + id, {headers: headers});
  }

  doGet(url: string, filter?: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
    }
    if (filter) {
      headers = headers.append('filter', JSON.stringify(filter));
    }
    return this.http.get(url, {headers: headers});
  }

  doPost(url: string, entity: any, filter?: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
    }

    if (filter) {
      headers = headers.append('filter', JSON.stringify(filter));
    }

    return this.http.post(url, entity, {headers: headers});
  }

  doPatch(url: string, data: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
    }
    return this.http.patch(url, data, {headers: headers});
  }

  save(entity: IEntity): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
    }
    return this.http.post(this.url, entity, {headers: headers});
  }

  replace(entity: IEntity): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
    }
    return this.http.put(this.url, entity, {headers: headers});
  }

  update(filter: any, data: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
    }
    return this.http.patch(this.url, {filter: filter, data: data}, {headers: headers});
  }

  remove(filter?: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
    }
    if (filter) {
      headers = headers.append('filter', JSON.stringify(filter));
    }
    return this.http.delete(this.url, {headers: headers});
  }

  removeById(id: string): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
      // httpParams = httpParams.append('access_token', LoopBackConfig.getAuthPrefix() + accessTokenId);
    }
    return this.http.delete(this.url + '/' + id, {headers: headers});
  }
}
