import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '../../../../node_modules/@angular/router';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';

import { MerchantService } from '../merchant.service';
import { IMerchant } from '../../restaurant/restaurant.model';
import { ProductService } from '../../product/product.service';
import { IProduct } from '../../product/product.model';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { ICart, ICartItem } from '../../cart/cart.model';
import { PageActions } from '../../main/main.actions';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { QuitRestaurantDialogComponent } from '../quit-restaurant-dialog/quit-restaurant-dialog.component';
import { IContact } from '../../contact/contact.model';
import { ContactActions } from '../../contact/contact.actions';
import { ICommand } from '../../shared/command.reducers';
import { CommandActions } from '../../shared/command.actions';
import { IDelivery } from '../../delivery/delivery.model';
import { environment } from '../../../environments/environment';
import { IAccount } from '../../account/account.model';
import { AccountService } from '../../account/account.service';

@Component({
  selector: 'app-merchant-detail-page',
  templateUrl: './merchant-detail-page.component.html',
  styleUrls: ['./merchant-detail-page.component.scss']
})
export class MerchantDetailPageComponent implements OnInit, OnDestroy {
  categories: any[]; // [ {categoryId: x, items: [{product: p, quantity: q} ...]} ... ]
  restaurant: IMerchant;
  subscription;
  // cart: ICart;
  onDestroy$ = new Subject<any>();
  locationSubscription;
  dow: number; // day of week
  // delivery: IDelivery;
  products;
  cart;
  contact: IContact;
  delivery: IDelivery;

  onSchedule: boolean;
  bHasAddress: boolean;

  constructor(
    private accountSvc: AccountService,
    private productSvc: ProductService,
    private merchantSvc: MerchantService,
    private route: ActivatedRoute,
    private router: Router,
    private rx: NgRedux<ICart>,
    private location: Location,
    public dialog: MatDialog
  ) {
    const self = this;

    // show cart on footer
    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: { name: 'restaurant-detail' } });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((x: IDelivery) => {
      self.delivery = x;
      // self.address = this.locationSvc.getAddrString(x.origin);
    });

    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.cart = cart;
      if (self.products) {
        // update quantity of cart items
        if (self.categories && self.categories.length > 0) {
          self.categories.map(group => {
            group.items.map(groupItem => {
              const cartItem: ICartItem = cart.items.find(item => item.productId === groupItem.product._id);
              groupItem.quantity = cartItem ? cartItem.quantity : 0;
            });
          });
        }
      }
    });

    this.rx.select<IContact>('contact').pipe(takeUntil(this.onDestroy$)).subscribe((contact: IContact) => {
      this.contact = contact;
    });

    this.rx.select<ICommand>('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'checkout-from-restaurant') {
        this.rx.dispatch({
          type: CommandActions.SEND,
          payload: { name: '' }
        });
        this.checkout();
      }
    });

    this.locationSubscription = this.location.subscribe((x) => {
      const merchantId = self.restaurant._id;
      if (window.location.pathname.endsWith('main/home') ||
        window.location.pathname.endsWith('/') ||
        window.location.pathname.endsWith('contact/address-form')
      ) {
        // window.history.forward();
        if (self.restaurant && self.cart && self.cart.items && self.cart.items.length > 0) {
          this.openDialog(merchantId, 'restaurant-list');
        } else {

        }
      } else if (window.location.pathname.endsWith('order/history')) {
        if (self.restaurant && self.cart && self.cart.items && self.cart.items.length > 0) {
          this.openDialog(merchantId, 'order-history');
        }
      }
    });
  }

  ngOnInit() {
    const self = this;
    self.route.params.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      const merchantId = params['id'];
      if (params['onSchedule'] === 'undefined') {
        this.bHasAddress = false;
        this.onSchedule = true;
      } else {
        this.bHasAddress = true;
        this.onSchedule = params['onSchedule'] === 'true' ? true : false;
      }

      if (this.bHasAddress) {
        const origin = this.delivery.origin;
        const dateType = this.delivery.dateType;

        self.merchantSvc.load(origin, dateType, { _id: merchantId }).pipe(takeUntil(this.onDestroy$)).subscribe((rs: IMerchant[]) => {
          const restaurant = rs[0];
          restaurant.onSchedule = self.onSchedule;
          if (environment.language === 'en') {
            restaurant.name = restaurant.nameEN;
          }
          self.restaurant = restaurant;

          const q = { merchantId: merchantId };
          self.productSvc.find(q).pipe(takeUntil(self.onDestroy$)).subscribe((products: IProduct[]) => { // include merchant account id
            if (environment.language === 'en') {
              products.map(p => {
                p.name = p.nameEN;
              });
            }

            self.products = products;
            self.categories = self.groupByCategory(products);

            // update quantity of cart items
            self.categories.map(group => {
              group.items.map(groupItem => {
                const cartItem: ICartItem = self.cart.items.find(item => item.productId === groupItem.product._id);
                groupItem.quantity = cartItem ? cartItem.quantity : 0;
              });
            });
          });
        });
      } else {
        self.merchantSvc.quickFind({ _id: merchantId }).pipe(takeUntil(this.onDestroy$)).subscribe((rs: IMerchant[]) => {
          const restaurant = rs[0];
          restaurant.onSchedule = self.onSchedule;
          self.restaurant = restaurant;

          const q = { merchantId: merchantId };
          self.productSvc.find(q).pipe(takeUntil(self.onDestroy$)).subscribe(products => {
            if (environment.language === 'en') {
              products.map(p => {
                p.name = p.nameEN;
              });
            }
            self.products = products;
            self.categories = self.groupByCategory(products);

            // load quantity from the cart items
            self.categories.map(group => {
              group.items.map(groupItem => {
                const cartItem: ICartItem = self.cart.items.find(item => item.productId === groupItem.product._id);
                groupItem.quantity = cartItem ? cartItem.quantity : 0;
              });
            });
          });
        });
      }
    });
  }

  ngOnDestroy() {
    this.locationSubscription.unsubscribe();
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  openDialog(merchantId: string, fromPage: string): void {
    const dialogRef = this.dialog.open(QuitRestaurantDialogComponent, {
      width: '300px',
      data: {
        title: '提示', content: '离开后将清空购物车。', buttonTextNo: '离开', buttonTextYes: '留下',
        merchantId: merchantId, fromPage: fromPage, onSchedule: this.onSchedule
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {

    });
  }

  onAfterCheckout(e) {

  }

  // --------------------------------------------------------------------------
  // return --- [ {categoryId: x, items: [{product: p, quantity: q} ...]} ... ]
  groupByCategory(products: IProduct[]) {
    const cats = [];

    products.map(p => {
      const cat = cats.find(c => c.categoryId === p.categoryId);
      const category = p.category;
      if (cat) {
        cat.items.push({ product: p, quanlity: 0 });
      } else {
        if (category) {
          cats.push({
            categoryId: p.categoryId, categoryName: category.name, order: category.order,
            items: [{ product: p, quanlity: 0 }]
          });
        } else { // shouldn't happen
          cats.push({
            categoryId: p.categoryId, categoryName: '其他', order: 0,
            items: [{ product: p, quanlity: 0 }]
          });
        }
      }
    });

    cats.map(c => {
      c.items = c.items.sort((a, b) => {
        if (a.product.order < b.product.order) {
          return -1;
        } else {
          return 1;
        }
      });
    });

    return cats.sort((a, b) => {
      if (a.order < b.order) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  checkout() {
    const self = this;

    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      if (account) { // already logged in
        if (this.delivery.origin) {
          if (this.contact && this.contact.phone) {
            self.router.navigate(['order/form']);
          } else {
            this.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'restaurant-detail' } });
          }
        } else {
          self.rx.dispatch({ type: ContactActions.UPDATE_LOCATION, payload: { location: null } });
          this.router.navigate(['contact/address-form'], { queryParams: { fromPage: 'restaurant-detail' } });
        }
      } else { // not logged in, eg. from en website
        this.router.navigate(['account/phone-verify'], { queryParams: { fromPage: 'restaurant-detail' } });
      }
    });
  }
}
