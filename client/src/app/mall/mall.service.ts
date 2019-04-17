import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mall, IMall } from './mall.model';
import { AuthService } from '../account/auth.service';
import { EntityService } from '../entity.service';
import { ILatLng, ILocation, IDistance } from '../location/location.model';
import { LocationService } from '../location/location.service';
import { DistanceService } from '../location/distance.service';

@Injectable({
  providedIn: 'root'
})
export class MallService extends EntityService {

  malls: IMall[] = [
    {
      id: '1', name: 'Richmond Hill', type: 'real', lat: 43.8461479, lng: -79.37935279999999, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '2', name: 'Arora', type: 'virtual', lat: 43.995042, lng: -79.442369, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '3', name: 'Markham', type: 'virtual', lat: 43.867055, lng: -79.284616, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '4', name: 'Richmond Hill', type: 'virtual', lat: 43.884244, lng: -79.467925, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    }
  ];

  constructor(
    public http: HttpClient,
    public authSvc: AuthService,
    public locationSvc: LocationService,
    public distanceSvc: DistanceService
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Malls';
  }

  save(mall: Mall): Observable<any> {
    return this.http.post(this.url, mall);
  }

  replace(mall: Mall): Observable<any> {
    return this.http.put(this.url, mall);
  }

  // calcMalls(origin: ILocation, deliverTimeType: string): Promise<any> {
  //   const self = this;
  //   // tslint:disable-next-line:no-shadowed-variable
  //   return new Promise((resolve: any, reject) => {

  //     const destinations: ILocation[] = [];
  //     self.malls.filter(r => r.type === 'real').map(m => {
  //       destinations.push({lat: m.lat, lng: m.lng, placeId: m.placeId});
  //     });
  //     self.locationSvc.reqRoadDistances(origin, destinations).subscribe((rs: IDistance[]) => {
  //       if (rs) {
  //         const reallDistances = rs; // .filter(r => r.type === 'real');
  //         self.malls.map((mall: IMall) => {
  //           const d = reallDistances.find(rm => rm.destination.lat === mall.lat && rm.destination.lng === mall.lng);
  //           if (d) {
  //             mall.distance = d.element.distance.value / 1000;
  //             mall.fullDeliverFee = self.distanceSvc.getFullDeliveryFee(mall.distance);
  //             mall.deliverFee = self.distanceSvc.getDeliveryFee(mall.distance, deliverTimeType);
  //           }
  //         });

  //         resolve(self.malls);
  //       }
  //     }, err => {
  //       reject([]);
  //     });
  //   });
  // }



  inRange(center: ILatLng) {
    const self = this;
    let inRange = false;
    this.malls.filter(x => x.type === 'virtual').map(mall => {
      if (self.locationSvc.getDirectDistance(center, {lat: mall.lat, lng: mall.lng}) < mall.radius * 1000) {
        inRange = true;
      }
    });
    return inRange;
  }
}

