import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductService } from '../product.service';
import { Category } from '../../shared/lb-sdk';
import { SharedService } from '../../shared/shared.service';

@Component({
  providers: [ProductService],
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  @Input() categories: Category[];
  @Output() select = new EventEmitter();
  fields: string[] = [];

  constructor(private sharedServ: SharedService,
    private productSvc: ProductService) { }

  ngOnInit() {
    const self = this;
    const category = new Category();
    this.fields = Object.getOwnPropertyNames(category);

  }

  onSelect(c) {
    this.select.emit({ category: c });
  }
}

