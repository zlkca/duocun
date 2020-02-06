import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntityService } from '../entity.service';
import { AuthService } from '../account/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends EntityService {
  url;
  constructor(
    public authSvc: AuthService,
    public http: HttpClient,
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Products';
  }


  categorize(filter: any, lang: string): Observable<any> {
    const url = this.url + '/categorize';
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const accessTokenId = this.cookieSvc.getAccessTokenId();
    if (accessTokenId) {
      headers = headers.append('Authorization', this.authPrefix + accessTokenId);
    }
    if (filter) {
      headers = headers.append('filter', JSON.stringify(filter));
    }
    headers = headers.append('lang', lang);
    return this.http.get(url, {headers: headers});
  }
}
