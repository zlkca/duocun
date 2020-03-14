import { CartActions } from './cart.actions';
import {Cart, CartItem, ICart, ICartItem, ICartItemSpec} from './cart.model';
import {User} from '../account/account';
import {CartService} from './cart.service';

export interface ICartAction {
  type: string;
  payload: any;
}

// if items is [], means empty cart
function updateCart(cart: Cart, items: CartItem[]): Cart {
  cart.update();
  return cart;
}

export function cartReducer(state: Cart = CartService.DEFAULT_CART, action: ICartAction) {
  const items = [];
  let updated = null;
  let its = [];

  if (action.payload) {
    // const item = state.items.find(x => x.productId === payload.productId);

    switch (action.type) {
      case CartActions.UPDATE_CART:
        state.update();
        return Object.create(state);
      case CartActions.UPDATE_QUANTITY:
        const itemsToUpdate = action.payload.items;
        itemsToUpdate.forEach(item => {
          state.setItemQuantity(item, item.quantity);
        });
        return Object.create(state);

      case CartActions.ADD_TO_CART:
        const itemsToAdd = action.payload.items;
        // add all into items variable
        itemsToAdd.map(itemToAdd => {
          state.addItem(itemToAdd);
        });
        return Object.create(state);
      case CartActions.REMOVE_FROM_CART:
        const itemsToRemove: ICartItem[] = action.payload.items;
        itemsToRemove.forEach(item => {
          state.removeItem(item);
        })
        return Object.create(state);
      case CartActions.UPDATE_FROM_CHANGE_ORDER: // deprecated
        its = [...action.payload.items];
        updated = updateCart(state, its);
        state.items = its;
        state['updated'] = updateCart(state, its);
        state.merchantId = action.payload.merchantId;
        state.merchantName = action.payload.merchantName;
        return Object.create(state);
      case CartActions.CLEAR_CART:
        state = CartService.DEFAULT_CART;
        return Object.create(state);
      case CartActions.SELECT_FOR_SPEC:
        state.selectedProduct = action.payload.selectedProduct;
        state.selectedCartItem = action.payload.selectedCartItem;
        return Object.create(state);
      case CartActions.CANCEL_SPEC_SELECT:
        state.selectedProduct = null;
        state.selectedCartItem = null;
        return Object.create(state);
      default:
        return state;
    }
  }

  return state;
}
