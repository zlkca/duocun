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

    @Input() orderId: number;

    constructor(
        private orderServ: OrderService,
    ) { }

    ngOnInit() {
        this.orderServ.findById(this.orderId, {include: {items: 'product'}})
            .subscribe((data: Order) => {
                this.order = data;
            });
    }
}
