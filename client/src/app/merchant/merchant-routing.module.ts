import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MerchantDetailPageComponent } from './merchant-detail-page/merchant-detail-page.component';


const routes: Routes = [
  { path: 'list/:id/:onSchedule', component: MerchantDetailPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantRoutingModule { }
