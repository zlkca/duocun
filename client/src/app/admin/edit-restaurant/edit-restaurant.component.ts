import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommerceService } from '../../commerce/commerce.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-edit-restaurant',
    templateUrl: './edit-restaurant.component.html',
    styleUrls: ['./edit-restaurant.component.scss']
})
export class EditRestaurantComponent implements OnInit {

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
            }
        });
    }
}
