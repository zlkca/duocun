import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductService } from '../product.service';
import { Category } from '../../lb-sdk';
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
  @Output() afterDelete = new EventEmitter();
  selected = null;
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
    this.selected = c;
  }

  delete(c) {
    this.productSvc.rmCategory(c.id).subscribe(x => {
      this.afterDelete.emit({category: c});
      this.selected = null;
    });
  }

}

