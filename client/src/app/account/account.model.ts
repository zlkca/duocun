
import { GeoPoint } from '../location/location.model';

export enum Role {
  SUPER = 1,
  MERCHANT_ADMIN = 2,
  MERCHANT_STUFF = 3,
  MANAGER = 4,
  DRIVER = 5,
  CLIENT = 6,
  PREPAID_CLIENT = 7
}

export interface IAccount {
  _id?: string;
  id?: string;
  type: string; // wechat, google, fb
  realm?: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  password?: string;
  sex?: string;
  openid?: string; // wechat openid
  imageurl?: string;
  unionid?: string; // wechat unionid
  accessTokens?: any[];
  address?: IAddress;
  roles?: number[]; // 'super', 'merchant-admin', 'merchant-stuff', 'driver', 'user'
  visited?: boolean;
  stripeCustomerId?: string;
  pickupTime?: string;
}

export class Account implements IAccount {
  _id?: string;
  id: string;
  type: string;
  realm: string; // wechat, google, fb
  username: string;
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  password: string;
  sex?: string;
  openid?: string; // wechat openid
  imageurl?: string;
  unionid?: string; // wechat unionid
  accessTokens?: any[];
  address?: Address;
  roles?: number[]; // 'super', 'merchant-admin', 'merchant-stuff', 'driver', 'user'
  visited?: boolean;
  stripeCustomerId?: string;

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
