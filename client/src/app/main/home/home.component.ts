import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommerceService } from '../../commerce/commerce.service';
import { Restaurant } from '../../commerce/commerce';
import { SharedService } from '../../shared/shared.service';
import { AuthService } from '../../account/auth.service';
import { environment } from '../../../environments/environment';
import { LocationService } from '../../shared/location/location.service';


declare var google;
const APP = environment.APP;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    providers: [AuthService, LocationService],
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    keyword: string;
    query: any;
    filter: any;
    restaurantList: Restaurant[];
    places: any[] = [];
    center: any;
    gAutocomplete: any;
    coords: any;
    geoError: any;
    @ViewChild('div') div: ElementRef;

    ngOnInit() {
        const self = this;

        const s = localStorage.getItem('location-' + APP);
        if (s) {
            self.router.navigate(['restaurants']);
        } else {
            self.router.navigate(['home']);
        }

        // testing
        // Chrome no longer supports obtaining the user's location using
        // the HTML5 Geolocation API from pages delivered by non-secure connections.
        navigator.geolocation.getCurrentPosition(geo => {
          this.coords = geo;
        }, err => {
          this.geoError = err;
        }
      );
    }

    constructor(private router: Router,
        private commerceServ: CommerceService,
        private sharedServ: SharedService,
        private locationSvc: LocationService) {}

    search(e?) {
        const self = this;
        if (e && e.addr) {
            this.locationSvc.set(e.addr);
            this.router.navigate(['restaurants']);
        } else {
            this.locationSvc.getCurrentLocation().subscribe(r => {
                self.router.navigate(['restaurants']);
            },
            err => {
                alert('Do you want to turn on your GPS to find the nearest restaurants?');
            });
        }
    }


}
