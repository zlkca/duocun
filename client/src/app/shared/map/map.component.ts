import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { IRange } from '../../range/range.model';

declare let google: any;
declare let MarkerClusterer: any;

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

  constructor() { }

  ngOnInit() {
    this.initMap();
  }

  ngOnChanges() {
    this.initMap();
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

        // const latlng = new google.maps.LatLng(43.849145, -79.383656);
        // const labelText = '免运费服务区';
        // const mapLabel = new google.maps.MapLabel({
        //   text: 'Test',
        //   position: latlng,
        //   map: map,
        //   fontSize: 35,
        //   align: 'right'
        // });
        // mapLabel.set('position', latlng);
        // const marker2 = new google.maps.Marker();
        // marker2.bindTo('map', mapLabel);
        // marker2.bindTo('position', mapLabel);
        // const myOptions = {
        //   content: labelText,
        //   boxStyle: {
        //     border: "none",
        //     textAlign: "center",
        //     fontSize: "10pt",
        //     width: "50px"
        //   },
        //   disableAutoPan: true,
        //   pixelOffset: new google.maps.Size(-25, -5),
        //   position: latlng,
        //   closeBoxURL: "",
        //   isHidden: false,
        //   pane: "floatPane",
        //   enableEventPropagation: true
        // };

        // const ibLabel = new google.maps.InfoBox(myOptions);
        // ibLabel.open(map);
      }

      if (this.places && this.places.length) {
        // var infowindow = new google.maps.InfoWindow({
        //   content: contentString
        // });

        // var marker = new google.maps.Marker({
        //   position: uluru,
        //   map: map,
        //   title: 'Uluru (Ayers Rock)'
        // });
        // marker.addListener('click', function() {
        //   infowindow.open(map, marker);
        // });

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

        // const markerCluster = new MarkerClusterer(map, markers,
        //   { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });

      }// end of this.places

    }
  }

}
