import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMallPageComponent } from './admin-mall-page.component';

describe('AdminMallPageComponent', () => {
  let component: AdminMallPageComponent;
  let fixture: ComponentFixture<AdminMallPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminMallPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMallPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
