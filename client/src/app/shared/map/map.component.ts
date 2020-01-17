import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { IRange } from '../../range/range.model';

declare let google: any;

const GREEN = '#188038';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnChanges {
  @Input() location: any;
  @Input() center: any;
  @Input() zoom: any;
  @Input() places: any[];
  @Input() ranges: IRange[];
  @Input() areas: any[];

  constructor() { }

  ngOnInit() {
    this.initMap();
  }

  ngOnChanges() {
    this.initMap();
  }

  showAreas(map) {
    if (this.areas && this.areas.length) {
      this.areas.map(area => {
        this.drawPolygon(area.coords, map);
      });
    }
  }

  drawPolygon(coords, map) {
    const polygon = new google.maps.Polygon({
      paths: coords,
      strokeColor: GREEN,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: GREEN,
      fillOpacity: 0.35
    });
    polygon.setMap(map);

    return polygon;
  }

  initMap() {
    const self = this;
    if (typeof google !== 'undefined') {
      const map = new google.maps.Map(document.getElementById('map'), {
        zoom: self.zoom,
        center: self.center,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      const marker = new google.maps.Marker({
        position: self.location,
        map: map,
        label: ''
      });

      if (this.ranges && this.ranges.length > 0) {
        this.ranges.map((r: any) => {
          const cityCircle = new google.maps.Circle({ // Add the circle for this city to the map.
            strokeColor: r.type === 'free' ? '#188038' : '#f4a000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: r.type === 'free' ? '#188038' : '#f4a000',
            fillOpacity: 0.35,
            map: map,
            center: { lat: +r.lat, lng: +r.lng },
            radius: r.radius * 1000
          });
        });


      }

      if (this.places && this.places.length) {
        this.places.map((location, i) => {
          const m = new google.maps.Marker({
            position: location,
            label: {
              text: self.places[i].name,
              fontSize: '11px'
            }
          });
          m.setMap(map);
        });
      }// end of this.places

      this.showAreas(map);
    }
  }

}
