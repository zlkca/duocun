import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OrderService } from '../order.service';
import { Order } from '../../shared/lb-sdk';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  @Input() orders: Order[];
  @Input() restaurant;
  @Output() select = new EventEmitter();
  @Output() afterDelete = new EventEmitter();

  constructor(private sharedSvc: SharedService,
    private orderSvc: OrderService) { }

  ngOnInit() {
    const self = this;
    const order = new Order();

  }

  onSelect(c) {
    this.select.emit({ order: c });
  }

  delete(c) {
    this.orderSvc.rmOrder(c.id).subscribe(x => {
      this.afterDelete.emit({ order: c });
    });
  }

  getTotal(order) {
    return this.sharedSvc.getTotal(order.items);
  }

  toDateTimeString(s) {
    return this.sharedSvc.toDateTimeString(s);
  }

  toDeliver(order){
    // this.orderSvc.update
  }
}
