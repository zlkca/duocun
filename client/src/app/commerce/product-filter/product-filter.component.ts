import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';

import { CommerceService } from '../commerce.service';
//import { AuthService } from '../../users/shared/auth.service';
import { SharedService } from '../../shared/shared.service';
import { Product, Category, Restaurant, Color, Picture } from '../commerce';


@Component({
  //providers:[UserService],
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.scss']
})
export class ProductFilterComponent implements OnInit {
    bFilter:boolean = false;
	  categoryList:Category[] = [];
    restaurantList:Restaurant[] = [];
    colorList:Color[] = [];
    
    form:FormGroup = new FormGroup({
        colors: new FormArray([]),
        categories: new FormArray([]),
        restaurants:new FormArray([])
    });

    get categories(){
        return this.form.get('categories') as FormArray;
    }

    get restaurants(){
      return this.form.get('restaurants') as FormArray;
    }

    get colors(){
      return this.form.get('colors') as FormArray;
    }

  // priceRange:any = {lower:100, upper:10000};
  // restaurant:string = '';
  // restaurants:Restaurant[];
  // categories:Category[];
  // bFilter:boolean;
  selected:any;

  constructor(private commerceServ:CommerceService, private sharedServ:SharedService) {
        let self = this;
        this.sharedServ.getMsg().subscribe(msg => {
            if('OnClearFilter' === msg.name){
                self.selected = null;
            }
        });
  }

  ngOnInit() {
    let self = this;
    self.commerceServ.getCategoryList().subscribe(cList=>{
        self.categoryList = cList;
        for(let cat of cList){
          self.categories.push(new FormControl(false));      
        }
    });

    // self.commerceServ.getRestaurantList().subscribe(
    //   (mList:Restaurant[])=>{
    //     self.restaurantList = mList;
    //     for(let restaurant of mList){
    //       self.restaurants.push(new FormControl(false));
    //     }
    //   });

    // self.commerceServ.getColorList().subscribe(cList=>{
    //     self.colorList = cList;
    //     for(let color of cList){
    //       self.colors.push(new FormControl(false));      
    //     }
    // });

    // this.commerceServ.getCategoryList().subscribe(
    //   (d:Category[])=>{
    //     let categories = [];
    //     for(var i=0; i<d.length; i++){
    //       categories.push({data:d[i], checked:true});
    //     }
    //     this.categories = categories;
    //   },
    //   (e:any)=>{

    //   });
    
    //   this.initFilter();
  }


    onToggleItem(i:number, ctrls:FormArray){
      let ctrl = ctrls.get(i.toString());

      if(ctrl.value){
        ctrl.patchValue(true);
      }else{
        ctrl.patchValue(false);
      }
      let catIds = this.getCheckedItems(this.categoryList, this.categories);
      let mIds = this.getCheckedItems(this.restaurantList, this.restaurants);
      let colorIds = this.getCheckedItems(this.colorList, this.colors);

      this.sharedServ.emitMsg({name:'OnSearch', query:{'categories':catIds, 'restaurants':mIds, 'colors':colorIds}});
    }

    getCheckedItems(dataList:any[], controls:FormArray){
      let ids = [];
      for(let i=0; i<dataList.length; i++){
        let c = controls.get(i.toString());
        if(c.value){
          ids.push(dataList[i].id);
        }
      }
      return ids;
    }


  changeInputPrice(evnet:any){
    // this.priceRange = {lower: this.priceRange.lower, upper: this.priceRange.upper}; 
  }

  checkCategory(category:any){
    this.sharedServ.emitMsg({name:'OnSearch', query:{category_id:category.data.id}});
    this.selected = category;
  }

  searchByRestaurant(restaurant:any){
    this.sharedServ.emitMsg({name:'OnSearch', query:{restaurant_id:restaurant.data.id}});
    this.selected = restaurant;
  }

  initFilter(){
    let e = document.getElementById("filter-content");
    if(e.style.display == 'block'){
      // this.bFilter = true;
    }else{
      // this.bFilter = false;
    }
    this.selected = null;
  }

  toggleFilter(status:string){
    let e = document.getElementById("filter-content");
    e.style.display = status;
    // this.bFilter = !this.bFilter;
  }

  clearFilter(){
    this.sharedServ.emitMsg({name:'OnSearch'});
    this.selected = null;
  }
}
