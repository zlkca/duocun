export interface ILocation {
  place_id: string;
  city: string;
  lat: number;
  lng: number;
  postal_code: string;
  province: string;
  street_name: string;
  street_number: string;
  sub_locality: string;
}

export interface ILatLng {
  lat: number;
  lng: number;
}

export interface IPlaceTerm {
  offset: number;
  value: string;
}

export interface IPlace {
  id: string;
  description: string;
  place_id: string;
  terms: IPlaceTerm[];
}

export interface ILocationHistory {
  userId: string;
  placeId: string;
  location: ILocation;
  created: Date;
  type: string;
}
