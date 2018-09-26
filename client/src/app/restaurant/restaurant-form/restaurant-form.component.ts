import { Component, OnInit, ViewChild, Input, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { CommerceService } from '../../commerce/commerce.service';
import { LocationService } from '../../shared/location/location.service';
import { RestaurantService } from '../restaurant.service';
import { Category, Picture } from '../../commerce/commerce';
import { MultiImageUploaderComponent } from '../../shared/multi-image-uploader/multi-image-uploader.component';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { IPicture } from '../../commerce/commerce.actions';
import { AccountService } from '../../account/account.service';
import { Restaurant, GeoPoint, Order, LoopBackConfig, Address, Account } from '../../shared/lb-sdk';

const APP = environment.APP;

@Component({
  selector: 'app-restaurant-form',
  templateUrl: './restaurant-form.component.html',
  styleUrls: ['./restaurant-form.component.scss']
})
export class RestaurantFormComponent implements OnInit, OnChanges {

  currentAccount: Account;

  id = '';
  categoryList: Category[] = [];
  picture;
  subscriptionPicture;
  form: FormGroup;
  users;
  uploadedPictures: string[] = [];
  uploadUrl: string = [
    LoopBackConfig.getPath(),
    LoopBackConfig.getApiVersion(),
    'Containers/pictures/upload'
  ].join('/');

  @Input() restaurant: Restaurant;
  @ViewChild(MultiImageUploaderComponent) uploader: any;

  createForm() {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(750)],
      // street: ['', Validators.required],
      // postal_code:['', Validators.required]
      address: this.fb.group({
        street: ['', [Validators.required]],
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
    private locationSvc: LocationService,
    private commerceSvc: CommerceService,
    private router: Router, private route: ActivatedRoute,
    private rx: NgRedux<IPicture>) {

    this.form = this.createForm();
  }

  ngOnInit() {
    const self = this;
    if (this.restaurant) {
      this.uploadedPictures = (this.restaurant.pictures || []).map(pic => pic.url);
      this.form.patchValue(this.restaurant);
      if (this.restaurant.address) {
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

    // self.commerceServ.getCategoryList().subscribe(catList=>{
    //     self.categoryList = catList;
    //     for(let cat of catList){
    //         let c = p.categories.find(x=> x.id==cat.id );
    //         if(c){
    //             self.categories.push(new FormControl(true));
    //         }else{
    //             self.categories.push(new FormControl(false));
    //         }
    //         //self.categories.push(new FormControl(s.id));
    //     }
    // })

    // self.commerceServ.getCategoryList().subscribe(catList=>{
    //     self.categoryList = catList;
    //     for(let cat of catList){
    //         let c = p.categories.find(x=> x.id==cat.id );
    //         if(c){
    //             self.categories.push(new FormControl(true));
    //         }else{
    //             self.categories.push(new FormControl(false));
    //         }
    //         //self.categories.push(new FormControl(s.id));
    //     }
    // })
    // });

    // create new
    // self.commerceServ.getCategoryList().subscribe(catList=>{
    //     self.categoryList = catList;
    //     for(let cat of catList){
    //         self.categories.push(new FormControl(false));
    //     }
    // });

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
    if (this.form) {
      this.form.patchValue(changes.restaurant.currentValue);
    }
  }

  onUploadFinished(event) {
    try {
      const res = JSON.parse(event.serverResponse.response._body);
      this.restaurant.pictures = (this.restaurant.pictures || []).concat(res.result.files.image.map(img => {
        return {
          url: [
            LoopBackConfig.getPath(),
            LoopBackConfig.getApiVersion(),
            'Containers',
            img.container,
            'download',
            img.name
          ].join('/')
        };
      }));
    } catch (error) {
      console.error(error);
    }
  }

  onRemoved(event) {
    this.restaurant.pictures.splice(this.restaurant.pictures.findIndex(pic => pic.url === event.file.src));
  }

  save() {
    // This component will be used for business admin and super admin!
    const self = this;
    const v = this.form.value;
    const restaurant = new Restaurant(this.form.value);
    if (!this.users || !this.users.length) {
      restaurant.ownerId = this.currentAccount.id;
    }

    restaurant.pictures = this.restaurant.pictures;

    let addr: Address = null;
    // hardcode Toronto as default
    if (self.restaurant && self.restaurant.address) {
      addr = self.restaurant.address;
      addr.formattedAddress = v.address.street;
    } else {
      addr = new Address({
        city: 'Toronto',
        province: 'ON',
        formattedAddress: v.address.street,
        unit: null,
        postalCode: v.address.postal_code
      });
    }


    // if (self.picture) {
    //     restaurant.image = self.picture.image;
    // }

    restaurant.id = self.restaurant ? self.restaurant.id : null;

    const sAddr = addr.formattedAddress + ', Toronto, ' + v.address.postal_code;
    this.locationSvc.getLocation(sAddr).subscribe(ret => {
      addr.location = { lat: ret.lat, lng: ret.lng };
      addr.sublocality = ret.sub_locality;
      addr.postalCode = ret.postal_code;
      restaurant.address = addr;

      // zlk
      restaurant.location = { lat: ret.lat, lng: ret.lng };

      if (restaurant.id) {
        self.restaurantSvc.replaceById(restaurant.id, restaurant).subscribe((r: any) => {
          // self.router.navigate(['admin']);
        });
      } else {
        self.restaurantSvc.create(restaurant).subscribe((r: any) => {
          // self.router.navigate(['admin']);
        });
      }

    });

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
