import { Component, OnInit } from '@angular/core';
import { CommerceService } from '../commerce.service';
import { Category } from '../commerce';

import { SharedService } from '../../shared/shared.service';

@Component({
    providers:[CommerceService],
    selector: 'app-category-list',
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
    categoryList:Category[];
    fields:string[] = [];

    constructor(private sharedServ:SharedService, private categoryServ:CommerceService){}

    ngOnInit() {
        let self = this;
        let category = new Category()
        this.fields = Object.getOwnPropertyNames(category);
        this.categoryServ.getCategoryList().subscribe(
            (r:Category[]) => {
                self.categoryList = r;
            },
            (err:any) => {
                self.categoryList = [];
            });
    }

    find(c?:any){
        if(c){
            this.sharedServ.emitMsg({name:'OnSearch', query:{category_id:c.id}});
        }else{
            this.sharedServ.emitMsg({name:'OnSearch'});
        }
        
    }
}

