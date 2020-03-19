import { IOrder } from './order.model';
import { OrderActions } from './order.actions';

export interface IOrderAction {
  type: string;
  payload: IOrder;
}

export function orderReducer(state: IOrder = { }, action: any) {
  if (action.payload) {
    switch (action.type) {
      case OrderActions.UPDATE_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload.paymentMethod
      };
      case OrderActions.UPDATE_ORDER:
        return action.payload;

      case OrderActions.CLEAR_ORDER:
        return null;
    }
  }

  return state;
}
