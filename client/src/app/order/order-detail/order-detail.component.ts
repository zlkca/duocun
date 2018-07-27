import { Component, OnInit, Input } from '@angular/core';
import { OrderService } from '../order.service';
import { Order } from '../../shared/lb-sdk';

@Component({
    selector: 'app-order-detail',
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
    order: Order;
    items: any[];
    total = 0;
    subTotal = 0;
    tax = 0;
    delivery = 0;

    @Input() orderId: number;

    constructor(
        private orderServ: OrderService,
    ) { }

    ngOnInit() {
        this.orderServ.findById(this.orderId, { include: { items: 'product' } })
            .subscribe((data: Order) => {
                this.order = data;
                this.items = this.order.items;
                this.items.map(x => {
                    this.subTotal += x.price * x.quantity;
                });
                this.delivery = 0;
                this.tax = (this.subTotal + this.delivery) * 0.13;
                this.total = this.subTotal + this.tax;
            });
    }
}
