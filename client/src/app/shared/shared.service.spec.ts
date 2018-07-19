import { TestBed, inject } from '@angular/core/testing';

import { SharedService } from './shared.service';

describe('SharedService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedService]
    });
  });

  it('should be created', inject([SharedService], (service: SharedService) => {
    expect(service).toBeTruthy();
  }));

  it('should be created', inject([SharedService], (service: SharedService) => {
  	service.emitMsg('Hello');
  	service.getMsg().subscribe(r=>{
  		expect(r).toBeTruthy('Hello');
  	})
    
  }));

});
