
import { throwError as observableThrowError, Observable } from 'rxjs';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { catchError, map, mergeMap } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { ProductApi, LoopBackFilter, Product, Category, CategoryApi, Picture, PictureApi, LoopBackConfig } from '../lb-sdk';

import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { identifierModuleUrl } from '@angular/compiler';

const APP = environment.APP;
const API_URL = environment.API_URL;



@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private url = [
    LoopBackConfig.getPath(),
    LoopBackConfig.getApiVersion(),
    'Products'
  ].join('/');

  constructor(
    private http: HttpClient,
    private pictureApi: PictureApi,
    private categoryApi: CategoryApi,
    private productApi: ProductApi
  ) {}

  save(product: Product): Observable<any> {
    return this.http.post(this.url, product);
  }

  replace(product: Product): Observable<any> {
    return this.http.post(this.url, product);
  }

  // find(query: any):Observable<Product[]>{
  //   const url = 
  //   return this.http.get(this.url);
  // }
  // create(product: Product): Observable<Product> {
  //   let productId;
  //   return this.productApi.create(product)
  //     .pipe(
  //       mergeMap((prod: Product) => {
  //         productId = prod.id;
  //         if (product.pictures && product.pictures.length) {
  //           return this.updateProductImages(prod.id, product.pictures);
  //         } else {
  //           return new Observable(i => i.next());
  //         }
  //       }),
  //       mergeMap(() => {
  //         return this.productApi.findById(productId, { include: 'pictures' });
  //       })
  //     );
  // }

  updateProductImages(id: number, newPictures: Picture[] = null): Observable<any> {
    return this.productApi.getPictures(id)
      .pipe(
        mergeMap((pictures: Picture[]) => {
          if (pictures && pictures.length
            && pictures.filter(pic => newPictures.findIndex(newPic => newPic.id === pic.id) === -1).length) {
            return Promise.all(pictures.filter(pic => newPictures.findIndex(newPic => newPic.id === pic.id) === -1).map(pic => {
              return this.pictureApi.deleteById(pic.id).toPromise();
            }))
              .then(() => {
                if (newPictures && newPictures.length && newPictures.filter(newPic => !newPic.id).length) {
                  return this.productApi.createManyPictures(newPictures.filter(newPic => !newPic.id));
                } else {
                  return new Observable(i => i.next());
                }
              });
          } else if (newPictures && newPictures.length && newPictures.filter(newPic => !newPic.id).length) {
            return this.productApi.createManyPictures(id, newPictures.filter(newPic => !newPic.id));
          } else {
            return new Observable(i => i.next());
          }
        })
      );
  }

  replaceById(id: number, product: Product): Observable<Product> {
    return this.productApi.replaceById(id, product)
      .pipe(
        mergeMap((prod: Product) => {
          if (product.pictures && product.pictures.length) {
            return this.updateProductImages(prod.id, product.pictures);
          } else {
            return new Observable(i => i.next());
          }
        }),
        mergeMap(() => {
          return this.productApi.findById(id, { include: 'pictures' });
        })
      );
  }

  findById(id: number, filter: LoopBackFilter = { include: 'pictures' }): Observable<Product> {
    return this.productApi.findById(id, filter);
  }

  find(filter: LoopBackFilter = {}): Observable<Product[]> {
    return this.productApi.find(filter);
  }

  sendFormData(url, formData, token, resolve, reject) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function (e) {
      if (xhr.readyState === 4) { // done
        if (xhr.status === 200) { // ok
          resolve(JSON.parse(xhr.response));
        } else {
          reject(xhr.response);
        }
      }
    };

    xhr.onerror = function (e) {
      reject(xhr.response);
    };

    xhr.open('POST', url, true);
    xhr.setRequestHeader('authorization', 'Bearer ' + btoa(token));
    xhr.send(formData);
  }

  // saveProduct(d: Product) {
  //     const token = localStorage.getItem('token-' + APP);
  //     const self = this;

  //     return fromPromise(new Promise((resolve, reject) => {
  //         const formData = new FormData();
  //         formData.append('id', d.id ? d.id : '');
  //         formData.append('name', d.name);
  //         formData.append('description', d.description);
  //         formData.append('status', 'active');
  //         formData.append('price', d.price ? d.price.toString() : '');
  //         formData.append('currency', 'CAD');
  //         formData.append('categories', Array.from(d.categories, x => x.id).join(','));
  //         formData.append('restaurant_id', d.restaurant.id);

  //         formData.append('n_pictures', d.pictures.length ? d.pictures.length.toString() : '0');
  //         for (let i = 0; i < d.pictures.length; i++) {
  //             formData.append('name' + i, d.pictures[i].name);
  //             const image = d.pictures[i].image;
  //             if (!image.data) {
  //                 formData.append('image_status' + i, 'removed');
  //             } else {
  //                 if (!image.file) {
  //                     formData.append('image_status' + i, 'unchange');
  //                 } else {
  //                     formData.append('image_status' + i, 'changed');
  //                     formData.append('image' + i, image.file);
  //                 }
  //             }
  //         }

  //         self.sendFormData(API_URL + 'product', formData, token, resolve, reject);

  //     }));
  // }


  saveMultiProducts(a: any[]) {
    const token = localStorage.getItem('token-' + APP);
    const self = this;

    return fromPromise(new Promise((resolve, reject) => {
      const formData = new FormData();
      let i = 0;
      for (let d of a) {
        const pic = d.pictures ? d.pictures[0] : null;
        const product = {
          id: d.id ? d.id : '',
          name: d.name,
          description: d.description,
          status: 'active',
          price: d.price ? d.price.toString() : '',
          currency: 'cad',
          // categories:Array.from(d.categories, x => x.id).join(','),
          restaurant_id: d.restaurant_id,
          image_status: (pic && pic.status) ? pic.status : 'unchange'
        };

        formData.append('info_' + i, JSON.stringify(product));

        if (pic) {
          const image = d.pictures ? d.pictures[0].image : null;
          if (image) {
            formData.append('image' + i, image.file);
          }
        }

        i = i + 1;
      }
      self.sendFormData(API_URL + 'products', formData, token, resolve, reject);

    }));
  }

  getProductList(query?: string): Observable<Product[]> {
    const url = API_URL + 'products' + (query ? query : '');
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get(url, { 'headers': headers }).pipe(map((res: any) => {
      const a: Product[] = [];
      const d = res.data;
      if (d && d.length > 0) {
        for (let i = 0; i < d.length; i++) {
          a.push(new Product(d[i]));
        }
      }
      return a;
    }),
      catchError((err) => {
        return observableThrowError(err.message || err);
      }), );
  }

  getProduct(id: number): Observable<Product> {
    const url = API_URL + 'product/' + id;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get(url, { 'headers': headers }).pipe(map((res: any) => {
      return new Product(res.data);
    }),
      catchError((err) => {
        return observableThrowError(err.message || err);
      }), );
  }

  createCategory(category: Category): Observable<Category> {
    return this.categoryApi.create(category);
  }

  replaceCategoryById(id: number, category: Category): Observable<Category> {
    return this.categoryApi.replaceById(id, category);
  }

  findCategories(filter: LoopBackFilter = {}): Observable<Category[]> {
    return this.categoryApi.find(filter);
  }

  rmCategory(id): Observable<Category> {
    return this.categoryApi.deleteById(id);
  }

  deleteById(id): Observable<Product> {
    return this.productApi.deleteById(id);
  }

  findByRestaurant(resturantId): Observable<Product[]> {
    return this.productApi.find({ where: {restaurantId: resturantId}, include: ['category', 'pictures'] });
  }
}
