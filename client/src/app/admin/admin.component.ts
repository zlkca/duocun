import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../account/auth.service';
import { AccountService } from '../account/account.service';
import { SharedService } from '../shared/shared.service';
import { ProductService } from '../product/product.service';

import { RestaurantService } from '../restaurant/restaurant.service';
import { Restaurant, Product, Order, Category } from '../shared/lb-sdk';
import { OrderService } from '../order/order.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

    isAdminLogin = true;
    subscrAccount;
    subscrList: any = [];
    account;

    // for business center
    orders: Order[] = [];
    restaurant: Restaurant = null;
    products: Product[] = [];

    // for super admin
    businessUsers: Account[] = [];
    restaurants: Restaurant[] = [];
    categories: Category[] = [];

    constructor(private router: Router,
        private accountSvc: AccountService,
        private restaurantSvc: RestaurantService,
        ) { }

    ngOnInit() {
        const self = this;
        this.subscrAccount = this.accountSvc.getCurrent().subscribe(account => {

            self.account = account;

            if (account.type === 'business') {
                const restaurant_id = account.restaurants[0] ? account.restaurants[0].id : null;

                if (restaurant_id) {
                    this.unsubscribe();
                    this.subscrList.push(self.restaurantSvc.findById(restaurant_id)
                    .subscribe((rest: Restaurant) => {
                        self.restaurant = rest;
                        self.products = rest.products;
                    }));

                    // this.subscrList.push(self.restaurantSvc.getOrders(restaurant_id, {include: ['account', {items: {product: 'pictures'}}]})
                    // .subscribe((orders: Order[]) => {
                    //     self.orders = orders;
                    // }));

                    // this.subscrList.push(self.restaurantSvc
                    // .syncOrders(restaurant_id, {include: ['account', {items: {product: 'pictures'}}]})
                    // .subscribe((od: Order) => {
                    //     self.orders.push(od);
                    // }));

                    // self.restaurantSvc.getProducts(restaurant_id).subscribe(
                    //     (ps: Product[]) => {
                    //         self.products = ps;
                    //     });
                }

            } else if (account.type === 'super') {
                // this.subscrList.push(self.restaurantSvc.find().subscribe((restaurants: Restaurant[]) => {
                //     self.restaurants = restaurants;
                // }));

                // this.subscrList.push(self.orderSvc.find({include: ['account', 'restaurant', {items: {product: 'pictures'}}]})
                // .subscribe((orders: Order[]) => {
                //     self.orders = orders;
                // }));

              //   this.subscrList.push(self.productSvc.findCategories().subscribe((categories: Category[]) => {
              //     self.categories = categories;
              // }));
            }
        });

        // self.authServ.hasLoggedIn().subscribe(
        //   (r:boolean)=>{
        //     self.isLogin = r? true : false;

        //     if(self.isLogin){
        //       self.sharedServ.emitMsg({name:'OnUpdateHeader'});
        //       self.toPage("admin/users");
        //     }else{
        //       self.toPage("admin/login");
        //     }
        //   },(err:any)=>{
        //     self.toPage("admin/login");
        //   });
    }

    ngOnDestroy() {
        this.subscrAccount.unsubscribe();
        this.unsubscribe();
    }

    unsubscribe() {
        this.subscrList.forEach(unsub => {
            unsub.unsubscribe();
        });
        this.subscrList = [];
    }

    toPage(url: string) {
        this.router.navigate([url]);
    }
}

