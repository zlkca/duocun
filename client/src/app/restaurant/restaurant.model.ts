import { Product } from '../product/product.model';
import { Picture } from '../picture.model';
import { Address } from '../account/account.model';
import { GeoPoint } from '../location/location.model';
import { Order } from '../order/order.model';

export interface IPhase {
  orderEnd: string; // hh:mm
  pickup: string; // hh:mm
}

export interface IRestaurant {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  location?: GeoPoint;
  ownerId?: string;
  malls?: string[]; // mall id
  inRange?: boolean;
  created?: Date;
  modified?: Date;

  dow?: string; // day of week opening, eg. '1,2,3,4,5'
  isClosed?: boolean;
  distance?: number; // km
  deliveryCost?: number;
  fullDeliveryFee?: number;
  deliveryDiscount?: number;

  pictureId?: string;

  order?: number;
  products?: Product[];
  orders?: Order[];
  pictures?: Picture[];
  address?: Address;
  startTime?: string;
  endTime?: string;
  onSchedule?: boolean;

  phases: IPhase[];
  orderEnded: boolean; // do not save to db
  orderEndTime: string; // do not save to db
}

// For database
export class Restaurant implements IRestaurant {
  id: string;
  name: string;
  description: string;
  location: GeoPoint;
  ownerId: string;
  malls: string[]; // mall id
  created: Date;
  modified: Date;
  isClosed?: boolean; // do not save to database
  dow?: string; // day of week opening, eg. '1,2,3,4,5'
  products: Product[];
  pictures: Picture[];
  address: Address;
  order?: number;
  startTime?: string;
  endTime?: string;

  phases: IPhase[];
  orderEnded: boolean; // do not save to db
  orderEndTime: string; // do not save to db

  constructor(data?: IRestaurant) {
    Object.assign(this, data);
  }
}
