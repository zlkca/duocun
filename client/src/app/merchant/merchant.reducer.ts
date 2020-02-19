
import { IMerchant } from '../merchant/merchant.model';
import { MerchantActions } from './merchant.actions';

export interface IMerchantAction {
  type: string;
  payload: IMerchant;
}

export function merchantReducer(state: IMerchant, action: IMerchantAction) {
  switch (action.type) {
    case MerchantActions.CLEAR_MERCHANT:
      return null;
    case MerchantActions.UPDATE_MERCHANT:
      return action.payload;
    default:
      return state || null;
  }
}
