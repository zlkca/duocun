import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageProductListPageComponent } from './manage-product-list-page.component';

describe('ManageProductListPageComponent', () => {
  let component: ManageProductListPageComponent;
  let fixture: ComponentFixture<ManageProductListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageProductListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageProductListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
