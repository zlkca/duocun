import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '../../../../node_modules/@angular/router';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { MerchantService } from '../merchant.service';
import { IMerchant } from '../../merchant/merchant.model';
import { ProductService } from '../../product/product.service';
import { IProduct, ICategory, ProductStatus } from '../../product/product.model';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { ICart, ICartItem } from '../../cart/cart.model';
import { PageActions } from '../../main/main.actions';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { QuitRestaurantDialogComponent } from '../quit-restaurant-dialog/quit-restaurant-dialog.component';
import { ICommand } from '../../shared/command.reducers';
import { CommandActions } from '../../shared/command.actions';
import { IDelivery } from '../../delivery/delivery.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-merchant-detail-page',
  templateUrl: './merchant-detail-page.component.html',
  styleUrls: ['./merchant-detail-page.component.scss']
})
export class MerchantDetailPageComponent implements OnInit, OnDestroy {
  categories: any[]; // [ {categoryId: x, items: [{product: p, quantity: q} ...]} ... ]
  restaurant: IMerchant;
  subscription;
  onDestroy$ = new Subject<any>();
  locationSubscription;
  dow: number; // day of week
  cart;
  delivery: IDelivery;
  lang = environment.language;
  onSchedule: boolean;
  bHasAddress: boolean;

  constructor(
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
    });

    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.cart = cart;
      // update quantity of cart items
      if (self.categories && self.categories.length > 0) {
        self.categories.map(group => {
          group.items.map(groupItem => {
            const cartItem: ICartItem = cart.items.find(item => item.productId === groupItem.product._id);
            groupItem.quantity = cartItem ? cartItem.quantity : 0;
          });
        });
      }
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
    this.route.params.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      const merchantId = params['id'];
      if (params['onSchedule'] === 'undefined') {
        this.bHasAddress = false;
        this.onSchedule = true;
      } else {
        this.bHasAddress = true;
        this.onSchedule = params['onSchedule'] === 'true' ? true : false;
      }

      if (this.delivery.origin) {
        const origin = this.delivery.origin;
        const dateType = this.delivery.dateType;

        self.merchantSvc.load(origin, dateType, { _id: merchantId }).pipe(takeUntil(this.onDestroy$)).subscribe((ms: IMerchant[]) => {
          const merchant = ms[0];
          // restaurant.onSchedule = self.onSchedule;
          if (environment.language === 'en') {
            merchant.name = merchant.nameEN;
          }

          const q = { merchantId: merchantId, status: { $in: [ProductStatus.ACTIVE, ProductStatus.NEW, ProductStatus.PROMOTE]} };
          self.productSvc.categorize(q, this.lang).pipe(takeUntil(self.onDestroy$)).subscribe((cats: any[]) => {
            // update quantity of cart items
            cats.map(group => {
              group.items.map(groupItem => {
                const cartItem: ICartItem = self.cart.items.find(item => item.productId === groupItem.product._id);
                groupItem.quantity = cartItem ? cartItem.quantity : 0;
              });
            });
            self.restaurant = merchant;
            self.categories = cats;
          });
        });
      } else {
        self.merchantSvc.quickFind({ _id: merchantId }).pipe(takeUntil(this.onDestroy$)).subscribe((rs: IMerchant[]) => {
          const restaurant = rs[0];
          restaurant.onSchedule = self.onSchedule;
          if (environment.language === 'en') {
            restaurant.name = restaurant.nameEN;
          }
          const q = { merchantId: merchantId, status: { $in: [ProductStatus.ACTIVE, ProductStatus.NEW, ProductStatus.PROMOTE]} };
          self.productSvc.categorize(q, this.lang).pipe(takeUntil(self.onDestroy$)).subscribe((cats: any[]) => {
            // update quantity of cart items
            cats.map(group => {
              group.items.map(groupItem => {
                const cartItem: ICartItem = self.cart.items.find(item => item.productId === groupItem.product._id);
                groupItem.quantity = cartItem ? cartItem.quantity : 0;
              });
            });
            self.restaurant = restaurant;
            self.categories = cats;
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
        title: this.lang === 'en' ? 'Hint' : '提示',
        content: this.lang === 'en' ? 'Cart will be clear when leave' : '离开后将清空购物车。',
        buttonTextNo: this.lang === 'en' ? 'Leave' : '离开',
        buttonTextYes: this.lang === 'en' ? 'Stay' : '留下',
        merchantId: merchantId, fromPage: fromPage, onSchedule: this.onSchedule
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {

    });
  }

  onAfterCheckout(e) {

  }


  checkout() {
    this.router.navigate(['order/form'], { queryParams: { fromPage: 'restaurant-detail' } });
  }
}
