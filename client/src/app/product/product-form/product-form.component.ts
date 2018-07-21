import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgRedux } from '@angular-redux/store';
import { IPicture } from '../../commerce/commerce.actions';

import { ProductService } from '../product.service';
import { RestaurantService } from '../../restaurant/restaurant.service';
//import { Product, Category, Restaurant, Color, Picture } from '../../commerce/commerce';
import { MultiImageUploaderComponent } from '../../shared/multi-image-uploader/multi-image-uploader.component';
import { Restaurant, Product, Order } from '../../shared/lb-sdk';

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.component.html',
    styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnDestroy {
    categoryList = [];
    restaurantList;
    // colorList:Color[] = [];
    id: number;
    pictures: any[] = [];
    subscriptionPicture;
    picture;

    @Input() product;
    @ViewChild(MultiImageUploaderComponent) uploader: any;

    // @ViewChild(ImageUploaderComponent) uploader: any;

    form: FormGroup = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.minLength(3)]),
        description: new FormControl('', [Validators.maxLength(980)]),
        price: new FormControl(),
        restaurant_id: new FormControl(),
    });

    constructor(
        private restaurantSvc: RestaurantService,
        private productSvc: ProductService,
        private route: ActivatedRoute,
        private rx: NgRedux<IPicture>, private router: Router) { }

    ngOnInit() {
        const self = this;

        self.restaurantSvc.find().subscribe(r => {
            self.restaurantList = r;
        });

        const p: Product = this.product;

        self.id = p.id;
        self.pictures = p.pictures;
        self.form.patchValue(p);
        // self.form.patchValue({ restaurant_id: p.restaurant ? p.restaurant.id : 1 });
        // self.pictures = [{ index: 0, name: '', image: this.product.image }];
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
        this.subscriptionPicture = this.rx.select<IPicture>('picture').subscribe(
            pic => {
                self.picture = pic;
            });
    }

    ngOnDestroy() {
        this.subscriptionPicture.unsubscribe();
    }

    onToggleCategory(c: FormControl) {
        // let v = c.value;
        // if(c.value.checked){
        //     v.checked = false;
        // }else{
        //     v.checked = true;
        // }
        // c.patchValue(v);
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
        // for (let i = 0; i < this.categoryList.length; i++) {
        //     let c = this.categoryList[i];
        //     if (this.categories.get(i.toString()).value) {
        //         cs.push(c);
        //     }
        // }
        return cs;
    }

    save() {
        const self = this;
        const restaurant_id = self.form.get('restaurant_id');
        const newV = {
            ...this.form.value,
            id: self.id,
            // categories: [{ id: 1 }], // self.getCheckedCategories(),
            // restaurant: { id: restaurant_id.value },
            // pictures: [self.picture]// self.uploader.data
            restaurantId: restaurant_id.value
        };

        const c: any = new Product(newV);
        if (self.id) {
            this.productSvc.replaceById(self.id, c).subscribe((r: any) => {
                self.router.navigate(['admin']);
            });
        } else {
            this.productSvc.create(c).subscribe((r: any) => {
                self.router.navigate(['admin']);
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

    // save() {
    //     let self = this;
    //     self.wechatgroup.user = {'id':1, 'name':'admin'};
    //     self.wechatgroup.id = self.id;
    //     // self.wechatgroup.images = self.images;
    //     self.commerceServ.saveWechatGroup(self.wechatgroup).subscribe(
    //         (r:any) => {
    //             //self.wechatgroup = new WechatGroup(r.data[0]);
    //             self.router.navigate(["admin/wechatgroups"]);
    //         },
    //         (err:any) => {
    //             //self.wechatgroup = new WechatGroup();
    //             self.router.navigate(["admin/wechatgroups"]);
    //         });
    // }
    // onLoadImage(i:number){
    //   $('[name="image'+ i +'"]').click();
    // }

    // onDeleteImage(i:number){
    //     let qr = this.wechatgroup.qrs[i];//new QR();
    //     //qr.index = i;
    //     qr.image.data = this.emptyImage;
    //     qr.image.file = '';
    //     this.wechatgroup.qrs[i] = qr;
    // }

    // onImageChange(event:any, i:number){
    //     let self = this;
    //     let reader = new FileReader();
    //     if(event.target.files && event.target.files.length > 0) {
    //       let file = event.target.files[0];
    //       reader.readAsDataURL(file);
    //       reader.onload = () => {
    //           self.wechatgroup.qrs[i].image = {data: reader.result, file: event.target.files[0]};//.split(',')[1];
    //           //self.wechatgroup.logo = event.target.files[0];
    //       //   this.form.get('avatar').setValue({
    //       //     filename: file.name,
    //       //     filetype: file.type,
    //       //     value: reader.result.split(',')[1]
    //       //   })
    //       }
    //     }
    // }
}

