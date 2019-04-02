import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Subject, forkJoin } from '../../../../node_modules/rxjs';
import { takeUntil, first } from '../../../../node_modules/rxjs/operators';
import { IDelivery } from '../../delivery/delivery.model';
import { ICart } from '../../cart/cart.model';
import { IMall } from '../../mall/mall.model';
import { IContact } from '../../contact/contact.model';

@Component({
  selector: 'app-order-form-page',
  templateUrl: './order-form-page.component.html',
  styleUrls: ['./order-form-page.component.scss']
})
export class OrderFormPageComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<any>();
  delivery;
  cart;
  subtotal;
  quantity;
  total = 0;
  restaurantName = '';
  tips = 3;
  malls: IMall[] = [];
  deliveryFee = 0;
  tax = 0;
  contact;

  constructor(
    private rx: NgRedux<IAppState>,
  ) {

  }

  ngOnInit() {
    const self = this;
    forkJoin([
      this.rx.select<IMall[]>('malls').pipe(
        first(),
        takeUntil(this.onDestroy$)
      ),
      this.rx.select<ICart>('cart').pipe(
        first(),
        takeUntil(this.onDestroy$)
      ),
      this.rx.select<IContact>('contact').pipe(
        first(),
        takeUntil(this.onDestroy$)
      )
    ]).subscribe(vals => {
      const malls = vals[0];
      const cart = vals[1];
      this.contact = vals[3];
      if (malls && malls.length > 0) {
        this.malls = malls;
        this.deliveryFee = malls[0].deliverFee; // fix me
      }
      this.subtotal = 0;
      this.quantity = 0;
      this.cart = cart;
      const items = this.cart.items;
      if (items && items.length > 0) {
        items.map(x => {
          this.subtotal += x.price * x.quantity;
          this.quantity += x.quantity;
        });
        this.restaurantName = items[0].restaurantName;
      }

      this.total = this.subtotal + this.deliveryFee + this.tips;
      this.tax = this.total * 0.13;
      this.total = this.total + this.tax;
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

}
