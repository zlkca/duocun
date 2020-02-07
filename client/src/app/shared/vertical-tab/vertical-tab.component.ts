import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-vertical-tab',
  templateUrl: './vertical-tab.component.html',
  styleUrls: ['./vertical-tab.component.scss']
})
export class VerticalTabComponent implements OnInit {
  @Input() items;
  @Output() select = new EventEmitter();
  @Input() selected;

  constructor() { }

  ngOnInit() {

  }

  onSelect(it) {
    this.selected = it;
    this.select.emit(it);
  }
}
