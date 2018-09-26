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
    this.loadCategoryList();
  }

  add() {
    this.category = new Category();
    this.category.id = null;
    this.category.name = '';
    this.category.description = '';
  }

  onAfterSave(event) {
    this.loadCategoryList();
  }

  onAfterDelete(event) {
    this.loadCategoryList();
    if (event.category.id === this.category.id) {
      this.category = new Category();
      this.category.id = null;
      this.category.name = '';
      this.category.description = '';
    }
  }

  onSelect(event) {
    this.category = event.category;
  }

  loadCategoryList() {
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
