import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '../../../../node_modules/@angular/forms';
import { PaymentService } from '../../payment/payment.service';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { IAccount } from '../account.model';
import { AccountService } from '../account.service';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-add-credit-page',
  templateUrl: './add-credit-page.component.html',
  styleUrls: ['./add-credit-page.component.scss']
})
export class AddCreditPageComponent implements OnInit {
  form;
  paymentMethod;
  stripe;
  card;
  bSubmitted = false;
  account;
  loading = false;
  private onDestroy$ = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private accountSvc: AccountService,
    private paymentSvc: PaymentService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      received: ['', Validators.required],
      note: ['', Validators.required]
    });
  }

  get received() { return this.form.get('received'); }
  get note() { return this.form.get('note'); }


  ngOnInit() {
    this.accountSvc.getCurrentUser().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      this.account = account;
      this.paymentMethod = 'WECHATPAY';
    });
  }

  onCancel(): void {
    this.router.navigate(['account/settings']);
  }

  onPay() {
    const self = this;
    const account = this.account;
    const received = this.received.value;
    const paymentMethod = this.paymentMethod;
    const note = this.note.value.trim();

    if (received === '') {
      return;
    } else {
      if (paymentMethod === 'card') {
        this.loading = true;
        this.paymentSvc.vaildateCardPay(this.stripe, this.card, 'card-errors1').then((ret: any) => {
          if (ret.status === 'failed') {
            self.loading = false;
            self.bSubmitted = false;
            alert('输入信息有错误，请核对');
          } else {
            self.paymentSvc.stripeAddCredit(ret.token, account, +received, note).pipe(takeUntil(this.onDestroy$)).subscribe((x) => {
              self.loading = false;
              self.snackBar.open('', '已成功充值 $' + Math.round(+received * 100) / 100, { duration: 1000 });
              self.router.navigate(['account/balance']);
            });
            // self.handleCardPayment(account, ret.token, order, cart);
          }
        });
      } else if (paymentMethod === 'WECHATPAY') {
        const paid = Math.round(+received * 100) / 100;
        this.loading = true;
        this.paymentSvc.snappayAddCredit(account, paid, paymentMethod, note).pipe(takeUntil(this.onDestroy$)).subscribe((r) => {
          // this.snackBar.open('', '已成功充值 $' + Math.round(+received * 100) / 100, { duration: 1000 });
          self.bSubmitted = false;
          self.loading = false;
          if (r.msg === 'success') {
            this.loading = true;
            window.location.href = r.data[0].h5pay_url;
          } else {
            self.snackBar.open('', '付款未成功', { duration: 1800 });
            alert('付款未成功，请联系客服');
          }
        });
      }
    }
  }

  onSelectPaymentMethod(e) {
    const self = this;
    this.paymentMethod = e.value;

    if (e.value === 'card') {
      setTimeout(() => {
        const rt = self.paymentSvc.initStripe('card-element1', 'card-errors1');
        self.stripe = rt.stripe;
        self.card = rt.card;
      }, 500);
    } else {
      // pass
    }
  }
}
