import { Component, OnInit, Input } from '@angular/core';
import { CommerceService } from '../../commerce/commerce.service';

@Component({
    selector: 'app-admin-order-list',
    templateUrl: './admin-order-list.component.html',
    styleUrls: ['./admin-order-list.component.scss']
})
export class AdminOrderListComponent implements OnInit {
    @Input() orders;

    constructor(private commerceServ: CommerceService) { }

    ngOnInit() {

    }

    toDateTimeString(s) {
        // s --- dd-mm-yyy:hh:mm:ss.z000
        return s.split('.')[0].replace('T', ' ');
    }
    getTotal(order) {
        let total = 0;
        for (const item of order.items) {
            total += item.product.price * item.quantity;
        }
        return total.toFixed(2);
    }

}

