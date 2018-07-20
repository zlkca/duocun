import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductListPageComponent } from './admin-product-list-page.component';

describe('AdminProductListPageComponent', () => {
  let component: AdminProductListPageComponent;
  let fixture: ComponentFixture<AdminProductListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminProductListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminProductListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
