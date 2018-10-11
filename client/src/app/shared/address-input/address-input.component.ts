// output addrChange({addr:x, sAddr:'Formatted address string'})

import { Component, OnInit, ViewChild, OnChanges, ElementRef, Output, EventEmitter, Input, SimpleChange } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LocationService } from '../location/location.service';
declare var google;

// export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
//     provide: NG_VALUE_ACCESSOR,
//     useExisting: forwardRef(() => AddressInputComponent),
//     multi: true
// };

@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss']
})
export class AddressInputComponent implements OnInit, OnChanges {

  @ViewChild('div') div: ElementRef;
  @Output() addrChange = new EventEmitter();
  @Input() placeholder;
  @Input() value;

  gAutocomplete: any;

  // The internal data model for form control value access
  private innerValue: any = '';

  constructor(private locationSvc: LocationService, elm: ElementRef) {
    const placeholder = elm.nativeElement.getAttribute('placeholder');
  }

  ngOnInit() {
    const self = this;
    this.div.nativeElement.value = this.value;

    if (typeof google !== 'undefined') {
      // var defaultBounds = new google.maps.LatLngBounds(
      //   new google.maps.LatLng(43.821662, -79.928525),
      //   new google.maps.LatLng(43.494848, -79.133542));

      const options = {
        // strictBounds to GTA area
        bounds: new google.maps.LatLngBounds(
          new google.maps.LatLng(43.468068, -79.963410),
          new google.maps.LatLng(44.301441, -78.730195)
        ),
        componentRestrictions: { country: 'ca' },
        strictBounds: true
      };

      if (this.div) {
        const input = this.div.nativeElement;
        // var searchBox = new google.maps.places.SearchBox(input, {
        //   bounds: defaultBounds
        // });

        //   this.gAutocomplete = new google.maps.places.Autocomplete(input, {bounds:defaultBounds});
        this.gAutocomplete = new google.maps.places.Autocomplete(input, options);
        this.gAutocomplete.addListener('place_changed', () => {
          const geocodeResult = self.gAutocomplete.getPlace();
          const addr = self.locationSvc.getLocationFromGeocode(geocodeResult);
          if (addr) {
            const sAddr = self.locationSvc.getAddrString(addr);
            // `${addr.street_number} ${addr.street_name}, ${addr.sub_locality}, ${addr.province}, ${addr.postal_code}`;

            self.addrChange.emit({ addr: addr, sAddr: sAddr });
          } else {
            self.addrChange.emit(null);
          }
        });
      }

    }

  }


  ngOnChanges(changes) {
    this.div.nativeElement.value = changes.value.currentValue;
  }
  //  //From ControlValueAccessor interface

  //  writeValue(value: any) {
  //      this.innerValue = value;
  //  }

  //  //From ControlValueAccessor interface
  //  registerOnChange(fn: any) {
  //      this.onChange = fn;
  //  }

  //  //From ControlValueAccessor interface
  //  registerOnTouched(fn: any) {

  //  }

}
