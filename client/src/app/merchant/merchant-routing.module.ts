import { MerchantDetailPageComponent } from './merchant-detail-page/merchant-detail-page.component';
import { Routes, RouterModule } from '../../../node_modules/@angular/router';
import { NgModule } from '../../../node_modules/@angular/core';


const routes: Routes = [
  {
    path: 'list/:id/:onSchedule', //  onSchedule: 'undefined' means no address
    component: MerchantDetailPageComponent,
    // canDeactivate: [NavGuardService]
 }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantRoutingModule { }
