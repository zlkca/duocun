import { Injectable } from '@angular/core';
import { EntityService } from '../entity.service';
import { AuthService } from '../account/auth.service';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { Observable } from '../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhoneService extends EntityService {
  url;
  constructor(
    public authSvc: AuthService,
    public http: HttpClient
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Phones';
  }

  sendVerifyMessage(d: any): Observable<any> {
    const url = this.url + '/sendVerifyMsg';
    return this.doPost(url, d);
  }

  verifyCode(code: string, accountId: string): Observable<any> {
    const url = this.url + '/smsverify';
    return this.doPost(url, {code: code, accountId: accountId});
  }
}
