import { IOrder } from './order.model';
import { OrderActions } from './order.actions';

export interface IOrderAction {
  type: string;
  payload: IOrder;
}

export function orderReducer(state: IOrder = { }, action: any) {
  if (action.payload) {
    switch (action.type) {
      case OrderActions.UPDATE:
        return action.payload;

      case OrderActions.CLEAR:
        return null;
    }
  }

  return state;
}
