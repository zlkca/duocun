import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommerceService } from './commerce.service';
import { environment } from '../../environments/environment';

const APP = environment.APP;
const API_URL = environment.API_URL;


describe('CommerceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommerceService],
      imports:[HttpClientTestingModule],
    });
  });

  it('should be created', inject([CommerceService], (service: CommerceService) => {
    expect(service).toBeTruthy();
  }));
});
