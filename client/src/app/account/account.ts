export class User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    portrait: string;
    type: string;
    password: string;
    constructor(o?: any) {
      if (o) {
          this.id = o.id;
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
    id: string;
    street: string;
    postal_code: string;
    province: string;
    city: string;
    sub_locality: string;
    lat: string;
    lng: string;

    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            this.street = o.street;
            this.postal_code = o.postal_code;
            this.province = o.province;
            this.city = o.city;
            this.sub_locality = o.sub_locality;
            this.lat = o.lat;
            this.lng = o.lng;
        }
    }
}
