import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Mall } from '../mall.model';

@Component({
  selector: 'app-mall-list',
  templateUrl: './mall-list.component.html',
  styleUrls: ['./mall-list.component.scss']
})
export class MallListComponent implements OnInit {

  @Input() malls: Mall[];
  @Output() select = new EventEmitter();
  @Output() afterDelete = new EventEmitter();
  selected = null;
  fields: string[] = [];

  constructor() { }

  ngOnInit() {
    const self = this;
    const mall = new Mall();
    this.fields = Object.getOwnPropertyNames(mall);

  }

  onSelect(c) {
    this.select.emit({ mall: c });
    this.selected = c;
  }

  delete(c) {
    // this.productSvc.rmCategory(c.id).subscribe(x => {
    //   this.afterDelete.emit({mall: c});
    //   this.selected = null;
    // });
  }
}

// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { ProductService } from '../product.service';
// import { Mall } from '../../lb-sdk';
// import { SharedService } from '../../shared/shared.service';

// @Component({
//   providers: [ProductService],
//   selector: 'app-mall-list',
//   templateUrl: './mall-list.component.html',
//   styleUrls: ['./mall-list.component.scss']
// })
// export class CategoryListComponent implements OnInit {


//   constructor(private sharedServ: SharedService,
//     private productSvc: ProductService) { }



// }

