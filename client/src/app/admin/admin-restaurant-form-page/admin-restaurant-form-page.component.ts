import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommerceService } from '../../commerce/commerce.service';
import { environment } from '../../../environments/environment';
import { Restaurant } from '../../commerce/commerce';

@Component({
    selector: 'app-admin-restaurant-form-page',
    templateUrl: './admin-restaurant-form-page.component.html',
    styleUrls: ['./admin-restaurant-form-page.component.scss']
})
export class AdminRestaurantFormPageComponent implements OnInit {
    restaurant: any;

    constructor(private route: ActivatedRoute, private commerceSvc: CommerceService) { }

    ngOnInit() {
        const self = this;
        this.route.params.subscribe(params => {
            const restaurant_id = params['id'];

            if (restaurant_id) {
                self.commerceSvc.getRestaurant(restaurant_id).subscribe(r => {
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

