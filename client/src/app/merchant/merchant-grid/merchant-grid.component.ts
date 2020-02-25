import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { IMerchant } from '../../merchant/merchant.model';
import { environment } from '../../../environments/environment';
import { Router } from '../../../../node_modules/@angular/router';
import { Subject } from '../../../../node_modules/rxjs';
import { DistanceService } from '../../location/distance.service';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../../main/main.actions';
import { DeliveryActions } from '../../delivery/delivery.actions';
import { CartActions } from '../../cart/cart.actions';
import { MerchantActions } from '../merchant.actions';

@Component({
  selector: 'app-merchant-grid',
  templateUrl: './merchant-grid.component.html',
  styleUrls: ['./merchant-grid.component.scss']
})
export class MerchantGridComponent implements OnInit, OnDestroy, OnChanges {
  @Input() merchants;
  @Input() origin; // ILocation

  onDestroy$ = new Subject();
  restaurants;
  defaultPicture = window.location.protocol + '//placehold.it/400x300';
  lang = environment.language;
  nCols = 3;
  rows;

  constructor(
    private distanceSvc: DistanceService,
    private router: Router,
    private rx: NgRedux<IAppState>
  ) {

  }

  ngOnChanges(d) { // this is run before ngOnInit
    if (this.merchants && this.merchants.length > 0) {
      const merchants = this.processMerchants(this.origin, this.merchants); // this.origin could be empty
      const nRows = Math.ceil(merchants.length / this.nCols);
      const rows = [];

      for (let i = 0; i < nRows; i++) {
        const row = [];
        for (let j = 0; j < this.nCols; j++) {
          const index = i * this.nCols + j;
          row.push(merchants[index]);
        }
        rows.push(row);
      }

      this.rows = rows;
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {

  }

  processMerchants(origin, rs) {
    const self = this;
    if (rs && rs.length > 0) {
      if (origin) {
        rs.map((restaurant: IMerchant) => {
          if (environment.language === 'en') {
            restaurant.name = restaurant.nameEN;
          }
          restaurant.distance = restaurant.distance;
          restaurant.deliveryCost = self.distanceSvc.getDeliveryCost(restaurant.distance);
        });
        return this.sort(rs);
      } else {
        rs.map((restaurant: IMerchant) => {
          if (environment.language === 'en') {
            restaurant.name = restaurant.nameEN;
          }
          restaurant.inRange = true; // for display order deadline wording
          restaurant.distance = 0;
          restaurant.deliveryCost = self.distanceSvc.getDeliveryCost(restaurant.distance);
          restaurant.isClosed = false;
        });
        return this.sort(rs);
      }
    } else {
      return [];
    }
  }

  getImageSrc(restaurant: any) {
    if (restaurant.pictures && restaurant.pictures[0] && restaurant.pictures[0].url) {
      return environment.MEDIA_URL + restaurant.pictures[0].url;
    } else {
      return this.defaultPicture;
    }
  }

  toDetail(r: IMerchant) {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: { name: 'restaurants' }
    });
    this.rx.dispatch({ type: MerchantActions.UPDATE_MERCHANT, payload: r });
    this.rx.dispatch({
      type: DeliveryActions.UPDATE_DESTINATION,
      payload: { destination: r.location, distance: r.distance }
    });

    this.router.navigate(['merchant/list/' + r._id + '/' + r.onSchedule]);
  }


  getDistanceString(r: IMerchant) {
    return r.distance.toFixed(2) + ' km';
  }

  sort(restaurants) {
    return restaurants.sort((a: IMerchant, b: IMerchant) => {
      if (!a.isClosed && b.isClosed) {
        return -1;
      } else if (a.isClosed && !b.isClosed) {
        return 1;
      } else if (a.onSchedule && !b.onSchedule) {
        return -1;
      } else if (!a.onSchedule && b.onSchedule) {
        return 1;
      } else if (!a.orderEnded && b.orderEnded) {
        return -1;
      } else if (a.orderEnded && !b.orderEnded) {
        return 1;
      } else if (a.inRange && !b.inRange) {
        return -1;
      } else if (!a.inRange && b.inRange) {
        return 1;
      } else {
        if (a.order && !b.order) {
          return -1;
        } else if (!a.order && b.order) {
          return 1;
        } else if (a.order && b.order) {
          if (a.order > b.order) {
            return 1;
          } else {
            return -1;
          }
        } else {
          if (a.distance < b.distance) {
            return -1;
          }
          if (a.distance > b.distance) {
            return 1;
          }
        }

        return 0;
      }
    });
  }

  isCloseInTurn(r: IMerchant) {
    return (this.origin && !r.onSchedule) || r.isClosed;
  }
}
