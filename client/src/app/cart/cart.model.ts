// import { Picture } from '../picture.model';

export interface ICartItem {
  productId: string;
  productName: string; // product name
  // pictures: Picture[];
  merchantId: string;
  merchantName: string;
  price: number;
  quantity: number;
}

export interface ICart {
  clientId?: string;
  clientName?: string;
  clientPhoneNumber?: string;
  merchantId?: string;
  merchantName?: string;
  deliveryCost?: number;
  deliveryFee?: number;
  deliveryDiscount?: number;
  productTotal?: number;
  tax?: number;
  tips?: number;
  total?: number;
  quantity?: number;
  items: ICartItem[];
}
// export interface IOrder {
//   id?: string;
//   clientId?: string;
//   clientName?: string;
//   clientPhoneNumber?: string;
//   merchantId?: string;
//   merchantName?: string;
//   stuffId?: string;
//   status?: string;
//   clientStatus?: string;
//   workerStatus?: string;
//   merchantStatus?: string;
//   note?: string;
//   address?: string;
//   location?: ILocation;
//   delivered?: Date;
//   created?: Date;
//   modified?: Date;
//   items?: IOrderItem[];
//   deliveryAddress?: Address;
//   deliveryFee?: number;
//   deliveryDiscount?: number;
//   total?: number;
// }
