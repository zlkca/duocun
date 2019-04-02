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
    public authSvc: AuthService,
    public http: HttpClient
  ) {

  }

  getBaseUrl() {
    return environment.API_URL;
  }

  find(filter?: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.authSvc.getAccessToken();
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
    const accessTokenId = this.authSvc.getAccessToken();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
      // httpParams = httpParams.append('access_token', LoopBackConfig.getAuthPrefix() + accessTokenId);
    }
    if (filter) {
      headers = headers.append('filter', JSON.stringify(filter));
    }
    return this.http.get(this.url + '/' + id, {headers: headers});
  }

  save(entity: IEntity): Observable<any> {
    return this.http.post(this.url, entity);
  }

  replace(entity: IEntity): Observable<any> {
    return this.http.put(this.url, entity);
  }
}
