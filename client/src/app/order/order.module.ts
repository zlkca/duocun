import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderListComponent } from './order-list/order-list.component';

import { CartComponent } from './cart/cart.component';
import { FormsModule } from '@angular/forms';
import { OrderService } from './order.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    exports: [
        OrderDetailComponent,
        OrderListComponent,
        CartComponent
    ],
    providers: [
        OrderService,
    ],
    declarations: [
        OrderDetailComponent,
        OrderListComponent,
        CartComponent,
    ]
})
export class OrderModule { }
