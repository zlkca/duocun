export class CartActions {
  static UPDATE_CART = 'UPDATE_CART';
  static ADD_TO_CART = 'ADD_TO_CART';
  static REMOVE_FROM_CART = 'REMOVE_FROM_CART';
  static UPDATE_QUANTITY = 'UPDATE_CART_ITEM_QUANTITY';
  static CLEAR_CART = 'CLEAR_CART';
  static UPDATE_FROM_CHANGE_ORDER = 'UPDATE_CART_FROM_CHANGE_ORDER'; // clear the items from the same restaurant and re-add items
}
