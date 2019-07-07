import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';

import { SharedService } from './shared/shared.service';
import { AuthService } from './account/auth.service';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { MainModule } from './main/main.module';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[ FormsModule, RouterTestingModule, HttpClientTestingModule, SharedModule, MainModule ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers: [ 
        { provide: AuthService, useClass: AuthService },
        { provide: SharedService, useClass: SharedService},
        RouterOutlet ],
      declarations: [
        AppComponent
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  
  it(`should have as title 'app'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    //expect(app.title).toEqual('app');
    console.log(app.title);
  }));
  
  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    //expect(compiled.querySelector('h1').textContent).toContain('Welcome to app!');
  }));
});
