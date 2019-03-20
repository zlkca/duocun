import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormArray, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { NgRedux } from '@angular-redux/store';

import { ProductService } from '../product.service';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { MultiImageUploaderComponent } from '../../shared/multi-image-uploader/multi-image-uploader.component';
import { Restaurant, Product, Category, LoopBackConfig, Picture } from '../../lb-sdk';
import { Jsonp } from '@angular/http';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnChanges {
  categoryList = [];
  restaurantList = [];
  // colorList:Color[] = [];
  // id: number;
  uploadedPictures: string[] = [];
  uploadUrl: string = [
    LoopBackConfig.getPath(),
    LoopBackConfig.getApiVersion(),
    'files/upload'
  ].join('/');

  urls = [];
  pictures = [];
  file;

  @Input() product: Product;
  @Output() afterSave: EventEmitter<any> = new EventEmitter();
  @ViewChild(MultiImageUploaderComponent) uploader: any;

  // @ViewChild(ImageUploaderComponent) uploader: any;

  form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.maxLength(980)]),
    price: new FormControl(),
    restaurantId: new FormControl(),
    categoryId: new FormControl(),
  });

  constructor(
    private fb: FormBuilder,
    private restaurantSvc: RestaurantService,
    private productSvc: ProductService,
    private sharedSvc: SharedService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.createForm();
  }

  createForm() {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(750)],
      price: ['', Validators.required],
      restaurantId: ['', Validators.required],
      categoryId: [''],
      // ownerId: new FormControl(),
    });
  }

  ngOnInit() {
    if (!this.product) {
      this.product = new Product();
      this.product.categoryId = 1;
    }
    this.uploadedPictures = (this.product.pictures || []).map(pic => pic.url);
    this.form.get('name').setValue(this.product.name);
    this.form.get('description').setValue(this.product.description);
    this.form.get('price').setValue(this.product.price);
    this.form.get('restaurantId').setValue(this.product.restaurantId);
    this.form.get('categoryId').setValue(this.product.categoryId);

    this.restaurantSvc.find().subscribe(r => {
      this.restaurantList = r;
    });

    this.loadCategoryList();
  }

  loadCategoryList() {
    const self = this;
    this.productSvc.findCategories().subscribe(
      (r: Category[]) => {
        self.categoryList = r;
      },
      (err: any) => {
        self.categoryList = [];
      });
  }

  ngOnChanges(changes) {
    if (this.form && changes.product.currentValue) {
      this.form.patchValue(changes.product.currentValue);
    }
  }

  onToggleCategory(c: FormControl) {
    const v = c.value;
    if (c.value.checked) {
      v.checked = false;
    } else {
      v.checked = true;
    }
    c.patchValue(v);
  }

  onSelectRestaurant(id: string) {
    // let obj = this.restaurantList.find( x => { return x.id == id });
    // this.restaurant.setValue(obj);
    // this.restaurant.patchValue(m);
    // this.restaurant.id;
  }

  onSelectColor(id: string) {
    // let obj = this.colorList.find(x => {return x.id == id});
    // this.color.patchValue(obj);
    // this.color.patchValue({'id':id});
  }

  getCheckedCategories() {
    const cs = [];
    for (let i = 0; i < this.categoryList.length; i++) {
      // let c = this.categoryList[i];
      // if (this.categories.get(i.toString()).value) {
      //     cs.push(c);
      // }
    }
    return cs;
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
      this.pictures = [
        this.sharedSvc.getApiUrl() + picture.url,
      ];
    } else {
      this.pictures = [''];
    }
  }

  onAfterPictureUpload(e: any) {
    const self = this;
    this.pictures = [
      self.sharedSvc.getApiUrl() + e.name,
    ];

    this.product.pictures = [
      new Picture({
        name: e.name,
        // index: 1,
        url: e.name,
      })
    ];
    this.file = e.file;
    this.urls = [
      this.sharedSvc.getApiBaseUrl() + e.name,
    ];
  }

  onRemoved(event) {
    this.product.pictures.splice(this.product.pictures.findIndex(pic => pic.url === event.file.src));
  }

  save() {
    const self = this;
    const newV = this.form.value;
    const p: Product = new Product(newV);
    const restaurantId = p.restaurantId;

    p.id = self.product ? self.product.id : null;
    p.pictures = this.product.pictures;
    if (this.product && this.product.id) {
      this.productSvc.replace(p).subscribe(r => {});
    } else {
      this.productSvc.save(p).subscribe(r => {});
    }
    self.afterSave.emit({ restaurant_id: restaurantId });
  }

  // ngOnInit() {
  //     let self = this;

  //     self.commerceServ.getCategoryList().subscribe(
  //         (r:Category[]) => {
  //             self.categoryList = r;
  //         },
  //         (err:any) => {
  //             self.categoryList = [];
  //         });

  //     self.route.params.subscribe((params:any)=>{
  //         self.id = params.id;

  //         self.commerceServ.getImageDefaultTitle(1).subscribe((r)=>{
  //             self.defaultTitles = [r.name0, r.name1, r.name2, r.name3];

  //             if(params.id){
  //               self.commerceServ.getWechatGroup(params.id).subscribe(
  //                 (r:WechatGroup) => {
  //                     r.qrs = self.commerceServ.getWechatGroupQRs(r.qrs, self.defaultTitles);
  //                     self.wechatgroup = r
  //                 },
  //                 (err:any) => {
  //                     let r = new WechatGroup();
  //                     r.category = {'id':1};
  //                     r.qrs = self.commerceServ.getWechatGroupQRs(r.qrs, self.defaultTitles);
  //                     self.wechatgroup = r;
  //                 });
  //             }else{
  //                 let r = new WechatGroup();
  //                 r.category = {'id':1};
  //                 r.qrs = self.commerceServ.getWechatGroupQRs(r.qrs, self.defaultTitles);
  //                 self.wechatgroup = r;
  //             }

  //         },(err)=>{

  //         });


  //     });
  // }


}

