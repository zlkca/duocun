import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { HomeComponent } from './home/home.component';
import { LocationModule } from '../location/location.module';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AccountModule } from '../account/account.module';
import { AccountService } from '../account/account.service';
import { AuthService } from '../account/auth.service';

@NgModule({
  imports: [
    CommonModule,
    MainRoutingModule,
    SharedModule,
    LocationModule,
    AccountModule
  ],
  declarations: [
    HomeComponent,
    HeaderComponent,
    FooterComponent
  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ],
  providers: [
    AccountService,
    AuthService
  ]
})
export class MainModule { }
