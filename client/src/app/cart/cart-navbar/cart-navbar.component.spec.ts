import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartNavbarComponent } from './cart-navbar.component';

describe('CartNavbarComponent', () => {
  let component: CartNavbarComponent;
  let fixture: ComponentFixture<CartNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
