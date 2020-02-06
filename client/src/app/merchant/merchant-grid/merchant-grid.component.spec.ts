import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantGridComponent } from './merchant-grid.component';

describe('MerchantGridComponent', () => {
  let component: MerchantGridComponent;
  let fixture: ComponentFixture<MerchantGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
