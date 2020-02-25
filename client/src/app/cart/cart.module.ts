import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartRoutingModule } from './cart-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AccountService } from '../account/account.service';
// import { CartNavbarComponent } from './cart-navbar/cart-navbar.component';
import { CartService } from './cart.service';

@NgModule({
  imports: [
    CommonModule,
    CartRoutingModule,
    SharedModule
  ],
  declarations: [
    // CartNavbarComponent,
  ],
  exports: [
    // CartNavbarComponent
  ],
  providers: [
    AccountService,
    CartService
  ]
})
export class CartModule { }
