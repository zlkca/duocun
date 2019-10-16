// import { Picture } from '../picture.model';

export interface ICartItem {
  productId: string;
  productName: string; // product name
  // pictures: Picture[];
  merchantId: string;
  merchantName: string;
  price: number;
  cost: number;
  quantity: number;
}

export interface ICart {
  clientId?: string;
  clientName?: string;
  clientPhoneNumber?: string;
  merchantId?: string;
  merchantName?: string;
  deliveryCost?: number;
  deliveryDiscount?: number;
  productTotal?: number;
  tax?: number;
  tips?: number;
  total?: number;
  quantity?: number;
  items: ICartItem[];
}
