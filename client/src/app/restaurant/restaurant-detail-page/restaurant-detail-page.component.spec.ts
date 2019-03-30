import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantDetailPageComponent } from './restaurant-detail-page.component';

describe('RestaurantDetailPageComponent', () => {
  let component: RestaurantDetailPageComponent;
  let fixture: ComponentFixture<RestaurantDetailPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestaurantDetailPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
