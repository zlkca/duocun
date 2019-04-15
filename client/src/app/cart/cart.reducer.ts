import { CartActions } from './cart.actions';
import { ICart, ICartItem } from './cart.model';

export interface ICartAction {
  type: string;
  payload: ICartItem[];
}

export function cartReducer(state: ICart = { items: [] }, action: ICartAction) {
  const items = [];
  if (action.payload) {
    // const payload = action.payload;
    // const item = state.items.find(x => x.productId === payload.productId);

    switch (action.type) {
      case CartActions.ADD_TO_CART:
        const itemsToAdd = action.payload;
        itemsToAdd.map(itemToAdd => {
          const x = state.items.find(item => item.productId === itemToAdd.productId);
          if (x) {
            items.push({ ...x, quantity: x.quantity + itemToAdd.quantity });
          } else {
            items.push({ ...itemToAdd });
          }
        });

        state.items.map(x => {
          const it = items.find(y => y.productId === x.productId);
          if (!it) {
            items.push(x);
          }
        });

        return {
          ...state,
          items: items
        };
      case CartActions.REMOVE_FROM_CART:
        const itemsToRemove: ICartItem[] = action.payload;
        itemsToRemove.map((itemToRemove: ICartItem) => {
          const x = state.items.find(item => item.productId === itemToRemove.productId);
          if (x) {
            items.push({ ...x, quantity: x.quantity - itemToRemove.quantity });
          }
        });
        state.items.map(x => {
          const it = items.find(y => y.productId === x.productId);
          if (!it) {
            items.push(x);
          }
        });
        return { ...state, items: items.filter(x => x.quantity > 0) };
      case CartActions.CLEAR_CART:
        return { ...state, items: [] };
    }
  }

  return state;
}
