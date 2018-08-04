
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Restaurant } from '../../commerce/commerce';
import { RestaurantService } from '../../restaurant/restaurant.service';

import { CommerceService } from '../../commerce/commerce.service';
import { environment } from '../../../environments/environment';

const ADD_IMAGE = 'add_photo.png';

@Component({
    selector: 'app-admin-restaurant-list',
    templateUrl: './admin-restaurant-list.component.html',
    styleUrls: ['./admin-restaurant-list.component.scss']
})
export class AdminRestaurantListComponent implements OnInit {
    restaurants = [];
    MEDIA_URL = environment.MEDIA_URL;
    placeholder = environment.MEDIA_URL + ADD_IMAGE;

    constructor(private router: Router,
        private restaurantSvc: RestaurantService,
        private commerceSvc: CommerceService) { }

    ngOnInit() {
        const self = this;
        this.restaurantSvc.find().subscribe(r => {
            self.restaurants = r;
        });
    }

    toPage(url: string) {
        this.router.navigate([url]);
    }

    getImageSrc(image: any) {
        // if (image.file) {
        //     return image.data;
        // } else {
        //     if (image.data) {
        //         return this.MEDIA_URL + image.data;
        //     } else {
        //         return this.MEDIA_URL + 'add_photo.png';
        //     }
        // }
        return this.MEDIA_URL + 'add_photo.png';
    }

    change(r) {
        this.router.navigate(['admin/restaurant/' + r.id]);
    }

    add() {
        this.router.navigate(['admin/restaurant']);
    }

    delete(restaurant) {
        const self = this;
        // this.commerceSvc.rmRestaurant(r.id).subscribe(
        //     (r:Restaurant[]) => {
        //         self.restaurantList = r;
        //         if(r.length){
        //             //
        //         }else{
        //             self.router.navigate(['admin/restaurant']);
        //         }
        //     },
        //     (err)=>{

        //     }
        // )
    }

    viewProducts(restaurant) {
        this.router.navigate(['admin/products'], { queryParams: { restaurant_id: restaurant.id } });
    }

    editMultiProducts(restaurant) {
        this.router.navigate(['admin/edit-products']);
    }
}
