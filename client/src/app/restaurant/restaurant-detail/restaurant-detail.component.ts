
import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';


import { ProductService } from '../../product/product.service';
import { Product } from '../../commerce/commerce';
import { SharedService } from '../../shared/shared.service';
import { AuthService } from '../../account/auth.service';
import { environment } from '../../../environments/environment';
import { RestaurantService } from '../restaurant.service';
import { Restaurant } from '../../shared/lb-sdk';


@Component({
    selector: 'app-restaurant-detail',
    templateUrl: './restaurant-detail.component.html',
    providers: [AuthService, ProductService],
    styleUrls: ['./restaurant-detail.component.scss']
})
export class RestaurantDetailComponent implements OnInit {

    productList: any = [];
    restaurant_id: string;
    subscription;
    cart;

    constructor(private productSvc: ProductService,
        private restaurantServ: RestaurantService,
        private router: Router,
        private route: ActivatedRoute,
        // private ngRedux:NgRedux<IAppState>,
        // private actions: CartActions
    ) {

        // this.subscription = ngRedux.select<ICartItem[]>('cart').subscribe(
        //   cart=> this.cart = cart);

        // let self = this;
    }

    ngOnInit() {
        const self = this;
        self.route.paramMap.pipe(switchMap((params: ParamMap) =>
            // self.restaurant_id = params.get('id')
            self.restaurantServ.findById(parseInt(params.get('id'), 10))))
            .subscribe(
                (restaurant: Restaurant) => {
                    self.productList = restaurant.products;
                },
                (err: any) => {
                    self.productList = [];
                }
            );
    }

}



// export class HomeComponent implements OnInit {
//     keyword:string;
//     query:any;
//     filter:any;
//     restaurantList:Restaurant[];

//     ngOnInit() {
//         let self = this;
//         this.commerceServ.getRestaurantList().subscribe(
//             (r:Restaurant[]) => {
//                 self.productList = r;
//             },
//             (err:any) => {
//                 self.productList = [];
//             });
//     }

//     constructor(private commerceServ:CommerceService, private sharedServ:SharedService) {
//         let self = this;
//         this.sharedServ.getMsg().subscribe(msg => {
//             if('OnSearch' === msg.name){
//                 if(msg.query){
//                   self.filter = msg.query;
//                   let query = {...self.filter, ...self.query};
//                   self.doSearch(query);
//                 }else{
//                     self.doSearch(self.query.keyword);
//                 }
//             }
//         });
//     }

//     search(keyword:string){
//       let self = this;
//       this.query = {'keyword': keyword};
//       let query = {...self.filter, ...self.query};
//       self.doSearch(query);
//     }
//     // constructor(private authServ:AuthService, private router:Router, private msgServ:MsgService, private productServ:ProductService) {
//     //     let self = this;
//     //     // Event handler
//     //     this.msgServ.getMsg().subscribe(msg => {
//     //         if('OnSearch' === msg.name){
//     //             self.user = authServ.getUserStorage();
//     //             if(msg.query){
//     //                 self.doSearch(msg.query);
//     //             }else{
//     //                 self.doSearch('');
//     //             }
//     //         }
//     //     });
//     // }

//     // search(keyword:string){
//     //   this.query = {keyword:keyword};
//     //   this.msgServ.emit({name:'OnClearFilter'});
//     // }

//     getFilter(query?:any){
//       let qs = [];

//       if(query.categories && query.categories.length>0){
//         let s = query.categories.join(',');
//         qs.push('cats=' + s);
//       }

//       if(query.restaurants && query.restaurants.length>0){
//         let s = query.restaurants.join(',');
//         qs.push('ms=' + s);
//       }

//       if(query.colors && query.colors.length>0){
//         let s = query.colors.join(',');
//         qs.push('colors=' + s);
//       }
//       return qs;
//     }

//     doSearch(query?:any){
//         //query --- eg. {'status':'active','user_id':self.user_id}
//         let self = this;
//         let qs = self.getFilter(query);

//         if(qs.length>0){
//           query = '?' + qs.join('&');
//           if(this.query && this.query.keyword){
//             query += '&keyword=' + this.query.keyword;
//           }
//         }else{
//           if(this.query && this.query.keyword){
//             query = '?keyword=' + this.query.keyword;
//           }else{
//             query = null;
//           }
//         }

//         self.commerceServ.getRestaurantList(query).subscribe(
//             (ps:Restaurant[]) => {
//                 self.productList = ps;//self.toProductGrid(data);
//             },
//             (err:any) => {
//                 self.productList = [];
//             }
//         );
//       }
// }
