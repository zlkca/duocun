import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PhoneFormPageComponent } from './phone-form-page/phone-form-page.component';
import { AddressFormPageComponent } from './address-form-page/address-form-page.component';
// import { ContactPageComponent } from './contact-page/contact-page.component';

const routes: Routes = [
  // { path: 'main', component: ContactPageComponent },
  { path: 'phone-form', component: PhoneFormPageComponent },
  { path: 'address-form', component: AddressFormPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactRoutingModule { }
