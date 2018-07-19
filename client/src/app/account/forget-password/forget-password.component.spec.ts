import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SharedService } from '../../shared/shared.service';
import { AuthService } from '../auth.service';
import { ForgetPasswordComponent } from './forget-password.component';



describe('ForgetPasswordComponent', () => {
  let component: ForgetPasswordComponent;
  let fixture: ComponentFixture<ForgetPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
     declarations: [ ForgetPasswordComponent ],
      imports:[ FormsModule, RouterTestingModule, HttpClientTestingModule ],
      providers: [ 
        { provide: AuthService, useClass: AuthService },
        { provide: SharedService, useClass: SharedService} ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
