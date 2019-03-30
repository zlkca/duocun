import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminProductFormPageComponent } from './admin-product-form-page/admin-product-form-page.component';
import { AdminProductPageComponent } from './admin-product-page/admin-product-page.component';
import { AdminAccountPageComponent } from './admin-account-page/admin-account-page.component';

const routes: Routes = [
  { path: '', component: AdminComponent },
  // { path: 'admin/restaurant/:id', component: AdminRestaurantFormPageComponent },
  // { path: 'admin/restaurant', component: AdminRestaurantFormPageComponent },
  { path: 'products/:id', component: AdminProductFormPageComponent },
  { path: 'product', component: AdminProductFormPageComponent },
  { path: 'products', component: AdminProductPageComponent },
  { path: 'user', component: AdminAccountPageComponent },
  { path: 'users/:id', component: AdminAccountPageComponent },
  { path: 'orders', component: AdminComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
