import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MallListComponent } from './mall-list.component';

describe('MallListComponent', () => {
  let component: MallListComponent;
  let fixture: ComponentFixture<MallListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MallListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MallListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
