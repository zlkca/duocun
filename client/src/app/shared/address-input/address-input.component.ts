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
  @Input() value;
  @ViewChild('search') searchElement: ElementRef;

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
    const self = this;
    this.input = '';
    this.placeForm.get('addr').patchValue(this.input);
    this.addrClear.emit();
    this.bClearBtn = false;
    setTimeout(() => { // this will make the execution after the above boolean has changed
      self.searchElement.nativeElement.focus();
    }, 0);
  }
}
