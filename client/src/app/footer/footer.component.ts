import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { Account } from '../account/account.model';
import { IAppState } from '../store';
import { CommandActions } from '../shared/command.actions';
import { takeUntil, first } from '../../../node_modules/rxjs/operators';
import { Subject, forkJoin } from '../../../node_modules/rxjs';
import { ICart, ICartItem } from '../cart/cart.model';
import { IMall } from '../mall/mall.model';
import { IAmount } from '../order/order.model';
import { ContactService } from '../contact/contact.service';
import { LocationService } from '../location/location.service';
import { Contact } from '../contact/contact.model';
import { ILocation } from '../location/location.model';
import { IContactAction } from '../contact/contact.reducer';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  year = 2018;
  account: Account;
  bCart = false;
  bPay = false;
  total;
  quantity = 0;
  cart;
  malls: IMall[];
  tips = 3;
  subtotal = 0;
  deliveryFee = 0;
  tax = 0;
  location: ILocation;

  private onDestroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private rx: NgRedux<IAppState>,
    private contactSvc: ContactService,
    private locationSvc: LocationService
  ) {
    const self = this;
    this.rx.select('account').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((account: Account) => {
      self.account = account;
    });

    this.rx.select('location').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((loc: ILocation) => {
      self.location = loc;
    });

    this.rx.select<string>('page').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(x => {
      if (x === 'restaurant-detail' || x === 'cart') {
        self.bCart = true;
        self.bPay = false;
      } else if (x === 'order-confirm') {
        self.bCart = false;
        self.bPay = true;
      } else {
        self.bCart = false;
        self.bPay = false;
      }
    });

    this.rx.select<ICart>('cart').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(cart => {
      this.subtotal = 0;
      this.quantity = 0;
      this.cart = cart;
      const items = this.cart.items;
      if (items && items.length > 0) {
        items.map(x => {
          this.subtotal += x.price * x.quantity;
          this.quantity += x.quantity;
        });
      }
    });

    this.rx.select<IAmount>('amount').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x: IAmount) => {
      this.total = x ? x.total : 0;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  toHome() {
    this.router.navigate(['main/home']);
  }

  toOrder() {
    if (this.account.type === 'user' || this.account.type === 'super') {
      this.router.navigate(['order/history']);
    } else if (this.account.type === 'worker') {
      this.router.navigate(['order/list-worker']);
    } else if (this.account.type === 'restaurant') {
      this.router.navigate(['order/list-restaurant']);
    }
  }

  toCart() {
    if (this.account.type === 'user' || this.account.type === 'super') {
      this.router.navigate(['cart']);
    } else if (this.account.type === 'worker') {
      this.router.navigate(['order/list-worker']);
    } else if (this.account.type === 'restaurant') {
      this.router.navigate(['order/list-restaurant']);
    }
  }

  toAccount() {
    this.router.navigate(['account/login']);
  }

  toAdmin() {
    this.router.navigate(['admin']);
  }

  checkout() {
    const self = this;
    if (this.account.type === 'user' || this.account.type === 'super') {
      if (this.quantity > 0) {
        const account = this.account;

        self.contactSvc.find({where: {accountId: account.id}}).subscribe(r => {
          if (r && r.length > 0) {
            // let contacts = r;
            // this.rx.dispatch<IContactAction>({
            //   type: ContactActions.UPDATE,
            //   payload: contact
            // });
            this.router.navigate(['contact/list']);
          } else {
            const data = new Contact({
              accountId: account.id,
              username: account.username,
              phone: account.phone,
              location: self.location,
              unit: '',
              buzzCode: '',
              address: self.locationSvc.getAddrString(self.location)
            });
            // let contacts = [data];
            // this.rx.dispatch<IContactAction>({
            //   type: ContactActions.UPDATE,
            //   payload: contact
            // });
            this.contactSvc.save(data).subscribe(() => {});
            this.router.navigate(['contact/list']);
          }
        });
        // this.router.navigate(['contact/list']);
      }
    } else {
      this.router.navigate(['acccount/login']);
    }
  }

  pay() {
    if (this.account.type === 'user' || this.account.type === 'super') {
      if (this.quantity > 0) {
        this.rx.dispatch({
          type: CommandActions.SEND,
          payload: 'pay'
        });
      }
      this.bCart = false;
      this.bPay = false;
    } else {
      // pass
    }
  }
}
