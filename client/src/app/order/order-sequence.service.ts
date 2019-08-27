import { Injectable } from '@angular/core';
import { EntityService } from '../entity.service';
import { AuthService } from '../account/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from '../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderSequenceService extends EntityService {
  url;

  constructor(
    public authSvc: AuthService,
    public http: HttpClient
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'OrderSequences';
  }

  generate(filter?: any): Observable<any> {
    return this.find(filter);
  }
}
