import { Component, OnInit } from '@angular/core';

import { AuthService } from './account/auth.service';
import { environment } from '../environments/environment';

const APP = environment.APP;

@Component({
  providers: [AuthService],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  constructor(
  ) {
    window.addEventListener('orientationchange', function () {
      window.location.reload();
    }, false);
  }

  ngOnInit() {

  }
}
