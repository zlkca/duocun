import { Component, OnInit, ViewChild, OnChanges, ElementRef, Output, EventEmitter, Input, SimpleChange } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ILocation } from '../../location/location.model';
import { LocationService } from '../../location/location.service';
declare var google;
@Component({
  selector: 'app-address-autocomplete',
  templateUrl: './address-autocomplete.component.html',
  styleUrls: ['./address-autocomplete.component.scss']
})
export class AddressAutocompleteComponent implements OnInit {

  @ViewChild('div', {static: true}) div: ElementRef;
  @Output() addrChange = new EventEmitter();
  @Input() value;

  placeholder: string;
  gAutocomplete: any;

  // The internal data model for form control value access
  private innerValue: any = '';

  constructor(
    private elm: ElementRef,
    private locationSvc: LocationService
  ) {
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
        bounds: new google.maps.LatLngBounds(
          // GTA
          new google.maps.LatLng(43.468068, -79.963410),
          new google.maps.LatLng(44.301441, -78.730195)
          // Ontario
          // new google.maps.LatLng(41.668068, -95.163410),
          // new google.maps.LatLng(56.861441, -74.340195)
        ),
        componentRestrictions: { country: 'ca' },
        strictBounds: true
      };

      if (this.div) {
        const input = this.div.nativeElement;
        this.gAutocomplete = new google.maps.places.Autocomplete(input, options);
        this.gAutocomplete.addListener('place_changed', () => {
          const geocodeResult = self.gAutocomplete.getPlace();
          const addr = self.getLocationFromGeocode(geocodeResult);
          if (addr) {
            const sAddr = self.locationSvc.getAddrString(addr);
            self.addrChange.emit({ addr: addr, sAddr: sAddr });
          } else {
            self.addrChange.emit(null);
          }
        });
      }
    }
  }

  // ngOnChanges(changes) {
  //   this.div.nativeElement.value = changes.value.currentValue;
  // }
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
      const loc: ILocation = {
        placeId: '',
        streetNumber: '',
        streetName: '',
        subLocality: '',
        city: '',
        province: '',
        postalCode: '',
        lat: typeof oLocation.lat === 'function' ? oLocation.lat() : oLocation.lat,
        lng: typeof oLocation.lng === 'function' ? oLocation.lng() : oLocation.lng
      };

      addr.forEach(compo => {
        if (compo.types.indexOf('street_number') !== -1) {
          loc.streetNumber = compo.short_name;
        }
        if (compo.types.indexOf('route') !== -1) {
          loc.streetName = compo.short_name;
        }
        if (compo.types.indexOf('postal_code') !== -1) {
          loc.postalCode = compo.short_name;
        }
        if (compo.types.indexOf('sublocality_level_1') !== -1 && compo.types.indexOf('sublocality') !== -1) {
          loc.subLocality = compo.short_name;
        }
        if (compo.types.indexOf('locality') !== -1) {
          loc.city = compo.short_name;
        }
        if (compo.types.indexOf('administrative_area_level_1') !== -1) {
          loc.province = compo.short_name;
        }
      });
      return loc;
    } else {
      return null;
    }
  }

  clearAddr() {
    this.div.nativeElement.value = '';
  }

}
