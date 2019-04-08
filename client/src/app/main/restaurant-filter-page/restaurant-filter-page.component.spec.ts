import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantFilterPageComponent } from './restaurant-filter-page.component';

describe('RestaurantFilterPageComponent', () => {
  let component: RestaurantFilterPageComponent;
  let fixture: ComponentFixture<RestaurantFilterPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestaurantFilterPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantFilterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
