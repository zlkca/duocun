import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../product/product.service';
import { Category } from '../../shared/lb-sdk';

@Component({
  selector: 'app-admin-category-page',
  templateUrl: './admin-category-page.component.html',
  styleUrls: ['./admin-category-page.component.scss']
})
export class AdminCategoryPageComponent implements OnInit {
  categories: Category[] = [];
  category: Category;

  constructor(private productSvc: ProductService) { }

  ngOnInit() {
    this.updateCategoryList();
  }

  add() {
    this.category = new Category();
  }

  onAfterSave(event) {
    this.updateCategoryList();
  }

  onSelect(event) {
    this.category = event.category;
  }

  updateCategoryList() {
    const self = this;
    this.productSvc.findCategories().subscribe(
      (r: Category[]) => {
        self.categories = r;
      },
      (err: any) => {
        self.categories = [];
      });
  }
}
