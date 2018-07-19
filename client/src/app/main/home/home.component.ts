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

  @ViewChild('div') div: ElementRef;

  ngOnInit() {
    let self = this;
    // this.commerceServ.getRestaurantList().subscribe(
    //     (r:Restaurant[]) => {
    //         self.restaurantList = r;

    //         let a = [];
    //         r.map(restaurant=>{ a.push({lat:parseFloat(restaurant.address.lat), lng:parseFloat(restaurant.address.lng)}) });
    //         self.places = a;
    //     },
    //     (err:any) => {
    //         self.restaurantList = [];
    //     });




    /*
    if (s) {
      this.router.navigate(['restaurants']);
    } else {

      if (typeof google !== 'undefined') {
        var defaultBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(43.821662, -79.928525),
          new google.maps.LatLng(43.494848, -79.133542));

        if (this.div) {
          var input = this.div.nativeElement;//document.getElementById('userlocationinput');

          // var searchBox = new google.maps.places.SearchBox(input, {
          //   bounds: defaultBounds
          // });

          this.gAutocomplete = new google.maps.places.Autocomplete(input, { bounds: defaultBounds });
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

            self.commerceServ.getLocation(sAddr).subscribe(ret => {
              if (ret && ret.lat && ret.lng) {
                addr.lat = ret.lat;
                addr.lng = ret.lng;
                localStorage.setItem('location-' + APP, JSON.stringify(addr));

                let locality = ret.sub_locality;
                if (locality) {
                  self.sharedServ.emitMsg({ name: 'OnUpdateHeader', 'locality': locality });
                } else {
                  locality = ret.locality
                  self.sharedServ.emitMsg({ name: 'OnUpdateHeader', 'locality': locality });
                }

                self.router.navigate(['restaurants']);
              } else {

              }
            });
          });
        }
      }
    }
    */
  }



  constructor(private router: Router,
    private commerceServ: CommerceService,
    private sharedServ: SharedService,
    private locationSvc: LocationService) {
    let self = this;
    // this.sharedServ.getMsg().subscribe(msg => {
    //     if('OnSearch' === msg.name){
    //         if(msg.query){
    //           self.filter = msg.query;
    //           let query = {...self.filter, ...self.query};
    //           self.doSearch(query);
    //         }else{
    //             self.doSearch(self.query.keyword);
    //         }
    //     }
    // });


  }

  search(e?) {
    if (e && e.addr) {
      this.locationSvc.set(e.addr);
      this.router.navigate(['restaurants']);
    } else {
      this.locationSvc.getCurrentPosition()
        .then(() => {
          this.router.navigate(['restaurants']);
        });
    }
  }

  seachByLocation(keyword: string) {
    //self.commerceServ.getLocation()
  }

  // search(keyword:string){
  //   let self = this;
  //   this.query = {'keyword': keyword};
  //   let query = {...self.filter, ...self.query};
  //   self.doSearch(query);
  // }


  // getFilter(query?:any){
  //   let qs = [];

  //   if(query.categories && query.categories.length>0){
  //     let s = query.categories.join(',');
  //     qs.push('cats=' + s);
  //   }

  //   // if(query.restaurants && query.restaurants.length>0){
  //   //   let s = query.restaurants.join(',');
  //   //   qs.push('ms=' + s);
  //   // }

  //   // if(query.colors && query.colors.length>0){
  //   //   let s = query.colors.join(',');
  //   //   qs.push('colors=' + s);
  //   // }
  //   return qs;
  // }

  // doSearch(query?:any){
  //     //query --- eg. {'status':'active','user_id':self.user_id}
  //     let self = this;
  //     let qs = self.getFilter(query);

  //     if(qs.length>0){
  //       query = '?' + qs.join('&');
  //       if(this.query && this.query.keyword){
  //         query += '&keyword=' + this.query.keyword;
  //       }
  //     }else{
  //       if(this.query && this.query.keyword){
  //         query = '?keyword=' + this.query.keyword;
  //       }else{
  //         query = null;
  //       }
  //     }

  //     self.commerceServ.getRestaurantList(query).subscribe(
  //         (ps:Restaurant[]) => {
  //             self.restaurantList = ps;//self.toProductGrid(data);
  //         },
  //         (err:any) => {
  //             self.restaurantList = [];
  //         }
  //     );
  //   }
}
