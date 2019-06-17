
import { throwError as observableThrowError, Observable } from 'rxjs';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { catchError, map, mergeMap } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
// import { ProductApi, LoopBackFilter, CategoryApi, Picture, PictureApi, LoopBackConfig } from '../lb-sdk';
import { Product, Category } from './product.model';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { identifierModuleUrl } from '@angular/compiler';
import { EntityService } from '../entity.service';
import { AuthService } from '../account/auth.service';

const APP = environment.APP;
const API_URL = environment.API_URL;

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
}
