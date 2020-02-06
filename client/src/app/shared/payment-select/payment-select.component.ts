import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment-select',
  templateUrl: './payment-select.component.html',
  styleUrls: ['./payment-select.component.scss']
})
export class PaymentSelectComponent implements OnInit {

  @Output() select = new EventEmitter();
  @Input() selected: string;

  lang = environment.language;

  constructor() {

  }

  ngOnInit() {

  }

  onSelect(paymentMethod) {
    this.select.emit(paymentMethod);
  }

  getIconColor(paymentMethod) {
    if (paymentMethod === 'cash') {
      return 'orange';
    } else if (paymentMethod === 'WECHATPAY') {
      return 'green';
    } else {
      return 'orange';
    }
  }
}
