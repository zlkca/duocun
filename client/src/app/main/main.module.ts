import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../shared/shared.module';
import { AccountModule } from '../account/account.module';
import { OrderModule } from '../order/order.module';
import { environment } from '../../environments/environment';

import { ContactComponent } from './contact/contact.component';
import { LayoutComponent } from './layout/layout.component';

import { AccountService } from '../account/account.service';

import { ProductComponent } from './product/product.component';
import { BlogComponent } from './blog/blog.component';
import { CommentComponent } from './comment/comment.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgbModule,
        SharedModule,
        AccountModule,
        OrderModule
    ],
    declarations: [
        ContactComponent,
        LayoutComponent,
        ProductComponent,
        BlogComponent,
        CommentComponent
    ],
    providers: [AccountService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        ContactComponent]
})
export class MainModule { }
