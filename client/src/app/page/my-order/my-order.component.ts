import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { ICart, CartActions, ICartItem } from '../../order/order.actions';
import { AccountService } from '../../account/account.service';
import { Router } from '@angular/router';
import { ToastrService } from '../../../../node_modules/ngx-toastr';

@Component({
  selector: 'app-my-order',
  templateUrl: './my-order.component.html',
  styleUrls: ['./my-order.component.scss']
})
export class MyOrderComponent implements OnInit, OnDestroy {
  subscription;
  subscrAccount;
  account;
  cart;

  constructor(
    private router: Router,
    private rx: NgRedux<IAppState>,
    private accountSvc: AccountService,
    private toastSvc: ToastrService
  ) { }

  ngOnInit() {
    const self = this;
    this.subscrAccount = this.accountSvc.getCurrent().subscribe(account => {
      self.account = account;
    });

    this.subscription = this.rx.select<ICart>('cart').subscribe(
      cart => {
        // this.total = 0;
        // this.quantity = 0;
        this.cart = cart;
        // this.cart.items.map(x => {
        //     this.total += x.price * x.quantity;
        //     this.quantity += x.quantity;
        // });
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    // this.subscriptionAccount.unsubscribe();
  }

  onAfterCheckout(e) {
    this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: {} });
    this.toastSvc.success('Save Restaurant Successfully!', '', { timeOut: 2000, positionClass: 'toast-bottom-right' });
    this.router.navigate(['restaurants']);
  }
}
