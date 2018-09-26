
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Restaurant } from '../../commerce/commerce';
import { RestaurantService } from '../../restaurant/restaurant.service';

import { CommerceService } from '../../commerce/commerce.service';
import { environment } from '../../../environments/environment';

const ADD_IMAGE = 'add_photo.png';

@Component({
  selector: 'app-admin-restaurant-page',
  templateUrl: './admin-restaurant-page.component.html',
  styleUrls: ['./admin-restaurant-page.component.scss']
})
export class AdminRestaurantPageComponent implements OnInit {
  restaurants = [];
  restaurant = new Restaurant();
  MEDIA_URL = environment.MEDIA_URL;
  placeholder = environment.MEDIA_URL + ADD_IMAGE;

  constructor(private router: Router,
      private restaurantSvc: RestaurantService,
      private commerceSvc: CommerceService) { }

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


  ngOnInit() {
    this.loadRestaurantList();
  }

  add() {
    this.restaurant = new Restaurant();
  }

  onAfterSave(event) {
    this.loadRestaurantList();
  }

  onSelect(event) {
    this.restaurant = event.restaurant;
  }

  loadRestaurantList() {
    const self = this;
    this.restaurantSvc.find({ include: ['pictures', 'address'] }).subscribe(r => {
        self.restaurants = r;
    });
  }
}
