import { CartActions } from './cart.actions';
import { ICart } from './cart.model';

export interface ICartAction {
  type: string;
  payload: any;
}

export function cartReducer(state: ICart = { items: [] }, action: any) {
  if (action.payload) {
    const payload = action.payload;
    const item = state.items.find(x => x.productId === payload.productId);

    switch (action.type) {
      case CartActions.ADD_TO_CART:
        if (item) {
          const newItems = state.items.map(x => {
            if (x.productId === payload.productId) {
              x.quantity = x.quantity + 1;
            }
            return x;
          });

          return { ...state, items: newItems };
        } else {
          return {
            ...state,
            items: [...state.items, { ...action.payload, 'quantity': 1 }]
          };
        }
      case CartActions.REMOVE_FROM_CART:
        if (item) {
          const newItems = state.items.map(x => {
            if (x.productId === payload.productId) {
              x.quantity = x.quantity - 1;
            }
            return x;
          });

          return { ...state, items: newItems.filter(x => x.quantity > 0) };
        } else {
          return state;
        }
      case CartActions.UPDATE_QUANTITY:
        if (item) {
          const newItems = state.items.map(x => {
            if (x.productId === payload.productId) {
              x.quantity = payload.quantity;
            }
            return x;
          });

          return { ...state, items: newItems.filter(x => x.quantity > 0) };
        } else {
          return state;
        }
      case CartActions.CLEAR_CART:
        return { ...state, items: [] };
    }
  }

  return state;
}
