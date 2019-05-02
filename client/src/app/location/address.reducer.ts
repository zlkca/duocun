import { AddressActions } from './address.actions';



export interface IAddressAction {
  type: string;
  payload: string;
}

export function addressReducer(state: string = '', action: IAddressAction) {
  if (action.payload) {
    switch (action.type) {
      case AddressActions.UPDATE:
        return action.payload;
    }
  }

  return state;
}
