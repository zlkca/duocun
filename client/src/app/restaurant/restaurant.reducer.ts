import { RestaurantActions } from './restaurant.actions';
import { IMerchant } from '../merchant/merchant.model';

export interface IRestaurantAction {
  type: string;
  payload: IMerchant;
}

export function restaurantReducer(state: IMerchant, action: IRestaurantAction) {
  switch (action.type) {
    case RestaurantActions.CLEAR:
      return null;
    case RestaurantActions.UPDATE:
      return action.payload;
    default:
      return state || null;
  }
}
