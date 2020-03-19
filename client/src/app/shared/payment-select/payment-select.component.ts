import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PaymentMethod } from '../../payment/payment.model';

@Component({
  selector: 'app-payment-select',
  templateUrl: './payment-select.component.html',
  styleUrls: ['./payment-select.component.scss']
})
export class PaymentSelectComponent implements OnInit {

  @Output() select = new EventEmitter();
  @Input() selected: string;

  lang = environment.language;
  PaymentMethod = PaymentMethod;
  constructor() {

  }

  ngOnInit() {

  }

  onSelect(paymentMethod) {
    this.select.emit(paymentMethod);
  }

  getIconColor(paymentMethod) {
    if (paymentMethod === PaymentMethod.CASH) {
      return 'orange';
    } else if (paymentMethod === PaymentMethod.WECHAT) {
      return 'green';
    } else {
      return 'orange';
    }
  }
}
