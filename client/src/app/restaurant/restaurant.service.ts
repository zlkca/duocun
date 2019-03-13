import { Injectable } from '@angular/core';
import { RestaurantApi, LoopBackFilter, Restaurant, GeoPoint, Order, OrderApi, Product, Picture, PictureApi } from '../lb-sdk';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class RestaurantService {
  constructor(
    private restaurantApi: RestaurantApi,
    private pictureApi: PictureApi,
    private orderApi: OrderApi,
  ) { }

  create(restaurant: Restaurant): Observable<Restaurant> {
    let restaurantId;
    return this.restaurantApi.create(restaurant)
      .pipe(
        mergeMap((rest: Restaurant) => {
          restaurantId = rest.id;
          if (restaurant.pictures && restaurant.pictures.length) {
            return this.updateRestaurantImages(rest.id, restaurant.pictures);
          } else {
            return new Observable(i => i.next());
          }
        }),
        mergeMap(() => {
          if (restaurant.address) {
            return this.restaurantApi.createAddress(restaurantId, restaurant.address);
          } else {
            return new Observable(i => i.next());
          }
        }),
        mergeMap(() => {
          return this.restaurantApi.findById(restaurantId, { include: ['pictures', 'address'] });
        })
      );
  }

  replaceById(id: number, restaurant: Restaurant): Observable<Restaurant> {
    return this.restaurantApi.replaceById(id, restaurant)
      .pipe(
        mergeMap((rest: Restaurant) => {
          if (restaurant.pictures && restaurant.pictures.length) {
            return this.updateRestaurantImages(rest.id, restaurant.pictures);
          } else {
            return new Observable(i => i.next());
          }
        }),
        mergeMap(() => {
          if (restaurant.address && restaurant.address.id) {
            return this.restaurantApi.updateAddress(id, restaurant.address);
          } else if (restaurant.address && !restaurant.address.id) {
            return this.restaurantApi.createAddress(id, restaurant.address);
          } else {
            return new Observable(i => i.next());
          }
        }),
        mergeMap(() => {
          return this.restaurantApi.findById(id, { include: ['pictures', 'address'] });
        })
      );
  }

  updateRestaurantImages(id: number, newPictures: Picture[] = null): Observable<any> {
    return this.restaurantApi.getPictures(id)
      .pipe(
        mergeMap((pictures: Picture[]) => {
          if (pictures && pictures.length && pictures.filter(pic => newPictures.findIndex(newPic => newPic.id === pic.id) === -1).length) {
            return Promise.all(pictures.filter(pic => newPictures.findIndex(newPic => newPic.id === pic.id) === -1).map(pic => {
              return this.pictureApi.deleteById(pic.id).toPromise();
            }))
              .then(() => {
                if (newPictures && newPictures.length && newPictures.filter(newPic => !newPic.id).length) {
                  return this.restaurantApi.createManyPictures(newPictures.filter(newPic => !newPic.id));
                } else {
                  return new Observable(i => i.next());
                }
              });
          } else if (newPictures && newPictures.length && newPictures.filter(newPic => !newPic.id).length) {
            return this.restaurantApi.createManyPictures(id, newPictures.filter(newPic => !newPic.id));
          } else {
            return new Observable(i => i.next());
          }
        })
      );
  }

  findById(id: number, filter: LoopBackFilter = { include: ['pictures', 'address'] }): Observable<Restaurant> {
    return this.restaurantApi.findById(id, filter);
  }

  find(filter: LoopBackFilter = { include: ['pictures', 'address'] }): Observable<Restaurant[]> {
    return this.restaurantApi.find(filter);
  }

  getNearby(location: GeoPoint, maxDistance: number = 20, limit: number = 10): Observable<Restaurant[]> {
    return this.restaurantApi.find({
      include: 'pictures',
      where: {
        location: {
          near: location,
          maxDistance: maxDistance,
          unit: 'kilometers'
        }
      },
      limit: limit
    });
  }

  getOrders(id: any, filter: LoopBackFilter = {}): Observable<Order[]> {
    return this.restaurantApi.getOrders(id, filter);
  }

  getProducts(id: any, filter: LoopBackFilter = { include: ['category', 'pictures'] }): Observable<Product[]> {
    return this.restaurantApi.getProducts(id, filter);
  }

  syncOrders(id: any, filter: LoopBackFilter = {}): Observable<Order> {
    return this.orderApi.onCreate([])
      .pipe(
        mergeMap((orders: Order[]) => {
          if (orders[0] && orders[0].id && orders[0].restaurantId === id) {
            return this.orderApi.findById(orders[0].id, filter);
          } else {
            return [];
          }
        })
      );
  }

  rmRestaurant(id): Observable<Restaurant> {
    return this.restaurantApi.deleteById(id);
  }
}
