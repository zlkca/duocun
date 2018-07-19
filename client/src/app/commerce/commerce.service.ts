
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { catchError, map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Restaurant,Category,Color,Style,PriceRange,Product,Picture,Cart,CartItem,Order,OrderItem,FavoriteProduct } from './commerce';

import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';

const APP = environment.APP;
const API_URL = environment.API_URL;

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {    
    let index = request.url.indexOf('maps.google.com/maps/api');

    if(index == -1){
        let token = localStorage.getItem('token-' + APP);
        request = request.clone({
          setHeaders: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer ' + btoa(token)
          }
        });
    }else{
        request = request.clone({
          setHeaders: {}
        });
    }
    return next.handle(request);
  }
}

@Injectable()
export class CommerceService {
    
    private API_URL = environment.API_URL;
    private APP = environment.APP;
    MEDIA_URL = environment.APP_URL+'/media/';
    emptyImage = environment.APP_URL + '/media/empty.png';

    constructor(private http:HttpClient){ }
    
    getLocation(addr:string):Observable<any>{
        let url = 'http://maps.google.com/maps/api/geocode/json?address=' + addr + 'CA&sensor=false'
        return this.http.get(url).pipe(map((res:any)=>{
            if(res.results && res.results.length>0){
                let r = res.results[0];
                let postal_code = '', sub_locality = '', locality = '';
                for(let addr of r.address_components){
                    if(addr.types.indexOf('postal_code')!=-1){
                        postal_code = addr.long_name;
                    }
                    if(addr.types.indexOf('sublocality_level_1')!=-1 || addr.types.indexOf('sublocality')!=-1){
                        sub_locality = addr.long_name;
                    }
                    if(addr.types.indexOf('locality')!=-1){
                        locality = addr.long_name;
                    }
                }
                return {...r.geometry.location, ...{'formatted_addr':r.formatted_address,
                    'locality':locality,
                    'sub_locality':sub_locality,
                    'postal_code':postal_code}};//{lat: 43.7825004, lng: -79.3930389}
            }else{
                return null;
            }
        }));
    }

    sendFormData(url, formData, token, resolve, reject){
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function (e) {
          if (xhr.readyState === 4) { // done
            if (xhr.status === 200) { // ok
                resolve(JSON.parse(xhr.response));
                //console.log(xhr.responseText);
            } else {
                reject(xhr.response);
                //console.error(xhr.statusText);
            }
          }
        };

        xhr.onerror = function (e) {
            reject(xhr.response);
            //console.error(xhr.statusText);
        };

        xhr.open("POST", url, true);
        xhr.setRequestHeader("authorization", "Bearer " + btoa(token));
        xhr.send(formData);
    }


    getRestaurantList(query?:string):Observable<Restaurant[]>{
        const url = API_URL + 'restaurants' + (query ? query:'');
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            let a:Restaurant[] = [];
            let d = res.data;
            if( d && d.length > 0){
                for(var i=0; i<d.length; i++){
                    a.push(new Restaurant(d[i]));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getRestaurant(id:number):Observable<Restaurant>{
        const url = API_URL + 'restaurants/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            return new Restaurant(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    // saveRestaurant(d:Restaurant):Observable<Restaurant>{
    //     const url = API_URL + 'restaurants';
    //     let headers = new HttpHeaders().set('Content-Type', 'application/json');
    //     let data = {
    //       'id': d.id? d.id:'',
    //       'name': d.name,
    //       'description': d.description
    //     }
    //     return this.http.post(url, data, {'headers': headers}).map((res:any) => {
    //         return new Restaurant(res.data);
    //     })
    //     .catch((err) => {
    //         return Observable.throw(err.message || err);
    //     });
    // }

    // rmRestaurant(id:number):Observable<Restaurant[]>{
    //     const url = API_URL + 'restaurants/' + id;
    //     let headers = new HttpHeaders().set('Content-Type', 'application/json');
    //     return this.http.delete(url, {'headers': headers}).map((res:any) => {
    //         let a:Restaurant[] = [];
    //         let d = res.data;
    //         if( d && d.length > 0){
    //             for(var i=0; i<d.length; i++){
    //                 a.push(new Restaurant(d[i]));
    //             }
    //         }
    //         return a;
    //     })
    //     .catch((err) => {
    //         return Observable.throw(err.message || err);
    //     });
    // }

    getCategoryList(query?:string):Observable<Category[]>{
        const url = this.API_URL + 'categories' + (query ? query:'');
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            let a:Category[] = [];
            let d = res.data;
            if( d && d.length > 0){
                for(var i=0; i<d.length; i++){
                    a.push(new Category(d[i]));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getCategory(id:number):Observable<Category>{
        const url = this.API_URL + 'categories/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            return new Category(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    saveCategory(d:Category):Observable<Category>{
        const url = this.API_URL + 'categories';
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        let data = {
          'id': d.id? d.id:'',
          'name': d.name,
          'description': d.description,
          'status': d.status,
          'created': d.created,
          'updated': d.updated,
        }
        return this.http.post(url, data, {'headers': headers}).pipe(map((res:any) => {
            return new Category(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    rmCategory(id:number):Observable<Category[]>{
        const url = this.API_URL + 'categories/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.delete(url, {'headers': headers}).pipe(map((res:any) => {
            let a:Category[] = [];
            let d = res.data;
            if( d && d.length > 0){
                for(var i=0; i<d.length; i++){
                    a.push(new Category(d[i]));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }


    saveRestaurant(d:Restaurant){
        let token = localStorage.getItem('token-' + this.APP);
        let self = this;

        return fromPromise(new Promise((resolve, reject)=>{
            let formData = new FormData();
            formData.append('id', d.id? d.id:'');
            formData.append('name', d.name);
            formData.append('description', d.description);
            if(d.address){
                formData.append('address_id', d.address.id);
                formData.append('street', d.address.street);
                formData.append('sub_locality', d.address.sub_locality);
                formData.append('postal_code', d.address.postal_code);
                formData.append('province', d.address.province);
                formData.append('city', d.address.city);
            }
            formData.append('categories', Array.from(d.categories, x => x.id).join(','));
            formData.append('lat', d.address.lat);
            formData.append('lng', d.address.lng);
                 
            let image = d.image;
            if(d.image.data == ''){
                formData.append('image_status', 'removed');
            }else{
                if(d.image.file == ''){
                    formData.append('image_status', 'unchange');
                }else{
                    formData.append('image_status', 'changed');
                    formData.append('image', image.file);
                }
            }

            self.sendFormData(API_URL + 'restaurants', formData, token, resolve, reject);
        }));
    }


    saveMultiRestaurants(a:any[]){
        let token = localStorage.getItem('token-' + this.APP);
        let self = this;

        return fromPromise(new Promise((resolve, reject)=>{
            let formData = new FormData();
            let i = 0;
            for(let d of a){
                let pic = d.pictures? d.pictures[0]:null;
                let product = {id:d.id? d.id:'',
                    name: d.name, 
                    description:d.description,
                    address_id:d.address.id,
                    street:d.address.street,
                    sub_locality:d.address.sub_locality,
                    postal_code:d.address.postal_code,
                    province:d.address.province,
                    city:d.address.city,
                    image_status: (pic && pic.status)? pic.status: 'unchange'
                }

                formData.append('info_'+i, JSON.stringify(product));


                //formData.append('name'+i, d.pictures[i].name);
                if(pic){
                    let image = d.pictures? d.pictures[0].image:null;
                    if(image){
                        formData.append('image'+i, image.file);
                    }
                }

                i = i + 1;    
            }

            self.sendFormData(API_URL + 'products', formData, token, resolve, reject);
        }));
    }

    saveMultiUsers(a:any[]){
        let token = localStorage.getItem('token-' + this.APP);
        let self = this;

        return fromPromise(new Promise((resolve, reject)=>{
            let formData = new FormData();
            let i = 0;
            for(let d of a){
                // let pic = d.pictures? d.pictures[0]:null;
                let product = {id:d.id? d.id:'',
                    name: d.name, 
                    email:d.email,
                    password:d.password
                    // image_status: (pic && pic.status)? pic.status: 'unchange'
                }

                formData.append('info_'+i, JSON.stringify(product));


                //formData.append('name'+i, d.pictures[i].name);
                // if(pic){
                //     let image = d.pictures? d.pictures[0].image:null;
                //     if(image){
                //         formData.append('image'+i, image.file);
                //     }
                // }

                i = i + 1;    
            }

            self.sendFormData(API_URL + 'users', formData, token, resolve, reject);
        }));
    }


    getPriceRangeList(query?:string):Observable<PriceRange[]>{
        const url = this.API_URL + 'priceRanges' + (query ? query:'');
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            let a:PriceRange[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new PriceRange(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getPriceRange(id:number):Observable<PriceRange>{
        const url = this.API_URL + 'priceRange/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            return new PriceRange(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    savePriceRange(d:PriceRange):Observable<PriceRange>{
        const url = this.API_URL + 'priceRange';
        let data = {
            'id': (d.id? d.id:''),
          'low': d.low,
          'high': d.high,
          'step': d.step,
          'status': d.status,
          'created': d.created,
          'updated': d.updated,
        }
        return this.http.post(url, data).pipe(map((res:any) => {
            return new PriceRange(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    rmPriceRange(id:number):Observable<PriceRange[]>{
        const url = this.API_URL + 'priceRange/' + id;
        return this.http.get(url).pipe(map((res:any) => {
            let a:PriceRange[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new PriceRange(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    

    // saveProduct(d:Product):Observable<Product>{
    //     const url = this.API_URL + 'product';
    //     let data = {
    //         'id': (d.id? d.id:''),
    //       'title': d.title,
    //       'description': d.description,
    //       'year': d.year,
    //       'restaurant_id': d.restaurant.id,
    //       'category_id': d.category.id,
    //       'style_id': d.style.id,
    //       'status': d.status,
    //       'pic': d.pic,
    //       'dimension': d.dimension,
    //       'price': d.price,
    //       'currency': d.currency,
    //       'created': d.created,
    //       'updated': d.updated,
    //     }
    //     return this.http.post(url, data).map((res:any) => {
    //         return new Product(res.data);
    //     })
    //     .catch((err) => {
    //         return Observable.throw(err.message || err);
    //     });
    // }

    rmProduct(id:number):Observable<Product[]>{
        const url = this.API_URL + 'product/' + id;
        return this.http.get(url).pipe(map((res:any) => {
            let a:Product[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new Product(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getPictureList(query?:string):Observable<Picture[]>{
        const url = this.API_URL + 'pictures' + (query ? query:'');
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            let a:Picture[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new Picture(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getPicture(id:number):Observable<Picture>{
        const url = this.API_URL + 'picture/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            return new Picture(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    savePicture(d:Picture):Observable<Picture>{
        const url = this.API_URL + 'picture';
        let data = {
            'id': (d.id? d.id:''),
            'name': d.name,
            'description': d.description,
            'image': d.image,
            'width': d.width,
            'height': d.height,
            'product_id': d.product.id,
        }
        return this.http.post(url, data).pipe(map((res:any) => {
            return new Picture(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    rmPicture(id:number):Observable<Picture[]>{
        const url = this.API_URL + 'picture/' + id;
        return this.http.get(url).pipe(map((res:any) => {
            let a:Picture[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new Picture(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getCartList(query?:string):Observable<Cart[]>{
        const url = this.API_URL + 'carts' + (query ? query:'');
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            let a:Cart[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new Cart(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getCart(id:number):Observable<Cart>{
        const url = this.API_URL + 'cart/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            return new Cart(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    checkout(orders:any, user_id:string):Observable<boolean>{
        const url = this.API_URL + 'orders';

        return this.http.post(url, {
            //'id': (d.id? d.id:''),
            'orders': orders, //{pid:x, quantity:number}
            'user_id': user_id
            // 'created': d.created,
            // 'updated': d.updated,
        }).pipe(map((res:any) => {
            return res.success;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    rmCart(id:number):Observable<Cart[]>{
        const url = this.API_URL + 'cart/' + id;
        return this.http.get(url).pipe(map((res:any) => {
            let a:Cart[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new Cart(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getCartItemList(query?:string):Observable<CartItem[]>{
        const url = this.API_URL + 'cartItems' + (query ? query:'');
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            let a:CartItem[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new CartItem(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getCartItem(id:number):Observable<CartItem>{
        const url = this.API_URL + 'cartItem/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            return new CartItem(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    // saveCartItem(d:CartItem):Observable<CartItem>{
    //     const url = this.API_URL + 'cartItem';
    //     let data = {
    //         'id': (d.id? d.id:''),
    //       'quantity': d.quantity,
    //       'product_id': d.product.id,
    //       'cart_id': d.cart.id,
    //       'created': d.created,
    //       'updated': d.updated,
    //     }
    //     return this.http.post(url, data).map((res:any) => {
    //         return new CartItem(res.data);
    //     })
    //     .catch((err) => {
    //         return Observable.throw(err.message || err);
    //     });
    // }

    rmCartItem(id:number):Observable<CartItem[]>{
        const url = this.API_URL + 'cartItem/' + id;
        return this.http.get(url).pipe(map((res:any) => {
            let a:CartItem[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new CartItem(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getOrderList(query?:string):Observable<Order[]>{
        const url = this.API_URL + 'orders' + (query ? query:'');
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            let a:Order[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new Order(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getOrder(id:number):Observable<Order>{
        const url = this.API_URL + 'order/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            return new Order(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    saveOrder(d:Order):Observable<Order>{
        const url = this.API_URL + 'order';
        let data = {
            'id': (d.id? d.id:''),
          'user_id': d.user.id,
          'amount': d.amount,
          'status': d.status,
          'currency': d.currency,
          'created': d.created,
          'updated': d.updated,
        }
        return this.http.post(url, data).pipe(map((res:any) => {
            return new Order(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    rmOrder(id:number):Observable<Order[]>{
        const url = this.API_URL + 'order/' + id;
        return this.http.get(url).pipe(map((res:any) => {
            let a:Order[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new Order(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getOrderItemList(query?:string):Observable<OrderItem[]>{
        const url = this.API_URL + 'orderItems' + (query ? query:'');
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            let a:OrderItem[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new OrderItem(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getOrderItem(id:number):Observable<OrderItem>{
        const url = this.API_URL + 'orderItem/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            return new OrderItem(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    saveOrderItem(d:OrderItem):Observable<OrderItem>{
        const url = this.API_URL + 'orderItem';
        let data = {
            'id': (d.id? d.id:''),
          'order_id': d.order.id,
          'product_id': d.product.id
        }
        return this.http.post(url, data).pipe(map((res:any) => {
            return new OrderItem(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    rmOrderItem(id:number):Observable<OrderItem[]>{
        const url = this.API_URL + 'orderItem/' + id;
        return this.http.get(url).pipe(map((res:any) => {
            let a:OrderItem[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new OrderItem(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getFavoriteProductList(query?:string):Observable<FavoriteProduct[]>{
        const url = this.API_URL + 'favoriteProducts' + (query ? query:'');
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            let a:FavoriteProduct[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new FavoriteProduct(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getFavoriteProduct(id:number):Observable<FavoriteProduct>{
        const url = this.API_URL + 'favoriteProduct/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            return new FavoriteProduct(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    saveFavoriteProduct(d:FavoriteProduct):Observable<FavoriteProduct>{
        const url = this.API_URL + 'favoriteProduct';
        let data = {
            'id': (d.id? d.id:''),
          'user_id': d.user.id,
          'ip': d.ip,
          'product_id': d.product.id,
          'created': d.created,
          'updated': d.updated,
        }
        return this.http.post(url, data).pipe(map((res:any) => {
            return new FavoriteProduct(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    rmFavoriteProduct(id:number):Observable<FavoriteProduct[]>{
        const url = this.API_URL + 'favoriteProduct/' + id;
        return this.http.get(url).pipe(map((res:any) => {
            let a:FavoriteProduct[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new FavoriteProduct(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }



    getColorList(query?:string):Observable<Color[]>{
        const url = this.API_URL + 'colors' + (query ? query:'');
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            let a:Color[] = [];
            let d = res.data;
            if( d && d.length > 0){
                for(var i=0; i<d.length; i++){
                    a.push(new Color(d[i]));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getColor(id:number):Observable<Color>{
        const url = this.API_URL + 'colors/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            return new Color(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    saveColor(d:Color):Observable<Color>{
        const url = this.API_URL + 'colors';
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        let data = {
          'id': d.id? d.id:'',
          'name': d.name,
          'description': d.description
          // 'status': d.status,
        }
        return this.http.post(url, data, {'headers': headers}).pipe(map((res:any) => {
            return new Color(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    rmColor(id:number):Observable<Color[]>{
        const url = this.API_URL + 'colors/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.delete(url, {'headers': headers}).pipe(map((res:any) => {
            let a:Color[] = [];
            let d = res.data;
            if( d && d.length > 0){
                for(var i=0; i<d.length; i++){
                    a.push(new Color(d[i]));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getStyleList(query?:string):Observable<Style[]>{
        const url = this.API_URL + 'styles' + (query ? query:'');
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            let a:Style[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new Style(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    getStyle(id:number):Observable<Style>{
        const url = this.API_URL + 'style/' + id;
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.get(url, {'headers': headers}).pipe(map((res:any) => {
            return new Style(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    saveStyle(d:Style):Observable<Style>{
        const url = this.API_URL + 'style';
        let data = {
            'id': (d.id? d.id:''),
          'name': d.name,
          'description': d.description,
          'status': d.status,
          'created': d.created,
          'updated': d.updated,
        }
        return this.http.post(url, data).pipe(map((res:any) => {
            return new Style(res.data);
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

    rmStyle(id:number):Observable<Style[]>{
        const url = this.API_URL + 'style/' + id;
        return this.http.get(url).pipe(map((res:any) => {
            let a:Style[] = [];
            if( res.data && res.data.length > 0){
                for(let b of res.data){
                    a.push(new Style(b));
                }
            }
            return a;
        }),
        catchError((err) => {
            return observableThrowError(err.message || err);
        }),);
    }

}
