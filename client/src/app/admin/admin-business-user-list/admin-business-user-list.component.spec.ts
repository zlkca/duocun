import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBusinessUserListComponent } from './manage-business-user-list.component';

describe('ManageBusinessUserListComponent', () => {
  let component: ManageBusinessUserListComponent;
  let fixture: ComponentFixture<ManageBusinessUserListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageBusinessUserListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageBusinessUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
