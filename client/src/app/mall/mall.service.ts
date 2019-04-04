import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mall, IMall } from './mall.model';
import { AuthService } from '../account/auth.service';
import { EntityService } from '../entity.service';
import { ILatLng } from '../location/location.model';
import { LocationService } from '../location/location.service';

@Injectable({
  providedIn: 'root'
})
export class MallService extends EntityService {

  malls: IMall[] = [
    {
      id: '1', name: 'Richmond Hill', type: 'real', lat: 43.8461479, lng: -79.37935279999999, radius: 8,
      workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '2', name: 'Arora', type: 'virtual', lat: 43.995042, lng: -79.442369, radius: 8,
      workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '3', name: 'Markham', type: 'virtual', lat: 43.867055, lng: -79.284616, radius: 8,
      workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '4', name: 'Richmond Hill', type: 'virtual', lat: 43.884244, lng: -79.467925, radius: 8,
      workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    }
  ];

  constructor(
    public http: HttpClient,
    public authSvc: AuthService,
    public locationSvc: LocationService
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

  calcMalls(center: ILatLng, deliverTimeType: string): Promise<any> {
    const self = this;
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve: any, reject) => {
      self.locationSvc.getRoadDistances(center, self.malls).subscribe(rs => {
        if (rs) {
          const reallDistances = rs.filter(r => r.type === 'real');
          self.malls.map((mall: IMall) => {
            const d = reallDistances.find(rm => rm.id === mall.id);
            if (d) {
              mall.distance = d.distance.value / 1000;
              mall.fullDeliverFee = self.getFullDeliveryFee(mall.distance);
              if (deliverTimeType === 'immediate') {
                mall.deliverFee = self.getDeliveryFee(mall.distance);
              } else {
                mall.deliverFee = 0;
              }
            }
          });

          resolve(self.malls);
        }
      }, err => {
        reject([]);
      });
    });
  }

  getFullDeliveryFee(distance: number) {
    if (distance <= 3) {
      return 5;
    } else {
      return 5 + 1.5 * Math.ceil(distance - 3);
    }
  }

  getDeliveryFee(distance: number) {
    if (distance <= 3) {
      return 3;
    } else {
      return 3 + 1.5 * Math.ceil(distance - 3);
    }
  }
}

