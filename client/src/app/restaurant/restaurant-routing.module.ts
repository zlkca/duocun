import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RestaurantListPageComponent } from './restaurant-list-page/restaurant-list-page.component';
import { RestaurantDetailPageComponent } from './restaurant-detail-page/restaurant-detail-page.component';

const routes: Routes = [
  { path: 'list/:id', component: RestaurantDetailPageComponent },
  { path: 'list', component: RestaurantListPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantRoutingModule { }
