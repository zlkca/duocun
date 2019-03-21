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
  @Output() addrClear = new EventEmitter();
  @Input() value;

  placeholder: string;
  gAutocomplete: any;

  // The internal data model for form control value access
  private innerValue: any = '';
  // private cleared = true;
  constructor(private locationSvc: LocationService, elm: ElementRef) {
    const placeholder = elm.nativeElement.getAttribute('placeholder');
  }

  ngOnInit() {
    const self = this;
    this.div.nativeElement.value = this.value;
    // this.cleared = !this.value;
    if (typeof google !== 'undefined') {
      // var defaultBounds = new google.maps.LatLngBounds(
      //   new google.maps.LatLng(43.821662, -79.928525),
      //   new google.maps.LatLng(43.494848, -79.133542));

      const options = {
        // strictBounds to GTA area
        bounds: new google.maps.LatLngBounds(
          // GTA
          new google.maps.LatLng(43.468068, -79.963410),
          new google.maps.LatLng(44.301441, -78.730195)
          // Ontario -95.16 | 41.66 |  -74.34 | 56.86
          // new google.maps.LatLng(41.668068, -95.163410),
          // new google.maps.LatLng(56.861441, -74.340195)
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
          const addr = self.getLocationFromGeocode(geocodeResult);
          if (addr) {
            const sAddr = self.getAddrString(addr);
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
    // this.cleared = !this.div.nativeElement.value;
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


  getLocationFromGeocode(geocodeResult): any {
    const addr = geocodeResult && geocodeResult.address_components;
    const oLocation = geocodeResult.geometry.location;
    if (addr && addr.length) {
      const loc: any = {
        street_number: '',
        street_name: '',
        sub_locality: '',
        city: '',
        province: '',
        postal_code: '',
        lat: typeof oLocation.lat === 'function' ? oLocation.lat() : oLocation.lat,
        lng: typeof oLocation.lng === 'function' ? oLocation.lng() : oLocation.lng
      };

      addr.forEach(compo => {
        if (compo.types.indexOf('street_number') !== -1) {
          loc.street_number = compo.long_name;
        }
        if (compo.types.indexOf('route') !== -1) {
          loc.street_name = compo.long_name;
        }
        if (compo.types.indexOf('postal_code') !== -1) {
          loc.postal_code = compo.long_name;
        }
        if (compo.types.indexOf('sublocality_level_1') !== -1 && compo.types.indexOf('sublocality') !== -1) {
          loc.sub_locality = compo.long_name;
        }
        if (compo.types.indexOf('locality') !== -1) {
          loc.city = compo.long_name;
        }
        if (compo.types.indexOf('administrative_area_level_1') !== -1) {
          loc.province = compo.long_name;
        }
      });
      return loc;
    } else {
      return null;
    }
  }

  getAddrString(location: any) {
    const city = location.sub_locality ? location.sub_locality : location.city;
    return location.street_number + ' ' + location.street_name + ', ' + city + ', ' + location.province;
    // + ', ' + location.postal_code;
  }

  clearAddr() {
    this.div.nativeElement.value = '';
    this.addrClear.emit();
  }
}
