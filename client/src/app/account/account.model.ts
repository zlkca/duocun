import { Restaurant } from '../restaurant/restaurant.model';
import { GeoPoint } from '../location/location.model';
import { Order } from '../order/order.model';
export interface IAccount {
  type: string;
  realm?: string;
  username?: string;
  email: string;
  emailVerified?: boolean;
  phone?: string;
  id?: string;
  password?: string;
  accessTokens?: any[];
  restaurants?: Restaurant[];
  orders?: Order[];
  address?: Address;
}

export class Account implements IAccount {
  type: string;
  realm: string;
  username: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  id: string;
  password: string;
  accessTokens: any[];
  restaurants: Restaurant[];
  orders: Order[];
  address: Address;
  constructor(data?: IAccount) {
    Object.assign(this, data);
  }
}

export interface IAddress {
  formattedAddress: string;
  unit?: number;
  streetName: string;
  streetNumber: string;
  location?: GeoPoint;
  sublocality?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  created?: Date;
  modified?: Date;
  id?: number;
  entityId?: number;
  entityType?: string;
  entity?: any;
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
  entityId: number;
  entityType: string;
  entity: any;
  constructor(data?: IAddress) {
    Object.assign(this, data);
  }
}
