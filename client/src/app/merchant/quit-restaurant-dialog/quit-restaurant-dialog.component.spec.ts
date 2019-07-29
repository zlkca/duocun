import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuitRestaurantDialogComponent } from './quit-restaurant-dialog.component';

describe('QuitRestaurantDialogComponent', () => {
  let component: QuitRestaurantDialogComponent;
  let fixture: ComponentFixture<QuitRestaurantDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuitRestaurantDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuitRestaurantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
