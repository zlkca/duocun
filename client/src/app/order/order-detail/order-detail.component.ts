import { Component, OnInit, Input } from '@angular/core';
import { OrderService } from '../order.service';
import { Order, Restaurant } from '../../shared/lb-sdk';

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

    // @Input() orderId: number;
    @Input() cart: any;

    constructor(
        private orderServ: OrderService
    ) { }

    ngOnInit() {
        this.items = Object.values(this.cart);
        this.items = this.items[0];

        this.items.map(item => {
            this.subTotal += item.price * item.quantity;
        });

        this.orderServ.findRestaurant(this.items[0].restaurant_id, { include: 'products' })
            .subscribe((r: Restaurant) => {
                this.delivery = r.delivery_fee;
                this.tax = (this.subTotal + this.delivery) * 0.13;
                this.total = this.subTotal + this.delivery + this.tax;
            });
    }
}
