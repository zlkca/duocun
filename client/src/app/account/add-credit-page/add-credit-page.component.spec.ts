import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCreditPageComponent } from './add-credit-page.component';

describe('AddCreditPageComponent', () => {
  let component: AddCreditPageComponent;
  let fixture: ComponentFixture<AddCreditPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCreditPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCreditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
