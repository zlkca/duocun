import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LocationService } from '../location.service';
import { IPlace } from '../location.model';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit {

  @Input() places: IPlace[];
  @Input() account;
  @Output() placeSeleted = new EventEmitter();

  address;
  onDestroy$ = new Subject();
  constructor(
    private locationSvc: LocationService
  ) { }

  ngOnInit() {
  }

  onSelectPlace(place: IPlace) {
    const self = this;
    const address = place.structured_formatting.main_text + ', ' + place.structured_formatting.secondary_text;
    if (place.type === 'suggest') {
      this.locationSvc.reqLocationByAddress(address).pipe(takeUntil(this.onDestroy$)).subscribe(xs => {
        const r = this.locationSvc.getLocationFromGeocode(xs[0]);
        self.placeSeleted.emit({address: address, location: r});
      });
    } else if (place.type === 'history') {
      const r = place.location;
      self.placeSeleted.emit({address: address, location: r});
    }
  }
}
