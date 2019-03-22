import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
// import { LocationService } from '../../shared/location/location.service';
// import { ILocation } from '../../shared/location/location.model';
import { RestaurantService } from '../restaurant.service';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';

import { AccountService } from '../../account/account.service';
import { GeoPoint, Restaurant, Category, LoopBackConfig, Address, Account, Picture } from '../../lb-sdk';

import { getComponentViewDefinitionFactory } from '../../../../node_modules/@angular/core/src/view';
import { SharedService } from '../../shared/shared.service';

const APP = environment.APP;
const PICTURES_FOLDER = 'pictures';

@Component({
  selector: 'app-restaurant-form',
  templateUrl: './restaurant-form.component.html',
  styleUrls: ['./restaurant-form.component.scss']
})
export class RestaurantFormComponent implements OnInit, OnChanges {

  currentAccount: Account;
  location = { // ILocation
    street_name: '',
    street_number: '',
    sub_locality: '',
    city: '',
    province: '',
    postal_code: '',
    lat: 0,
    lng: 0
  };

  address = '';
  id = '';
  categoryList: Category[] = [];
  picture: Picture;
  subscriptionPicture;
  form: FormGroup;
  users;
  uploadedPictures: string[] = [];
  uploadUrl: string = [
    LoopBackConfig.getPath(),
    LoopBackConfig.getApiVersion(),
    'files/upload'
  ].join('/');

  urls = [];
  file;

  @Output() afterSave: EventEmitter<any> = new EventEmitter();
  @Input() restaurant: Restaurant;

  createForm() {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(750)],
      // street: ['', Validators.required],
      // postal_code:['', Validators.required]
      address: this.fb.group({
        // street: ['', [Validators.required]],
        unit: ['', [Validators.required]],
        postalCode: ['', [Validators.required]],
      }),
      ownerId: new FormControl(), // ['', Validators.required]
      // categories: this.fb.array([]),
      // delivery_fee: ''
    });
  }

  constructor(private fb: FormBuilder,
    private accountSvc: AccountService,
    private restaurantSvc: RestaurantService,
    // private locationSvc: LocationService,
    private sharedSvc: SharedService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.createForm();
  }

  ngOnInit() {
    const self = this;

    if (this.restaurant && this.restaurant.id) {
      this.uploadedPictures = (this.restaurant.pictures || []).map(pic => pic.url);
      this.form.patchValue(this.restaurant);
      if (this.restaurant.address) {
        const addr = this.restaurant.address;
        this.location.city = addr.city;
        this.location.street_name = addr.streetName;
        this.location.street_number = addr.streetNumber;
        this.location.sub_locality = addr.sublocality;
        this.location.postal_code = addr.postalCode;
        this.location.province = addr.province;
        this.location.lat = this.restaurant.location.lat;
        this.location.lng = this.restaurant.location.lng;

        this.form.get('address').get('street').setValue(this.restaurant.address.formattedAddress);
        this.form.get('address').get('unit').setValue(this.restaurant.address.unit);
        this.form.get('address').get('postalCode').setValue(this.restaurant.address.postalCode);
      }
    }

    // localStorage.setItem('restaurant_info-' + APP, JSON.stringify(self.restaurant));
    // self.pictures = [{ index: 0, name: '', image: this.restaurant.image }];

    // self.route.params.subscribe((params:any)=>{
    // self.commerceServ.getRestaurant(params.id).subscribe(
    //     (r:Restaurant) => {
    //     	self.restaurant = r;
    //     	self.id = r.id;
    //         self.form.patchValue(r);
    //         self.street.patchValue(r.address.street);

    //         if(r.image && r.image.data){
    //         	self.pictures = [{index:0, name:"", image:r.image}];
    //         }else{
    //         	self.pictures = [];
    //         }

    //         self.commerceServ.getCategoryList().subscribe(catList=>{
    //       self.categoryList = catList;
    //       for(let cat of catList){
    //           let c = r.categories.find(x=> x.id==cat.id );
    //           if(c){
    //               self.categories.push(new FormControl(true));
    //           }else{
    //               self.categories.push(new FormControl(false));
    //           }
    //           //self.categories.push(new FormControl(s.id));
    //       }
    //   })
    //     },
    //     (err:any) => {
    //     });

    this.accountSvc.getCurrent().subscribe((acc: Account) => {
      this.currentAccount = acc;
      if (acc.type === 'super') {
        self.accountSvc.find({ where: { type: 'business' } }).subscribe(users => {
          self.users = users;
        });
      }
    });

  }

  ngOnChanges(changes) {
    if (this.form && changes.restaurant.currentValue.id) {
      const restaurant = changes.restaurant.currentValue;
      this.form.patchValue(changes.restaurant.currentValue);

      const addr = changes.restaurant.currentValue.address;
      if (addr) {
        this.location.city = addr.city;
        this.location.street_name = addr.streetName;
        this.location.street_number = addr.streetNumber;
        this.location.sub_locality = addr.sublocality;
        this.location.postal_code = addr.postalCode;
        this.location.province = addr.province;
        this.location.lat = restaurant.location.lat;
        this.location.lng = restaurant.location.lng;

        // this.address = this.locationSvc.getAddrString(this.location);
      }

      this.setPictures(restaurant);
    }
  }

  fillForm(event) {
    this.form.get('name').setValue(event.name);
    this.form.get('description').setValue(event.description);
    // this.form.get('ownerId').setValue(event.ownerId);
    // if (event.groups && event.groups.length > 0) {
    //   this.form.get('groupId').setValue(event.groups[0].id);
    // } else {
    //   this.form.get('groupId').setValue(null);
    // }
    if (event.categories && event.categories.length > 0) {
      this.form.get('categoryId').setValue(event.categories[0].id);
    } else {
      this.form.get('categoryId').setValue(null);
    }
    // this.form.get('eventDate').setValue(this.sharedSvc.getDate(event.fromDateTime));
    // this.form.get('categories')['controls'][0].setValue(group.categories[0].id);
  }

  setPictures(restaurant: Restaurant) {
    if (restaurant.pictures && restaurant.pictures.length > 0) {
      const picture = restaurant.pictures[0]; // fix me
      this.urls = [
        this.sharedSvc.getMediaUrl() + picture.url,
      ];
    } else {
      this.urls = [''];
    }
  }

  onAfterPictureUpload(e: any) {
    const self = this;
    const path = e.name;

    this.restaurant.pictures = [
      new Picture({
        name: e.name,
        // entityType: 'Event',
        // entityId: self.event.id,
        // index: 1,
        url: path,
      })
    ];

    this.file = e.file;

    this.urls = [
      self.sharedSvc.getMediaUrl() + path,
    ];
  }

  // callback of app-address-input
  onAddressChange(e) {
    // localStorage.setItem('location-' + APP, JSON.stringify(e.addr));
    this.location = e.addr;
    this.address = e.sAddr;
    if (this.location) {
      this.form.get('address').patchValue({ postalCode: this.location.postal_code });
    }

    // this.sharedSvc.emitMsg({ name: 'OnUpdateAddress', addr: e.addr });
  }

  onRemoved(event) {
    this.restaurant.pictures.splice(this.restaurant.pictures.findIndex(pic => pic.url === event.file.src));
  }

  // save_old() {
  //   // This component will be used for business admin and super admin!
  //   const self = this;
  //   const v = this.form.value;
  //   const restaurant = new Restaurant(this.form.value);
  //   if (!this.users || !this.users.length) {
  //     restaurant.ownerId = this.currentAccount.id;
  //   }

  //   restaurant.pictures = this.restaurant.pictures;
  //   restaurant.location = { lat: this.location.lat, lng: this.location.lng };
  //   restaurant.address = new Address({
  //     id: this.restaurant.address ? this.restaurant.address.id : null,
  //     streetName: this.location.street_name,
  //     streetNumber: this.location.street_number,
  //     sublocality: this.location.sub_locality,
  //     city: this.location.city,
  //     province: this.location.province,
  //     formattedAddress: this.locationSvc.getAddrString(this.location),
  //     unit: this.form.get('address').get('unit').value,
  //     postalCode: this.location.postal_code,
  //     location: {
  //       lat: this.location.lat,
  //       lng: this.location.lng
  //     },
  //   });

  //   restaurant.location = { lat: this.location.lat, lng: this.location.lng };
  //   restaurant.id = self.restaurant ? self.restaurant.id : null;
  //   if (restaurant.id) {
  //     self.restaurantSvc.replaceById(restaurant.id, restaurant).subscribe((r: any) => {
  //       // self.router.navigate(['admin']);
  //       self.afterSave.emit({ restaurant: r, action: 'update' });
  //     });
  //   } else {
  //     self.restaurantSvc.create(restaurant).subscribe((r: any) => {
  //       // self.router.navigate(['admin']);
  //       self.afterSave.emit({ restaurant: r, action: 'save' });
  //     });
  //   }
  // }

  save() {
    const self = this;
    const v = this.form.value;
    const restaurant = new Restaurant(this.form.value);
    if (!this.users || !this.users.length) {
      restaurant.ownerId = this.currentAccount.id;
    }

    restaurant.pictures = this.restaurant.pictures;
    restaurant.location = { lat: this.location.lat, lng: this.location.lng };
    restaurant.address = new Address({
      id: this.restaurant.address ? this.restaurant.address.id : null,
      streetName: this.location.street_name,
      streetNumber: this.location.street_number,
      sublocality: this.location.sub_locality,
      city: this.location.city,
      province: this.location.province,
      formattedAddress: '', // this.locationSvc.getAddrString(this.location),
      unit: this.form.get('address').get('unit').value,
      postalCode: this.location.postal_code,
      // location: {
      //   lat: this.location.lat,
      //   lng: this.location.lng
      // },
    });

    restaurant.location = { lat: this.location.lat, lng: this.location.lng };
    restaurant.id = self.restaurant ? self.restaurant.id : null;

    if (restaurant.id) {
      this.restaurantSvc.replace(restaurant).subscribe(r => {
        self.afterSave.emit({ restaurant: r, action: 'update' });
      });
    } else {
      this.restaurantSvc.save(restaurant).subscribe(r => {
        self.afterSave.emit({ restaurant: r, action: 'save' });
      });
    }
  }

  cancel() {
    const self = this;

    // const c = localStorage.getItem('restaurant_info-' + APP);
    // const r = JSON.parse(c);

    self.form.patchValue(this.restaurant);
    // self.pictures = [{ index: 0, name: '', image: this.restaurant.image }];

    // localStorage.removeItem('restaurant_info-' + APP);

    self.router.navigate(['admin']);
  }
}
