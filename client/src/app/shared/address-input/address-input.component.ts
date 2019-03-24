// output addrChange({addr:x, sAddr:'Formatted address string'})

import { Component, OnInit, ViewChild, OnChanges, ElementRef, Output, EventEmitter, Input, SimpleChange } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormBuilder } from '@angular/forms';
// import { LocationService } from '../location/location.service';
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

  // @ViewChild('div') div: ElementRef;
  @Output() addrChange = new EventEmitter();
  @Output() addrClear = new EventEmitter();
  @Output() inputFocus = new EventEmitter();
  @Input() value;

  placeForm;
  placeholder: string;
  gAutocomplete: any;
  input: string;
  bClearBtn = false;

  // private cleared = true;
  constructor(
    private fb: FormBuilder
  ) {
    this.placeForm = this.fb.group({
      addr: ['']
    });
  }

  ngOnInit() {
    this.placeForm.get('addr').patchValue(this.input);
  }

  ngOnChanges(changes) {
    const v = changes.value.currentValue;
    if (v && v.length > 0) {
      this.bClearBtn = true;
    } else {
      this.bClearBtn = false;
    }
    this.placeForm.get('addr').patchValue(v);
  }

  onValueChange(e) {
    const v = e.target.value;
    if (v && v.length > 0) {
      this.bClearBtn = true;
    } else {
      this.bClearBtn = false;
    }

    if (v && v.length >= 3) {
      this.addrChange.emit({ 'input': v });
    } else if (!v || v.length === 0) {
      this.inputFocus.emit();
    }
  }

  onFocus(e) {
    if (!e.target.value) {
      this.inputFocus.emit();
    }
  }

  clearAddr() {
    this.input = '';
    this.placeForm.get('addr').patchValue(this.input);
    this.addrClear.emit();
    this.bClearBtn = false;
  }
}
