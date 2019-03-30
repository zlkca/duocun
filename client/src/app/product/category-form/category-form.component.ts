import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../product.service';
import { Category } from '../../product/product.model';

@Component({
  providers: [ProductService],
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit, OnChanges {
  currentAccount: Account;
  form: FormGroup;

  @Input() category: Category;
  @Output() valueSave = new EventEmitter();

  createForm() {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(500)]
    });
  }

  constructor(private fb: FormBuilder,
    private productSvc: ProductService,
    private router: Router, private route: ActivatedRoute,
  ) {
    this.form = this.createForm();
  }

  ngOnChanges(changes) {
    if (this.form && changes.category.currentValue) {
      this.form.patchValue(changes.category.currentValue);
    }
  }

  ngOnInit() {
    const self = this;
    if (!this.category) {
      this.category = new Category();
    }
    this.form.patchValue(this.category);
  }

  save() {
    // This component will be used for business admin and super admin!
    const self = this;
    const v = this.form.value;
    const category = new Category(this.form.value);

    category.id = self.category ? self.category.id : null;

    if (category.id) {
      self.productSvc.replaceCategoryById(category.id, category).subscribe((r: any) => {
        self.valueSave.emit({ name: 'OnUpdateCategory' });
      });
    } else {
      self.productSvc.createCategory(category).subscribe((r: any) => {
        self.valueSave.emit({ name: 'OnUpdateCategory' });
      });
    }

  }

  cancel() {
    const self = this;
    self.form.patchValue(this.category);
  }
}

