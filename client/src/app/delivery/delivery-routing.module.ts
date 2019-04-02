import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeliveryListPageComponent } from './delivery-list-page/delivery-list-page.component';
import { DeliveryFormPageComponent } from './delivery-form-page/delivery-form-page.component';

const routes: Routes = [{
  path: 'list', component: DeliveryListPageComponent
},
{
  path: 'form', component: DeliveryFormPageComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryRoutingModule { }
