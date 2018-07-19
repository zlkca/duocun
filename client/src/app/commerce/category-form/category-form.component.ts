import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommerceService } from '../commerce.service';
import { Category } from '../commerce';

@Component({
    providers:[CommerceService],
    selector: 'app-category-form',
    templateUrl: './category-form.component.html',
    styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
    category:Category = new Category();

    constructor(private categoryServ:CommerceService, private route: ActivatedRoute){}

    ngOnInit() {
        let self = this;
        self.route.params.subscribe((params:any)=>{
            this.categoryServ.getCategory(params.id).subscribe(
                (r:Category) => {
                    self.category = r;
                },
                (err:any) => {
                    self.category = new Category();
                });
        });
    }

    save() {
        let self = this;
        self.categoryServ.saveCategory(self.category).subscribe(
            (r:Category) => {
                self.category = r;
            },
            (err:any) => {
                self.category = new Category();
            });
    }
}

