import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '../../../../node_modules/@angular/router';
import { TransactionService } from '../../transaction/transaction.service';
import { OrderService } from '../../order/order.service';
import { ITransaction } from '../../transaction/transaction.model';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { environment } from '../../../environments/environment';
import { ICartItem, ICart } from '../../cart/cart.model';
import { IOrder } from '../../order/order.model';
import { AccountService } from '../../account/account.service';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { CartActions } from '../../cart/cart.actions';
import { AccountActions } from '../../account/account.actions';
import { PaymentService } from '../payment.service';
import { OrderActions } from '../../order/order.actions';
import { SharedService } from '../../shared/shared.service';
import { CommandActions } from '../../shared/command.actions';
import * as moment from 'moment';

const DEFAULT_ADMIN = environment.DEFAULT_ADMIN;

@Component({
  selector: 'app-pay-complete',
  templateUrl: './pay-complete.component.html',
  styleUrls: ['./pay-complete.component.scss']
})
export class PayCompleteComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<any>();
  cart;

  constructor(
    private route: ActivatedRoute,
    private accountSvc: AccountService,
    private transactionSvc: TransactionService,
    private orderSvc: OrderService,
    private paymentSvc: PaymentService,
    private sharedSvc: SharedService,
    private router: Router,
    private rx: NgRedux<IAppState>,
    private snackBar: MatSnackBar
  ) {
    const self = this;
    this.route.queryParams.subscribe(params => {
      const p = params;
      // {msg: 'success', orderId: '5db1a1d3467deb1b72cb053f', paid: 10, paymentMethod: 'WECHATPAY/ALIPAY'};
      if (p && p.msg === 'success') {
        const orderId = p.orderId.trim();
        const paid = +p.paid;

        self.snackBar.open('', '已成功付款', { duration: 1800 });

        if (orderId) {
          this.orderSvc.quickFind({ _id: orderId }).pipe(takeUntil(self.onDestroy$)).subscribe(orders => {
            const order = orders[0];
            // require access token! what if bank response is too long ? fix me
            this.afterSnappay(order, paid, '');
          });
        } else {
          alert('付款未成功，请联系客服');
        }
      } else if (p && p.msg !== 'success') {
        const orderId = p.orderId.trim();
        self.snackBar.open('', '付款未成功', { duration: 1800 });
        self.orderSvc.afterRemoveOrder(orderId).subscribe(() => {
          self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'reload-orders', args: null } }); // refresh order history
          self.snackBar.open('', '余额已处理', { duration: 1000 });
          alert('付款未成功，请联系客服');
        });
      }
    });

    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.cart = cart;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  afterSnappay(order: IOrder, paid: number, chargeId: string) {
    const self = this;
    const clientId = order.clientId;
    const merchantId = order.merchantId;
    const action = 'pay by wechat';

    this.accountSvc.find({_id: clientId}).pipe(takeUntil(this.onDestroy$)).subscribe((accounts) => {
      this.rx.dispatch({ type: AccountActions.UPDATE, payload: accounts[0] });

      this.orderSvc.processPayment(order, action, paid, chargeId).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
        self.snackBar.open('', '您已经成功下单。', { duration: 2000 });

        const dt = moment(order.delivered); // fix me
        const dateType = this.sharedSvc.getDateType(dt);
        const address = order.address;

        // update and group discount
        self.orderSvc.afterAddOrder(clientId, merchantId, dateType, address, paid).pipe(takeUntil(self.onDestroy$)).subscribe((r1: any) => {
          self.snackBar.open('', '余额已更新', { duration: 1800 });
          const items: ICartItem[] = self.cart.items.filter(x => x.merchantId === merchantId);
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
          self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
          self.router.navigate(['order/history']);
        });
      }, err => {
        self.snackBar.open('', '您的订单未更改成功，请重新更改。', { duration: 1800 });
      });
    });
  }
}
