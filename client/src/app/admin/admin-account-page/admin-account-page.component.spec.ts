import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAccountPageComponent } from './admin-account-page.component';

describe('AdminAccountPageComponent', () => {
  let component: AdminAccountPageComponent;
  let fixture: ComponentFixture<AdminAccountPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAccountPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAccountPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
