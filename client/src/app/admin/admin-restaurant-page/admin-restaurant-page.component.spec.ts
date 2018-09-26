import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRestaurantPageComponent } from './admin-restaurant-page.component';

describe('AdminRestaurantPageComponent', () => {
  let component: AdminRestaurantPageComponent;
  let fixture: ComponentFixture<AdminRestaurantPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminRestaurantPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRestaurantPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
