import { Injectable } from '@angular/core';
import { RestaurantApi, LoopBackFilter, Restaurant, GeoPoint, Order, OrderApi } from '../shared/lb-sdk';
import { Observable } from 'rxjs';
import { mergeMap } from '../../../node_modules/rxjs/operators';

@Injectable()
export class RestaurantService {
    constructor(
        private restaurantApi: RestaurantApi,
        private orderApi: OrderApi,
    ) { }

    create(restaurant: Restaurant): Observable<Restaurant> {
        return this.restaurantApi.create(restaurant);
    }

    replaceById(id: number, restaurant: Restaurant): Observable<Restaurant> {
        return this.restaurantApi.replaceById(id, restaurant);
    }

    findById(id: number, filter: LoopBackFilter = {}): Observable<Restaurant> {
        return this.restaurantApi.findById(id, filter);
    }

    find(filter: LoopBackFilter = {}): Observable<Restaurant[]> {
        return this.restaurantApi.find(filter);
    }

    getNearby(location: GeoPoint, maxDistance: number = 20, limit: number = 0): Observable<Restaurant[]> {
        return this.restaurantApi.find({
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
}
