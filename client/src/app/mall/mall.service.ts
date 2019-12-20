import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mall, IMall } from './mall.model';
import { AuthService } from '../account/auth.service';
import { EntityService } from '../entity.service';
import { ILatLng, ILocation, IDistance } from '../location/location.model';
import { LocationService } from '../location/location.service';
import { DistanceService } from '../location/distance.service';
import { IRange } from '../range/range.model';

@Injectable({
  providedIn: 'root'
})
export class MallService extends EntityService {
  constructor(
    public http: HttpClient,
    public authSvc: AuthService,
    public locationSvc: LocationService,
    public distanceSvc: DistanceService
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Malls';
  }

  isInRange(mall: IMall, availableRanges: IRange[]) {
    let bInRange = false;
    if (mall.ranges) {
      mall.ranges.map((rangeId: string) => {
        const range = availableRanges.find(ar => ar._id === rangeId);
        if (range) {
          bInRange = true;
        }
      });
    }
    return bInRange;
  }


}

