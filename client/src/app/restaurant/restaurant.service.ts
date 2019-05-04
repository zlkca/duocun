import { Injectable } from '@angular/core';
// import { RestaurantApi, LoopBackFilter, GeoPoint, Order, OrderApi, Product, Picture, PictureApi } from '../lb-sdk';
import * as moment from 'moment';
import { Restaurant, IRestaurant } from './restaurant.model';
import { Observable } from 'rxjs';
import { mergeMap, flatMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../account/auth.service';
import { EntityService } from '../entity.service';
import { IDeliveryTime } from '../delivery/delivery.model';

@Injectable()
export class RestaurantService extends EntityService {

  constructor(
    // private restaurantApi: RestaurantApi,
    // private pictureApi: PictureApi,
    // private orderApi: OrderApi,
    public authSvc: AuthService,
    public http: HttpClient
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Restaurants';
  }

  save(restaurant: Restaurant): Observable<any> {
    return this.http.post(this.url, restaurant);
  }

  replace(restaurant: Restaurant): Observable<any> {
    return this.http.put(this.url, restaurant);
  }

  isClosed(restaurant: IRestaurant, deliveryTime: IDeliveryTime) {
    // const now = moment();
    // const tomorrow = moment().add(1, 'days');
    // const afterTomorrow = moment().add(2, 'days');

    if (restaurant.closed) { // has special close day
      if (restaurant.closed.find(d => moment(d).isSame(moment(deliveryTime.from), 'day'))) {
        return true;
      } else {
        return this.isClosePerWeek(restaurant, deliveryTime);
      }
    } else {
      return this.isClosePerWeek(restaurant, deliveryTime);
    }
  }

  isClosePerWeek(restaurant: IRestaurant, deliveryTime: IDeliveryTime) {
    if (restaurant.dow && restaurant.dow.length > 0) {
      const openAll = restaurant.dow.find(d => d === 'all');
      if (openAll) {
        return false;
      } else {
        const r = restaurant.dow.find(d => moment(deliveryTime.from).day() === +d);
        return r ? false : true;
      }
    } else {
      return true;
    }
  }
  // create(restaurant: Restaurant): Observable<Restaurant> {
  //   let merchantId;
  //   return this.restaurantApi.create(restaurant)
  //     .pipe(
  //       mergeMap((rest: Restaurant) => {
  //         merchantId = rest.id;
  //         if (restaurant.pictures && restaurant.pictures.length) {
  //           return this.updateRestaurantImages(rest.id, restaurant.pictures);
  //         } else {
  //           return new Observable(i => i.next());
  //         }
  //       }),
  //       mergeMap(() => {
  //         if (restaurant.address) {
  //           return this.restaurantApi.createAddress(merchantId, restaurant.address);
  //         } else {
  //           return new Observable(i => i.next());
  //         }
  //       }),
  //       mergeMap(() => {
  //         return this.restaurantApi.findById(merchantId, { include: ['pictures', 'address'] });
  //       })
  //     );
  // }

  // replaceById(id: string, data: Restaurant): Observable<Restaurant> {
  //   return this.doReplaceById(id, data).pipe(
  //     flatMap((restaurant: Restaurant) => {
  //       if (restaurant.pictures && restaurant.pictures.length) {
  //         return this.updateRestaurantImages(restaurant.id, data.pictures);
  //       } else {
  //         return new Observable(i => i.next(restaurant));
  //       }
  //     })
  //   );
  // }

  // // internal function to merge address and replace
  // private doReplaceById(id: string, data: Restaurant): Observable<Restaurant> {
  //   return this.restaurantApi.replaceById(id, data).pipe(
  //     flatMap((restaurant: Restaurant) => {
  //       if (restaurant.address && restaurant.address.id) {
  //         return this.restaurantApi.updateAddress(id, data.address);
  //       } else if (restaurant.address && !restaurant.address.id) {
  //         return this.restaurantApi.createAddress(id, data.address);
  //       } else {
  //         return new Observable(observer => observer.next(restaurant));
  //       }
  //     })
  //   );
  // }

  // // There is only one picture for restaurant for now!
  // private updatePhotos(id: string, restaurant: Restaurant, newPictures: Picture[] = null): Observable<Restaurant> {
  //   const pictures = restaurant.pictures;

  //   if (pictures && pictures.length) {
  //     newPictures[0].id = pictures[0].id;
  //   }
  //   return this.pictureApi.replaceOrCreate(newPictures[0]).pipe(
  //     flatMap((pic: Picture) => {
  //       restaurant.pictures = [pic];
  //       return new Observable<Restaurant>(observer => observer.next(restaurant));
  //     })
  //   );
  // }


  // private updateRestaurantImages(id: string, newPictures: Picture[] = null): Observable<any> {
  //   return this.restaurantApi.getPictures(id)
  //     .pipe(
  //       mergeMap((pictures: Picture[]) => {
  //         if (pictures && pictures.length && pictures.filter(pic => newPictures.findIndex(
  //  newPic => newPic.id === pic.id) === -1).length) {
  //           return Promise.all(pictures.filter(pic => newPictures.findIndex(newPic => newPic.id === pic.id) === -1).map(pic => {
  //             return this.pictureApi.deleteById(pic.id).toPromise();
  //           }))
  //             .then(() => {
  //               if (newPictures && newPictures.length && newPictures.filter(newPic => !newPic.id).length) {
  //                 return this.restaurantApi.createManyPictures(newPictures.filter(newPic => !newPic.id));
  //               } else {
  //                 return new Observable(i => i.next());
  //               }
  //             });
  //         } else if (newPictures && newPictures.length && newPictures.filter(newPic => !newPic.id).length) {
  //           return this.restaurantApi.createManyPictures(id, newPictures.filter(newPic => !newPic.id));
  //         } else {
  //           return new Observable(i => i.next());
  //         }
  //       })
  //     );
  // }

  // // findById(id: string, filter: LoopBackFilter = { include: ['pictures', 'address'] }): Observable<Restaurant> {
  // //   return this.restaurantApi.findById(id, filter);
  // // }

  // // find(filter: LoopBackFilter = { include: ['pictures', 'address'] }): Observable<Restaurant[]> {
  // //   return this.restaurantApi.find(filter);
  // // }

  // getNearby(location: GeoPoint, maxDistance: number = 20, limit: number = 10): Observable<Restaurant[]> {
  //   return this.restaurantApi.find({
  //     include: 'pictures',
  //     where: {
  //       location: {
  //         near: location,
  //         maxDistance: maxDistance,
  //         unit: 'kilometers'
  //       }
  //     },
  //     limit: limit
  //   });
  // }

  // getOrders(id: any, filter: LoopBackFilter = {}): Observable<Order[]> {
  //   return this.restaurantApi.getOrders(id, filter);
  // }

  // getProducts(id: any, filter: LoopBackFilter = { include: ['category', 'pictures'] }): Observable<Product[]> {
  //   return this.restaurantApi.getProducts(id, filter);
  // }

  // syncOrders(id: any, filter: LoopBackFilter = {}): Observable<Order> {
  //   return this.orderApi.onCreate([])
  //     .pipe(
  //       mergeMap((orders: Order[]) => {
  //         if (orders[0] && orders[0].id && orders[0].merchantId === id) {
  //           return this.orderApi.findById(orders[0].id, filter);
  //         } else {
  //           return [];
  //         }
  //       })
  //     );
  // }

  // rmRestaurant(id): Observable<Restaurant> {
  //   return this.restaurantApi.deleteById(id);
  // }
}
