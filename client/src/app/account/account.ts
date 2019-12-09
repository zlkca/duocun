export class User {
    _id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    portrait: string;
    type: string;
    password: string;
    constructor(o?: any) {
      if (o) {
          this._id = o._id;
          this.username = o.username;
          this.email = o.email;
          this.first_name = o.first_name;
          this.last_name = o.last_name;
          this.portrait = o.portrait;
          this.type = o.type;
          this.password = '';
      }
    }
}


export class Address {
    _id: string;
    street: string;
    postalCode: string;
    province: string;
    city: string;
    subLocality: string;
    lat: string;
    lng: string;

    constructor(o?: any) {
        if (o) {
            this._id = o._id;
            this.street = o.street;
            this.postalCode = o.postalCode;
            this.province = o.province;
            this.city = o.city;
            this.subLocality = o.subLocality;
            this.lat = o.lat;
            this.lng = o.lng;
        }
    }
}
