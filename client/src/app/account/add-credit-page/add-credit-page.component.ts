import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '../../../../node_modules/@angular/forms';
import { PaymentService } from '../../payment/payment.service';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { IAccount } from '../account.model';
import { AccountService } from '../account.service';
import { Router } from '../../../../node_modules/@angular/router';
import { environment } from '../../../environments/environment.prod';
import { ResponseStatus, IPaymentResponse } from '../../transaction/transaction.model';
import { PaymentError, PaymentMethod } from '../../payment/payment.model';

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
  lang = environment.language;

  PaymentMethod = PaymentMethod;

  private destroy$ = new Subject<any>();

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
    const self = this;
    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.destroy$)).subscribe((account: IAccount) => {
      this.account = account;
      this.paymentMethod = this.lang === 'en' ? PaymentMethod.CREDIT_CARD : PaymentMethod.WECHAT;

      if (this.lang === 'en') {
        setTimeout(() => {
          const rt = self.paymentSvc.initStripe('card-element1', 'card-errors1');
          self.stripe = rt.stripe;
          self.card = rt.card;
        }, 500);
      }
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
    const payAlert = this.lang === 'en' ? 'Unsuccessful payment, please contact our customer service.' : '付款未成功，请联系客服';
    const inputAlert = this.lang === 'en' ? 'Something wrong entered, please try again' : '输入信息有错误，请核对';
    const creditHint = this.lang === 'en' ? 'Added credit $' : '已成功充值 $';
    if (received === '') {
      return;
    } else {
      if (paymentMethod === PaymentMethod.CREDIT_CARD) {
        this.loading = true;
        this.paymentSvc.vaildateCardPay(this.stripe, this.card, 'card-errors1').then((ret: any) => {
          if (ret.err === PaymentError.NONE) {
            const token = ret.token;
            self.paymentSvc.stripeAddCredit(token, account, +received, note)
              .pipe(takeUntil(this.destroy$)).subscribe((rsp: IPaymentResponse) => {
              self.loading = false;
              if (rsp.status === ResponseStatus.SUCCESS) {
                self.snackBar.open('', creditHint + Math.round(+received * 100) / 100, { duration: 1000 });
                self.router.navigate(['account/balance']);
              } else {
                self.snackBar.open('', payAlert, { duration: 2000 });
              }
            });
          } else {
            self.loading = false;
            self.bSubmitted = false;
            alert(inputAlert);
          }
        });
      } else if (paymentMethod === PaymentMethod.WECHAT) {
        const paid = Math.round(+received * 100) / 100;
        this.loading = true;
        this.paymentSvc.snappayAddCredit(account, paid, paymentMethod, note)
          .pipe(takeUntil(this.destroy$)).subscribe((rsp: IPaymentResponse) => {
          self.bSubmitted = false;
          self.loading = false;
          if (rsp.status === ResponseStatus.SUCCESS) {
            this.loading = true;
            window.location.href = rsp.url;
          } else {
            self.snackBar.open('', payAlert, { duration: 2000 });
          }
        });
      }
    }
  }

  onSelectPaymentMethod(e) {
    const self = this;
    this.paymentMethod = e.value;

    if (e.value === PaymentMethod.CREDIT_CARD) {
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
