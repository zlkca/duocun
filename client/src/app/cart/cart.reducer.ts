import { CartActions } from './cart.actions';
import { ICart, ICartItem } from './cart.model';

export interface ICartAction {
  type: string;
  payload: ICart;
}

// if items is [], means empty cart
function updateCart(c: ICart, items: ICartItem[]) {
  const cart = Object.assign({}, c);
  cart.price = 0;
  cart.quantity = 0;

  if (items && items.length > 0) {
    items.map(x => {
      cart.price += x.price * x.quantity;
      cart.quantity += x.quantity;
    });
  } else { // clear cart
    cart.merchantId = '';
    cart.merchantName = '';
  }
  return cart;
}

export const DEFAULT_CART = {
  merchantId: '',
  merchantName: '',
  quantity: 0,
  price: 0,
  items: []
};

export function cartReducer(state: ICart = DEFAULT_CART, action: ICartAction) {
  const items = [];
  let updated = null;
  let its = [];

  if (action.payload) {
    // const item = state.items.find(x => x.productId === payload.productId);

    switch (action.type) {
      case CartActions.UPDATE_CART:
        return {
          ...state,
          ...action.payload.items
        };

      case CartActions.UPDATE_QUANTITY:
        const itemsToUpdate = action.payload.items;

        itemsToUpdate.map(itemToUpdate => {
          const x = state.items.find(item => item.productId === itemToUpdate.productId);
          if (x) {
            x.quantity = itemToUpdate.quantity;
          } else {
            items.push({ ...itemToUpdate });
          }
        });

        state.items.map(x => {
          const it = items.find(y => y.productId === x.productId);
          if (!it) {
            items.push(x);
          }
        });

        its = items.filter(x => x.quantity > 0);
        updated = updateCart(state, its);

        return {
          ...state,
          ...updated,
          items: its
        };

      case CartActions.ADD_TO_CART:
        const itemsToAdd = action.payload.items;

        // add all into items variable
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

        updated = updateCart(state, items);
        return {
          ...state,
          ...updated,
          items: items,
          merchantId: action.payload.merchantId,
          merchantName: action.payload.merchantName
        };
      case CartActions.REMOVE_FROM_CART:
        const itemsToRemove: ICartItem[] = action.payload.items;
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

        its = items.filter(x => x.quantity > 0);
        updated = updateCart(state, its);

        return {
          ...state,
          ...updated,
          items: its
        };

      case CartActions.UPDATE_FROM_CHANGE_ORDER: // deprecated
        its = [...action.payload.items];
        updated = updateCart(state, its);

        return {
          ...state,
          ...updated,
          merchantId: action.payload.merchantId,
          merchantName: action.payload.merchantName,
          items: its
        };

      case CartActions.CLEAR_CART:
        updated = updateCart(state, []);
        return {
          ...state,
          ...updated,
          items: []
        };
    }
  }

  return state;
}
