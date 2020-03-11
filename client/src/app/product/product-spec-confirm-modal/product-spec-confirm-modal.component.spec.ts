import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSpecConfirmModalComponent } from './product-spec-confirm-modal.component';

describe('ProductSpecConfirmModalComponent', () => {
  let component: ProductSpecConfirmModalComponent;
  let fixture: ComponentFixture<ProductSpecConfirmModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductSpecConfirmModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSpecConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
