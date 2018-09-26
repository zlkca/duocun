
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Restaurant } from '../../commerce/commerce';
import { CommerceService } from '../../commerce/commerce.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-restaurant-list',
    templateUrl: './restaurant-list.component.html',
    styleUrls: ['./restaurant-list.component.scss']
})
export class RestaurantListComponent implements OnInit {
  @Input() restaurants: Restaurant[];
  @Output() select = new EventEmitter();
    MEDIA_URL = environment.MEDIA_URL;

    constructor(private router: Router, private commerceSvc: CommerceService) { }

    ngOnInit() {
        // const self = this;
        // this.commerceSvc.getRestaurantList().subscribe((r: Restaurant[]) => {
        //     self.restaurants = r;
        // });
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


    onSelect(r) {
      this.select.emit({ restaurant: r });
    }

    viewProducts(restaurant) {
      this.router.navigate(['admin/products'], { queryParams: { restaurant_id: restaurant.id } });
    }

    delete(r) {
        // let self = this;
        // this.commerceSvc.rmRestaurant(r.id).subscribe(
        //     (r:Restaurant[]) => {
        //         self.restaurantList = r;
        //         if(r.length){
        //             //
        //         }else{
        //             self.router.navigate(["admin/restaurant"]);
        //         }
        //     },
        //     (err)=>{

        //     }
        // )
    }
}