import { IMerchant } from './restaurant.model';
import { RestaurantActions } from './restaurant.actions';

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
