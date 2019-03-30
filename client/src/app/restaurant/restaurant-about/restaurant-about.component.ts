import { Component, OnInit, Input } from '@angular/core';
import { Restaurant, Address } from '../../lb-sdk';


@Component({
  selector: 'restaurant-about',
  templateUrl: './restaurant-about.component.html',
  styleUrls: ['./restaurant-about.component.css']
})
export class RestaurantAboutComponent implements OnInit {

  @Input() restaurant: Restaurant;

  phoneNumber: number;
  address: Address;
  operatingHours: string;
  formattedAddress: string;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(v) {
      const rst = v.restaurant ? v.restaurant.currentValue : null;
      if(rst) {
        this.restaurant = rst;
        this.address = rst.address;
        this.formattedAddress = "Unit " + this.address.unit + ", " + this.address.streetNumber + " " +
          this.address.streetName + " " + this.address.city + " " + this.address.province;
        this.phoneNumber = 12344567890;
        this.operatingHours = "10:00 - 23:00"; 
      }
  }

}
