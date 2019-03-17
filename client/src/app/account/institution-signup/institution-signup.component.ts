import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgRedux } from '@angular-redux/store';
import { AccountActions } from '../account.actions';
import { AuthService } from '../auth.service';

import { SharedService } from '../../shared/shared.service';
import { Account, Restaurant, Address } from '../../lb-sdk';
import { AccountService } from '../account.service';
import { RestaurantService } from '../../restaurant/restaurant.service';

@Component({
  selector: 'app-institution-signup',
  templateUrl: './institution-signup.component.html',
  styleUrls: ['./institution-signup.component.scss']
})

export class InstitutionSignupComponent implements OnInit {
  errMsg: string;
  formGroup: FormGroup;
  address: any;
  picture: any = { image: { data: '', file: '' } };
  uploader: any;

  constructor(
    private fb: FormBuilder,
    private authServ: AuthService,
    private accountServ: AccountService,
    private restaurantServ: RestaurantService,
    private router: Router,
    private sharedServ: SharedService) {

    this.formGroup = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      restaurant: ['', Validators.required],
      // address: ['', Validators.required],
      unit: ['', Validators.required],
      phone: ['', Validators.required],
    });
  }

  ngOnInit() {

  }

  setAddr(obj) {
    this.address = obj.addr;
  }

  onSignup() {
    const v = this.formGroup.value;
    const account = new Account({
      username: v.username,
      email: v.email,
      password: v.password,
      type: 'business'
    });
    this.accountServ.signup(account).subscribe((user: Account) => {
      if (user.id) {
        const restaurant = new Restaurant({
          name: v.restaurant,
          location: { lat: this.address.lat, lng: this.address.lng },
          ownerId: user.id,
          address: new Address({
            formattedAddress: this.address.street_number + ' ' + this.address.street_name,
            unit: v.unit,
            streetName: this.address.street_name,
            streetNumber: this.address.street_number,
            location: { lat: this.address.lat, lng: this.address.lng },
            province: this.address.province,
            postalCode: this.address.postal_code
          }),
          delivery_fee: 0,
        });
        this.restaurantServ.save(restaurant).subscribe((res: Restaurant) => {
          this.router.navigate(['admin']);
        });
      }
    },
      err => {
        this.errMsg = err.message || 'Create Account Failed';
      });
  }


  save() {
    // let self = this;
    // let v = this.form.value;
    // let picture = self.uploader.data[0]
    // let addr = null;
    // // hardcode Toronto as default
    // if(self.restaurant && self.restaurant.address){
    //   addr = self.restaurant.address;
    //   addr.street = v.address.street;
    // }else{
    //   addr = new Address({id:'', city:{id:5130}, province:{id:48}, street:v.address.street});
    // }
    // let m = new Restaurant(this.form.value);

    // m.image = picture.image;
    // m.id = self.id;

    // // to fix
    // //let s = addr.street + ', ' + addr.city.name + ', ' + addr.province.name;
    // let s = addr.street + ', Toronto, ' + v.address.postal_code;
    // this.commerceServ.getLocation(s).subscribe(ret=>{
    //   addr.lat = ret.lat;
    //   addr.lng = ret.lng;
    //   addr.sub_locality = ret.sub_locality;
    //   addr.postal_code = ret.postal_code;
    //   m.address = addr;
    //   self.commerceServ.saveRestaurant(m).subscribe( (r:any) => {
    //     self.router.navigate(['admin/restaurants']);
    //   });
    // })

  }

}
