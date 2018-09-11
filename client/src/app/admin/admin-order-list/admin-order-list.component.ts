import { Component, OnInit, Input } from '@angular/core';
import { SharedService } from '../../shared/shared.service';
import { OrderService } from '../../order/order.service';
import { Router } from '@angular/router';
import { Order } from '../../shared/lb-sdk';

@Component({
    selector: 'app-admin-order-list',
    templateUrl: './admin-order-list.component.html',
    styleUrls: ['./admin-order-list.component.scss']
})
export class AdminOrderListComponent implements OnInit {
    @Input() orders;

    constructor(private sharedSvc: SharedService, private orderSvc: OrderService, private router: Router, ) { }

    ngOnInit() {

    }

    getTotal(order) {
        return this.sharedSvc.getTotal(order.items);
    }

    toDateTimeString(s) {
        return this.sharedSvc.toDateTimeString(s);
    }

    toDeliver(order) {
        return this.orderSvc.delivery(order).subscribe((newOrder: Order) => {
            window.location.reload();
        });
    }

    toCancel(order) {
        return this.orderSvc.cancel(order).subscribe((newOrder: Order) => {
            window.location.reload();
        });
    }
}

