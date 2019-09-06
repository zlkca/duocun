// output addrChange({addr:x, sAddr:'Formatted address string'})

import { Component, OnInit, ViewChild, OnChanges, ElementRef, Output, EventEmitter, Input, SimpleChange } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss']
})
export class AddressInputComponent implements OnInit, OnChanges {

  @Input() placeholder: string;
  @Output() addrChange = new EventEmitter();
  @Output() addrClear = new EventEmitter();
  @Output() inputFocus = new EventEmitter();
  @Output() backHistory = new EventEmitter();
  @Input() value;
  @ViewChild('search', {static: true}) addressInput: ElementRef;

  placeForm;
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
    const self = this;
    if (this.input !== undefined) {
      this.placeForm.get('addr').patchValue(this.input);
    }
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
    const self = this;
    const v = e.target.value;
    if (v && v.length > 0) {
      this.bClearBtn = true;
    } else {
      this.bClearBtn = false;
    }

    if (v && v.length >= 3) {
      this.addrChange.emit({ 'input': v });
    } else if (!v || v.length === 0) {
      this.inputFocus.emit(); // used for show location list
      self.addrClear.emit();
      setTimeout(() => { // this will make the execution after the above boolean has changed
        self.addressInput.nativeElement.focus();
      }, 0);
    }
  }

  onFocus(e) {
    this.inputFocus.emit({ 'input': e.target.value });
  }

  clearAddr() {
    const self = this;
    this.input = '';
    if (this.bClearBtn) {
      this.placeForm.get('addr').patchValue(this.input);
      this.bClearBtn = false;
      self.addrClear.emit();
      setTimeout(() => { // this will make the execution after the above boolean has changed
        self.addressInput.nativeElement.focus();
      }, 0);
    }
  }

  back() {
    this.backHistory.emit();
  }
}
