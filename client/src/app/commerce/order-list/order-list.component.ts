import { Component, OnInit, Input } from '@angular/core';
import { CommerceService } from '../commerce.service';

@Component({
  selector: 'order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
	@Input() orders;

  constructor(private commerceServ:CommerceService) { }

  ngOnInit() {

  }

  getTotal(order){
    let total = 0;
    for(let item of order.items){
      total += parseFloat(item.price) * parseInt(item.quantity);
    }
    return total.toFixed(2);
  }

}
