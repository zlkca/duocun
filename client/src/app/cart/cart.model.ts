import { Picture } from '../picture.model';

export interface ICartItem {
  productId: string;
  productName: string; // product name
  pictures: Picture[];
  restaurantId: string;
  restaurantName: string;
  price: number;
  quantity: number;
}

export interface ICart {
  items: ICartItem[];
}
