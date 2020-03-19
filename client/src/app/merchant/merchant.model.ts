import { Product } from '../product/product.model';
import { Picture } from '../picture.model';
import { Address } from '../account/account.model';
import { GeoPoint } from '../location/location.model';
import { Order } from '../order/order.model';

export const MerchantType = {
  RESTAURANT: 'R',
  GROCERY: 'G',
  FRESH: 'F',
  TELECOM: 'T'
};

export const MerchantStatus = {
  ACTIVE: 'A',
  INACTIVE: 'I'
};

export interface IPhase {
  orderEnd: string; // hh:mm
  pickup: string; // hh:mm
}

export interface IMerchant {
  _id?: string;
  name: string;
  nameEN: string;
  description?: string;
  location?: GeoPoint;
  accountId: string;
  malls?: string[]; // mall id
  inRange?: boolean;
  type: string;
  created?: string;
  modified?: string;

  dow?: string; // day of week opening, eg. '1,2,3,4,5'
  isClosed?: boolean;
  distance?: number; // km
  deliveryCost?: number;

  pictureId?: string;

  order?: number;
  products?: Product[];
  orders?: Order[];
  pictures?: Picture[];
  address?: Address;
  onSchedule?: boolean;

  phases: IPhase[];
  orderEnded: boolean; // do not save to db
  orderEndTime: string; // do not save to db
}

// For database
export class Restaurant implements IMerchant {
  _id: string;
  name: string;
  nameEN: string;
  description: string;
  location: GeoPoint;
  accountId: string;
  malls: string[]; // mall id
  type: string;
  created: string;
  modified: string;
  isClosed?: boolean; // do not save to database
  dow?: string; // day of week opening, eg. '1,2,3,4,5'
  products: Product[];
  pictures: Picture[];
  address: Address;
  order?: number;

  phases: IPhase[];
  orderEnded: boolean; // do not save to db
  orderEndTime: string; // do not save to db

  constructor(data?: IMerchant) {
    Object.assign(this, data);
  }
}
