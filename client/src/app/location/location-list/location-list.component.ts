import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LocationService } from '../location.service';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit {

  @Input() places;
  @Input() account;
  @Output() placeSeleted = new EventEmitter();

  address;

  constructor(
    private locationSvc: LocationService
  ) { }

  ngOnInit() {
  }

  onSelectPlace(place: any) {
    const self = this;
    const address = self.locationSvc.getAddrString(place.location); // set address text to input
    if (place.type === 'suggest') {
      this.locationSvc.reqLocationByAddress(address).then(r => {
        self.placeSeleted.emit({address: address, location: r});
        if (self.account) {
          self.locationSvc.save({
            userId: self.account.id, type: 'history',
            placeId: r.place_id, location: r, created: new Date()
          }).subscribe(x => {
          });
        }
      });
    } else if (place.type === 'history') {
      const r = place.location;
      self.placeSeleted.emit({address: address, location: r});
    }
  }
}
