import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantDetailPageComponent } from './merchant-detail-page.component';

describe('MerchantDetailPageComponent', () => {
  let component: MerchantDetailPageComponent;
  let fixture: ComponentFixture<MerchantDetailPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantDetailPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
