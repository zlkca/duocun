import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommerceService } from '../../commerce/commerce.service';
import { environment } from '../../../environments/environment';
import { Restaurant } from '../../commerce/commerce';
import { RestaurantService } from '../../restaurant/restaurant.service';

@Component({
    selector: 'app-admin-restaurant-form-page',
    templateUrl: './admin-restaurant-form-page.component.html',
    styleUrls: ['./admin-restaurant-form-page.component.scss']
})
export class AdminRestaurantFormPageComponent implements OnInit {
    restaurant: any;

    constructor(private route: ActivatedRoute,
        private restaurantSvc: RestaurantService) { }

    ngOnInit() {
        const self = this;
        this.route.params.subscribe(params => {
            const restaurant_id = params['id'];

            if (restaurant_id) {
                self.restaurantSvc.findById(restaurant_id).subscribe(r => {
                    if (r) {
                        self.restaurant = r;
                    }
                });
            } else {
                self.restaurant = new Restaurant();
            }
        });
    }
}

