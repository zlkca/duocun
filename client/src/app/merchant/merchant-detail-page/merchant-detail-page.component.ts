import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '../../../../node_modules/@angular/router';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { MerchantService } from '../merchant.service';
import { IMerchant } from '../../merchant/merchant.model';
import { ProductService } from '../../product/product.service';
import { ProductStatus } from '../../product/product.model';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { ICart, ICartItem } from '../../cart/cart.model';
import { PageActions } from '../../main/main.actions';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { QuitRestaurantDialogComponent } from '../quit-restaurant-dialog/quit-restaurant-dialog.component';
import { IDelivery } from '../../delivery/delivery.model';
import { environment } from '../../../environments/environment';
import { CartActions } from '../../cart/cart.actions';


@Component({
  selector: 'app-merchant-detail-page',
  templateUrl: './merchant-detail-page.component.html',
  styleUrls: ['./merchant-detail-page.component.scss']
})
export class MerchantDetailPageComponent implements OnInit, OnDestroy {
  categories: any[];
  category;
  groups: any[]; // [ {categoryId: x, categoryName: x, items: [{product: p, quantity: q} ...]} ... ]
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
  dialogRef;
  action = '';
  currentUrl;

  @ViewChild('list', { static: true }) list: ElementRef;

  constructor(
    private productSvc: ProductService,
    private merchantSvc: MerchantService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private rx: NgRedux<ICart>,
    public dialog: MatDialog
  ) {
    const self = this;

    // show cart on footer
    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: { name: 'restaurant-detail' } });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((x: IDelivery) => {
      self.delivery = x;
      self.bHasAddress = x.origin ? true : false;
    });

    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.cart = cart;
      // update quantity of cart items
      if (self.groups && self.groups.length > 0) {
        self.groups = this.mergeQuantityFromCart(self.groups, cart);
      }
    });

    this.locationSubscription = this.location.subscribe((x) => {
      const merchantId = self.restaurant._id;

      if (window.location.pathname.endsWith('main/home') || window.location.pathname.endsWith('/') ||
        window.location.pathname.endsWith('contact/address-form')
      ) {
        if (self.restaurant && self.cart && self.cart.items && self.cart.items.length > 0) {
          self.openDialog(merchantId, 'restaurant-list');
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
        this.onSchedule = true; // fix me!!!
      } else {
        this.onSchedule = params['onSchedule'] === 'true' ? true : false;
      }
      const origin = this.delivery.origin; // can be null
      const dateType = this.delivery.dateType; // must have

      self.merchantSvc.load(origin, dateType, { _id: merchantId }).pipe(takeUntil(this.onDestroy$)).subscribe((ms: IMerchant[]) => {
        const merchant = ms.find(m => m._id === merchantId);

        if (merchant && this.lang === 'en') {
          merchant.name = merchant.nameEN;
        }

        const q = { merchantId: merchantId, status: { $in: [ProductStatus.ACTIVE, ProductStatus.NEW, ProductStatus.PROMOTE] } };

        self.productSvc.categorize(q, this.lang).pipe(takeUntil(self.onDestroy$)).subscribe((groups: any[]) => {
          self.restaurant = merchant;
          self.groups = this.mergeQuantityFromCart(groups, this.cart);
          const categories: any[] = [];
          self.groups.map(grp => {
            categories.push({
              _id: grp.categoryId,
              name: grp.categoryName
            });
          });
          self.categories = categories;
          self.category = categories[0];
        });
      });
    });
  }

  mergeQuantityFromCart(groups, cart) {
    groups.map(group => {
      group.items.map(groupItem => {
        const cartItem: ICartItem = cart.items.find(item => item.productId === groupItem.product._id);
        groupItem.quantity = cartItem ? cartItem.quantity : 0;
      });
    });
    return groups;
  }

  ngOnDestroy() {
    this.locationSubscription.unsubscribe();
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  openDialog(merchantId: string, fromPage: string, target?: string): void {
    const self = this;
    this.dialogRef = this.dialog.open(QuitRestaurantDialogComponent, {
      width: '300px',
      data: {
        merchantId: merchantId, fromPage: fromPage, onSchedule: this.onSchedule, targetUrl: target
      },
      closeOnNavigation: true
    });

    this.dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
      this.action = r.action;
      if (r.action === 'leave') {
        // pass
      } else if (r.action === 'stay') {
        // pass
      }
    });
  }

  onAfterCheckout(e) {

  }

  onCategorySelect(e) {
    this.category = e;
    this.list.nativeElement.querySelector('#cat' + e._id).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onAddProduct(e) {
    this.rx.dispatch({
      type: CartActions.ADD_TO_CART,
      payload: e
    });
  }

  onRemoveProduct(e) {
    this.rx.dispatch({
      type: CartActions.REMOVE_FROM_CART,
      payload: e
    });
  }

  onNext(e) {
    this.router.navigate(['order/form'], { queryParams: { fromPage: 'restaurant-detail' } });
  }
}
