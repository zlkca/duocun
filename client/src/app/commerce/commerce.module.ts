import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ProductFilterComponent } from './product-filter/product-filter.component';

import { SharedService } from '../shared/shared.service';

import { HttpClientModule, HttpClient } from '@angular/common/http';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// export function HttpLoaderFactory(http: HttpClient) {
//     return new TranslateHttpLoader(http, '../../assets/i18n/', '.json');
// }

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './commerce.service';

import { MultiUserFormComponent } from './multi-user-form/multi-user-form.component';
import { MultiProductFormComponent } from './multi-product-form/multi-product-form.component';
import { MultiRestaurantFormComponent } from './multi-restaurant-form/multi-restaurant-form.component';

import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        HttpClientModule,
        //   TranslateModule.forRoot({
        //     loader: {
        //         provide: TranslateLoader,
        //         useFactory: HttpLoaderFactory,
        //         deps: [HttpClient]
        //     }
        // }),
        SharedModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [SharedService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }],
    exports: [
        ProductFilterComponent,
        MultiUserFormComponent, MultiProductFormComponent, MultiRestaurantFormComponent],
    declarations: [
        ProductFilterComponent,
        MultiUserFormComponent, MultiProductFormComponent, MultiRestaurantFormComponent]
})
export class CommerceModule { }
