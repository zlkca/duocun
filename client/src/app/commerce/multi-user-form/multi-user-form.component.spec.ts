import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiUserFormComponent } from './multi-user-form.component';

describe('MultiUserFormComponent', () => {
  let component: MultiUserFormComponent;
  let fixture: ComponentFixture<MultiUserFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiUserFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
