import { Restaurant } from '../restaurant/restaurant.model';
import { GeoPoint } from '../location/location.model';
import { Order } from '../order/order.model';
export interface IAccount {
  type: string; // wechat, google, fb
  realm?: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  id?: string;
  password?: string;
  sex?: string;
  openid?: string; // wechat openid
  imageurl?: string;
  unionid?: string; // wechat unionid
  accessTokens?: any[];
  // restaurants?: Restaurant[];
  // orders?: Order[];
  address?: IAddress;
}

export class Account implements IAccount {
  type: string;
  realm: string; // wechat, google, fb
  username: string;
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  id: string;
  password: string;
  sex?: string;
  openid?: string; // wechat openid
  imageurl?: string;
  unionid?: string; // wechat unionid
  accessTokens?: any[];
  // restaurants?: Restaurant[];
  // orders?: Order[];
  address?: Address;
  constructor(data?: IAccount) {
    Object.assign(this, data);
  }
}

export interface IAddress {
  formattedAddress?: string;
  unit?: number;
  streetName?: string;
  streetNumber?: string;
  location?: GeoPoint;
  sublocality?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  created?: Date;
  modified?: Date;
  id?: number;
}

export class Address implements IAddress {
  formattedAddress: string;
  unit: number;
  streetName: string;
  streetNumber: string;
  location: GeoPoint;
  sublocality: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  created: Date;
  modified: Date;
  id: number;
  constructor(data?: IAddress) {
    Object.assign(this, data);
  }
}
