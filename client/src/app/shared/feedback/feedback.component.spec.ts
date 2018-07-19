import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterModule, Router } from '@angular/router';
import { AccountService } from '../../account/account.service';
import { SharedService } from '../shared.service';

import { FeedbackComponent } from './feedback.component';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[RouterTestingModule, FormsModule, HttpClientTestingModule],
      declarations: [ FeedbackComponent ],
      providers:[{provider:AccountService, useClass:AccountService}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', inject([AccountService],(AccountService) => {
  //   expect(component).toBeTruthy();
  // }));
});
