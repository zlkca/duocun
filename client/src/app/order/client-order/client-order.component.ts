import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { ICart, CartActions, ICartItem } from '../../order/order.actions';
import { AccountService } from '../../account/account.service';
import { Router } from '@angular/router';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { PageActions } from '../../main/main.actions';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';

@Component({
  selector: 'app-client-order',
  templateUrl: './client-order.component.html',
  styleUrls: ['./client-order.component.scss']
})
export class ClientOrderComponent implements OnInit, OnDestroy {
  subscriptionAccount;
  account;
  cart;
  private onDestroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private rx: NgRedux<IAppState>,
    private accountSvc: AccountService,
    private toastSvc: ToastrService
  ) { }

  ngOnInit() {
    const self = this;
    this.subscriptionAccount = this.accountSvc.getCurrent().subscribe(account => {
      self.account = account;
    });

    this.rx.select<ICart>('cart').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(
      cart => {
        // this.total = 0;
        // this.quantity = 0;
        this.cart = cart;
        // this.cart.items.map(x => {
        //     this.total += x.price * x.quantity;
        //     this.quantity += x.quantity;
        // });
      });

      this.rx.dispatch({
        type: PageActions.UPDATE_URL,
        payload: 'orders'
      });

  }

  ngOnDestroy() {
    this.subscriptionAccount.unsubscribe();
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onAfterCheckout(e) {
    this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: {} });
    this.toastSvc.success('Save Restaurant Successfully!', '', { timeOut: 2000, positionClass: 'toast-bottom-right' });
    this.router.navigate(['home']);
  }
}
