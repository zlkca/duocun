import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OrderService } from '../order.service';
import { Order } from '../../lb-sdk';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  @Input() orders: Order[];
  @Input() restaurant;
  @Input() account;
  @Output() select = new EventEmitter();
  @Output() afterDelete = new EventEmitter();
  @Output() afterSave = new EventEmitter();

  constructor(
    private sharedSvc: SharedService,
    private orderSvc: OrderService) { }

  ngOnInit() {
    const self = this;
  }

  onSelect(c) {
    this.select.emit({ order: c });
  }

  delete(order) {
    this.orderSvc.deleteById(order.id).subscribe(x => {
      this.afterDelete.emit({ order: order });
    });
  }

  getTotal(order) {
    return this.sharedSvc.getTotal(order.items);
  }

  toDateTimeString(s) {
    return this.sharedSvc.toDateTimeString(s);
  }

  deliver(order) {
    const self = this;
    order.status = 'delivered';
    this.orderSvc.replaceById(order.id, order).subscribe(x => {
      self.afterSave.emit({name: 'OnUpdateOrder'});
    });
  }
}
