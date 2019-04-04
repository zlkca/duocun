import { IRestaurant } from './restaurant.model';
import { RestaurantActions } from './restaurant.actions';

export interface IRestaurantAction {
  type: string;
  payload: IRestaurant;
}

export function restaurantReducer(state: IRestaurant, action: IRestaurantAction) {
  switch (action.type) {
    case RestaurantActions.CLEAR:
      return null;
    case RestaurantActions.UPDATE:
      return action.payload;
    default:
      return state || null;
  }
}
