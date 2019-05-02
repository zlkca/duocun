import { TestBed, inject } from '@angular/core/testing';

import { RangeService } from './range.service';

describe('RangeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RangeService]
    });
  });

  it('should be created', inject([RangeService], (service: RangeService) => {
    expect(service).toBeTruthy();
  }));
});
