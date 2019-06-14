import { TestBed, inject } from '@angular/core/testing';

import { OrderSequenceService } from './order-sequence.service';

describe('OrderSequenceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderSequenceService]
    });
  });

  it('should be created', inject([OrderSequenceService], (service: OrderSequenceService) => {
    expect(service).toBeTruthy();
  }));
});
