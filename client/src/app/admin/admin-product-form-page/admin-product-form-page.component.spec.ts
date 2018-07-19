import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductFormPageComponent } from './admin-product-form-page.component';

describe('AdminProductFormPageComponent', () => {
  let component: AdminProductFormPageComponent;
  let fixture: ComponentFixture<AdminProductFormPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminProductFormPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminProductFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
