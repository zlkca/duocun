import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { BlogService } from '../blog.service';
import { PostFormComponent } from './post-form.component';

describe('PostFormComponent', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostFormComponent ],
      imports:[FormsModule, RouterTestingModule, HttpClientTestingModule],
      providers:[{provide:BlogService, useClass:BlogService}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', inject([BlogService, HttpTestingController], 
      (service: BlogService, httpMock:HttpTestingController) => {
    expect(component).toBeTruthy();
  }));
});
