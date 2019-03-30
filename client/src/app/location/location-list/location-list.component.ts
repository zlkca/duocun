import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LocationService } from '../location.service';
import { AuthService } from '../../account/auth.service';

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
    private locationSvc: LocationService,
    private authSvc: AuthService
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

        this.authSvc.setLocation(r);
      });
    } else if (place.type === 'history') {
      const r = place.location;
      this.authSvc.setLocation(r);
      self.placeSeleted.emit({address: address, location: r});
    }
  }
}
