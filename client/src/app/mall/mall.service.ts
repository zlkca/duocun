import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoopBackConfig } from '../lb-sdk';
import { Observable } from 'rxjs';
import { Mall } from './mall.model';
import { AuthService } from '../account/auth.service';
import { environment } from '../../environments/environment';
import { EntityService } from '../entity.service';

@Injectable({
  providedIn: 'root'
})
export class MallService extends EntityService {

  constructor(
    public http: HttpClient,
    public authSvc: AuthService
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Malls';
  }

  save(mall: Mall): Observable<any> {
    return this.http.post(this.url, mall);
  }

  replace(mall: Mall): Observable<any> {
    return this.http.put(this.url, mall);
  }

  // find(filter?: any): Observable<any> {
  //   let headers: HttpHeaders = new HttpHeaders();
  //   headers = headers.append('Content-Type', 'application/json');
  //   const accessTokenId = this.auth.getAccessToken();
  //   if (accessTokenId) {
  //     headers = headers.append('Authorization', LoopBackConfig.getAuthPrefix() + accessTokenId);
  //     // httpParams = httpParams.append('access_token', LoopBackConfig.getAuthPrefix() + accessTokenId);
  //   }
  //   if (filter) {
  //     headers = headers.append('filter', JSON.stringify(filter));
  //   }
  //   return this.http.get(this.url, {headers: headers});
  // }
}

