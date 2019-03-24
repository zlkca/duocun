import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './account/auth.service';
import { SharedService } from './shared/shared.service';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
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
    private router: Router,
    private sharedSvc: SharedService,
    private authServ: AuthService
  ) {
    window.addEventListener('orientationchange', function () {
      window.location.reload();
    }, false);
  }

  ngOnInit() {

  }
}
