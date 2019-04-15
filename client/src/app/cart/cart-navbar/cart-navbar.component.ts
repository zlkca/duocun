import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ICart, ICartItem } from '../cart.model';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { IContact, Contact } from '../../contact/contact.model';
import { ContactService } from '../../contact/contact.service';
import { Router } from '../../../../node_modules/@angular/router';
import { LocationService } from '../../location/location.service';
import { ContactActions } from '../../contact/contact.actions';
import { ILocation } from '../../location/location.model';

@Component({
  selector: 'app-cart-navbar',
  templateUrl: './cart-navbar.component.html',
  styleUrls: ['./cart-navbar.component.scss']
})
export class CartNavbarComponent implements OnInit {
  onDestroy$ = new Subject<any>();
  quantity;
  productTotal;
  location;
  account;

  @Input() merchantId: string;
  @Output() afterCheckout = new EventEmitter();

  constructor(
    private rx: NgRedux<IAppState>,
    private contactSvc: ContactService,
    private locationSvc: LocationService,
    private router: Router,
  ) {
    this.rx.select('account').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((account: Account) => {
      this.account = account;
    });
    this.rx.select('location').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((loc: ILocation) => {
      this.location = loc;
    });
  }

  ngOnInit() {
    const self = this;
    this.rx.select<ICart>('cart').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(cart => {
      this.quantity = 0;
      this.productTotal = 0;
      const items: ICartItem[] = cart.items;
      if (items && items.length > 0) {
        items.map(x => {
          if (x.merchantId === self.merchantId) {
            this.productTotal += (x.price * x.quantity);
            this.quantity += x.quantity;
          }
        });
      }
    });
  }


  toCart() {
    this.router.navigate(['cart']);
  }

  checkout() {
    const self = this;

    if (this.quantity > 0) {
      this.afterCheckout.emit({ productTotal: this.productTotal, quantity: this.quantity });
      const account = this.account;
      self.contactSvc.find({ where: { accountId: account.id } }).subscribe((r: IContact[]) => {
        if (r && r.length > 0) {

          r[0].placeId = self.location.place_id;
          r[0].location = self.location;
          r[0].address = self.locationSvc.getAddrString(self.location);
          r[0].modified = new Date();
          this.rx.dispatch({ type: ContactActions.UPDATE, payload: r[0] });

          if (r[0].phone) {
            self.router.navigate(['contact/list']);
          } else {
            self.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'restaurant-detail' } });
          }
        } else {
          const contact = new Contact({
            accountId: account.id,
            username: account.username,
            phone: '', // account.phone,
            placeId: self.location.place_id,
            location: self.location,
            unit: '',
            buzzCode: '',
            address: self.locationSvc.getAddrString(self.location),
            created: new Date(),
            modified: new Date()
          });

          self.rx.dispatch({ type: ContactActions.UPDATE, payload: contact });
          self.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'restaurant-detail' } });
        }
      });
    }
  }

}
