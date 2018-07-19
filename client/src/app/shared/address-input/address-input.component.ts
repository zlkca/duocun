// output addrChange({addr:x, sAddr:'Formatted address string'})

import { Component, OnInit, ViewChild, AfterViewInit, OnChanges, ElementRef, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

declare var google;

// export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
//     provide: NG_VALUE_ACCESSOR,
//     useExisting: forwardRef(() => AddressInputComponent),
//     multi: true
// };

@Component({
    selector: 'address-input',
    templateUrl: './address-input.component.html',
    styleUrls: ['./address-input.component.scss']
})
export class AddressInputComponent implements OnInit {

    @ViewChild('div') div: ElementRef;
    @Output() addrChange = new EventEmitter();

    gAutocomplete: any;

    //The internal data model for form control value access
    private innerValue: any = '';

    constructor() { }

    ngOnInit() {
        let self = this;
        if (typeof google !== 'undefined') {
            // var defaultBounds = new google.maps.LatLngBounds(
            //   new google.maps.LatLng(43.821662, -79.928525),
            //   new google.maps.LatLng(43.494848, -79.133542));

            var options = {
                // strictBounds to GTA area
                bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(43.468068, -79.963410),
                    new google.maps.LatLng(44.301441, -78.730195)
                ),
                componentRestrictions: { country: "ca" },
                strictBounds: true
            };

            if (this.div) {
                var input = this.div.nativeElement;
                // var searchBox = new google.maps.places.SearchBox(input, {
                //   bounds: defaultBounds
                // });

                //   this.gAutocomplete = new google.maps.places.Autocomplete(input, {bounds:defaultBounds});
                this.gAutocomplete = new google.maps.places.Autocomplete(input, options);
                this.gAutocomplete.addListener('place_changed', () => {
                    let place = self.gAutocomplete.getPlace();
                    let addr = { street_number: '', street_name: '', sub_locality: '', city: '', province: '', postal_code: '', lat: '', lng: '' };
                    for (let compo of place.address_components) {
                        // switch(compo.types[0]){
                        //   case 'street_number':addr.streetNum = compo.long_name; break;
                        //   case 'route':addr.street = compo.long_name; break;
                        //   case 'sublocality_level_1': addr.sublocality = compo.long_name; break;
                        //   case 'locality': addr.city = compo.long_name; break;
                        //   case 'province': addr.province = compo.long_name; break;
                        //   case 'postal_code': addr.postalCode = compo.long_name; break;
                        // }

                        if (compo.types.indexOf('street_number') != -1) {
                            addr.street_number = compo.long_name;
                        }
                        if (compo.types.indexOf('route') != -1) {
                            addr.street_name = compo.long_name;
                        }
                        if (compo.types.indexOf('postal_code') != -1) {
                            addr.postal_code = compo.long_name;
                        }
                        if (compo.types.indexOf('sublocality_level_1') != -1 || compo.types.indexOf('sublocality') != -1) {
                            addr.sub_locality = compo.long_name;
                        }
                        if (compo.types.indexOf('locality') != -1) {
                            addr.city = compo.long_name;
                        }
                        if (compo.types.indexOf('administrative_area_level_1') != -1) {
                            addr.province = compo.long_name;
                        }

                        addr.lat = place.geometry.location.lat();
                        addr.lng = place.geometry.location.lng();

                    }
                    let sAddr = `${addr.street_number} ${addr.street_name}, ${addr.sub_locality}, ${addr.province}, ${addr.postal_code}`;

                    self.addrChange.emit({ addr: addr, sAddr: sAddr });
                    // self.commerceServ.getLocation(sAddr).subscribe(ret=>{
                    //     if(ret && ret.lat && ret.lng){
                    //       addr.lat = ret.lat;
                    //       addr.lng = ret.lng;
                    //       // localStorage.setItem('location-'+APP, JSON.stringify(addr));

                    //       let locality = ret.sub_locality;
                    //       // if(locality){
                    //       //   self.sharedServ.emitMsg({name:'OnUpdateHeader', 'locality':locality});
                    //       // }else{
                    //       //   locality = ret.locality
                    //       //   self.sharedServ.emitMsg({name:'OnUpdateHeader', 'locality':locality});
                    //       // }

                    //       //self.router.navigate(['restaurants']);
                    //     }else{

                    //     }
                    // });
                });
            }//end of if

        }

    }

    // onChange(v){
    // 	let k = v;
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

}
