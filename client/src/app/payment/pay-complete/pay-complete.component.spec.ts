import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayCompleteComponent } from './pay-complete.component';

describe('PayCompleteComponent', () => {
  let component: PayCompleteComponent;
  let fixture: ComponentFixture<PayCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
