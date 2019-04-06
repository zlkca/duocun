import { IDeliveryTime } from './delivery.model';
import { DeliveryTimeActions } from './delivery-time.actions';

export interface IDeliveryTimeAction {
  type: string;
  payload: IDeliveryTime;
}

export function deliveryTimeReducer(state: IDeliveryTime = { type: '', text: '' }, action: IDeliveryTimeAction) {
  if (action.payload) {
    switch (action.type) {
      case DeliveryTimeActions.UPDATE:
        return action.payload;
    }
  }

  return state;
}
