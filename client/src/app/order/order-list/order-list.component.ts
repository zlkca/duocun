import { Component, OnInit, Input } from '@angular/core';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

    @Input() orders;

    constructor(private sharedSvc: SharedService) { }

    ngOnInit() {

    }

    getTotal(order) {
        return this.sharedSvc.getTotal(order.items);
    }

    toDateTimeString(s) {
        return this.sharedSvc.toDateTimeString(s);
    }

}
