import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartRoutingModule } from './cart-routing.module';
import { CartPageComponent } from './cart-page/cart-page.component';
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
    CartPageComponent
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
