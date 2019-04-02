import { IDelivery } from './delivery.model';
import { DeliveryActions } from './delivery.actions';

export interface IDeliveryAction {
  type: string;
  payload: IDelivery;
}

export function deliveryReducer(state: IDelivery, action: IDeliveryAction) {
  switch (action.type) {
    case DeliveryActions.CLEAR:
      return null;
    case DeliveryActions.UPDATE:
      return action.payload;
    default:
      return state || null;
  }
}
