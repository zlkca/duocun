import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactListPageComponent } from './contact-list-page/contact-list-page.component';

const routes: Routes = [{
  path: 'list', component: ContactListPageComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactRoutingModule { }
