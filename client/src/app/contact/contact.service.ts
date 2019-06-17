import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../account/auth.service';
import { EntityService } from '../entity.service';
import { Contact, IContact } from './contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService extends EntityService {

  url;

  constructor(
    public http: HttpClient,
    public authSvc: AuthService
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Contacts';
  }

}
