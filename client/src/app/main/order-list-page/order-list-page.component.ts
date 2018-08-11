import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../account/account.service';
import { OrderService } from '../../order/order.service';
import { SharedService } from '../../shared/shared.service';

@Component({
    selector: 'app-order-list-page',
    templateUrl: './order-list-page.component.html',
    styleUrls: ['./order-list-page.component.scss']
})
export class OrderListPageComponent implements OnInit {
    subscrAccount;
    account;
    orders = [];
    recentOrders = [];

    constructor(
        private accountSvc: AccountService,
        private orderSvc: OrderService,
        private sharedSvc: SharedService
    ) { }

    ngOnInit() {
        const self = this;
        this.subscrAccount = this.accountSvc.getCurrent().subscribe(account => {

            self.account = account;
            self.orderSvc.find({ where: { accountId: self.account.id },
                include: ['account', 'items', 'restaurant'] }).subscribe(r => {
                self.orders = r;
            });
            // this.subscrList.push(self.restaurantSvc.getOrders(restaurant_id, {include: ['account', {items: {product: 'pictures'}}]})
            // .subscribe((orders: Order[]) => {
            //     self.orders = orders;
            // }));

            // this.subscrList.push(self.restaurantSvc
            // .syncOrders(restaurant_id, {include: ['account', {items: {product: 'pictures'}}]})
            // .subscribe((od: Order) => {
            //     self.orders.push(od);
            // }));

        });
    }

    getTotal(order) {
        return this.sharedSvc.getTotal(order.items);
    }

    toDateTimeString(s) {
        return this.sharedSvc.toDateTimeString(s);
    }

}
