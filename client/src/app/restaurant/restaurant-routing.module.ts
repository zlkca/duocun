import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RestaurantListPageComponent } from './restaurant-list-page/restaurant-list-page.component';
import { RestaurantDetailPageComponent } from './restaurant-detail-page/restaurant-detail-page.component';

const routes: Routes = [
  { path: 'restaurants/:id', component: RestaurantDetailPageComponent },
  { path: 'restaurants', component: RestaurantListPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantRoutingModule { }
