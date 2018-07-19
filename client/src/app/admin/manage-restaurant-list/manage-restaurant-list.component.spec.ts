import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRestaurantListComponent } from './manage-restaurant-list.component';

describe('ManageRestaurantListComponent', () => {
  let component: ManageRestaurantListComponent;
  let fixture: ComponentFixture<ManageRestaurantListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageRestaurantListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageRestaurantListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
