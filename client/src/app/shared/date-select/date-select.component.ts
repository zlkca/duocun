import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-date-select',
  templateUrl: './date-select.component.html',
  styleUrls: ['./date-select.component.scss']
})
export class DateSelectComponent implements OnInit {
  @Output() dateChange = new EventEmitter();
  @Input() selected;
  @Input() bOrderEnded;

  today;
  tomorrow;
  lang = environment.language;
  startTime = '11:45';
  endTime = '13:00';

  constructor() {
    this.today = { type: 'lunch today', date: moment().format('YYYY-MM-DD') };
    this.tomorrow = { type: 'lunch tomorrow', date: moment().add(1, 'days').format('YYYY-MM-DD') };
  }

  ngOnInit() {
  }

  onSelect(code) {
    if (code === 'L') {
      this.selected = 'L';
      this.dateChange.emit('L');
    } else {
      this.selected = 'R';
      this.dateChange.emit('R');
    }
  }
}
