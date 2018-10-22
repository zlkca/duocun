import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgRedux } from '@angular-redux/store';
import { IPicture } from '../../commerce/commerce.actions';

import { ProductService } from '../product.service';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { MultiImageUploaderComponent } from '../../shared/multi-image-uploader/multi-image-uploader.component';
import { Restaurant, Product, Category, LoopBackConfig, Picture } from '../../shared/lb-sdk';
import { Jsonp } from '@angular/http';

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
    'Containers/pictures/upload'
  ].join('/');

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
    private restaurantSvc: RestaurantService,
    private productSvc: ProductService,
    private route: ActivatedRoute,
    private rx: NgRedux<IPicture>, private router: Router
  ) { }

  ngOnInit() {
    if (this.product) {
      this.uploadedPictures = (this.product.pictures || []).map(pic => pic.url);
      this.form.get('name').setValue(this.product.name);
      this.form.get('description').setValue(this.product.description);
      this.form.get('price').setValue(this.product.price);
      this.form.get('restaurantId').setValue(this.product.restaurantId);
      this.form.get('categroyId').setValue(this.product.categoryId);
    }

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
      let c = this.categoryList[i];
      // if (this.categories.get(i.toString()).value) {
      //     cs.push(c);
      // }
    }
    return cs;
  }

  onUploadFinished(event) {
    try {
      const res = JSON.parse(event.serverResponse.response._body);
      this.product.pictures = (this.product.pictures || []).concat(res.result.files.image.map(img => {
        return {
          url: [
            LoopBackConfig.getPath(),
            LoopBackConfig.getApiVersion(),
            'Containers',
            img.container,
            img.name
          ].join('/')
        };
      }));
    } catch (error) {
      console.error(error);
    }
  }

  onRemoved(event) {
    this.product.pictures.splice(this.product.pictures.findIndex(pic => pic.url === event.file.src));
  }

  save() {
    const self = this;
    // const restaurant_id = self.form.get('restaurant_id');
    const newV = this.form.value;
    const p: Product = new Product(newV);
    const restaurantId = p.restaurantId;

    if (this.product) {
      p.pictures = this.product.pictures;
      this.productSvc.replaceById(this.product.id, p).subscribe((r: any) => {
        self.afterSave.emit({ restaurant_id: restaurantId });
      });
    } else {
      this.productSvc.create(p).subscribe((r: any) => {
        self.afterSave.emit({ restaurant_id: restaurantId });
      });
    }

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

