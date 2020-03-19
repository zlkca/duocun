import { TestBed, inject } from '@angular/core/testing';
import { SharedService } from './shared.service';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import * as moment from 'moment';

describe('SharedService', () => {
  let svc: SharedService;
  beforeEach(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

    TestBed.configureTestingModule({
      providers: [SharedService]
    });
    svc = new SharedService();
  });

  it('should be created', inject([SharedService], (service: SharedService) => {
    expect(service).toBeTruthy();
  }));

  it('should setLocalTime', () => {
    const m = moment();
    const t = svc.setLocalTime(m, '11:20');
    expect(t.minute()).toBe(20);
    expect(t.hour()).toBe(11);
  });

  it('should getDeliveryDateTimeByPhase', () => {
    const c = '2020-03-16T20:44:01.000Z';
    const phases = [{ orderEnd: '10:45', pickup: '11:20' }];
    const s = svc.getDeliveryDateTimeByPhase(c, phases, 'today');
    expect(s.deliverDate).toBe('2020-03-16');
    expect(s.deliverTime).toBe('11:20:00');
  });
});
