import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveOrderDialogComponent } from './remove-order-dialog.component';

describe('RemoveOrderDialogComponent', () => {
  let component: RemoveOrderDialogComponent;
  let fixture: ComponentFixture<RemoveOrderDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveOrderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
