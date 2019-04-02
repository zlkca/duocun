import { OrderActions } from './order.actions';
import { IOrder } from '../order/order.model';

export interface IOrderAction {
  type: string;
  payload: any;
}

// export function cartReducer(state: IOrder = { }, action: any) {
//   if (action.payload) {
//     const payload = action.payload;
//     const item = state.items.find(x => x.productId === payload.productId);

//     switch (action.type) {
//       case OrderActions.ADD_TO_ORDER:
//         if (item) {
//           const newItems = state.items.map(x => {
//             if (x.productId === payload.productId) {
//               x.quantity = x.quantity + 1;
//             }
//             return x;
//           });

//           return { ...state, items: newItems };
//         } else {
//           return {
//             ...state,
//             items: [...state.items, { ...action.payload, 'quantity': 1 }]
//           };
//         }
//       case OrderActions.REMOVE_FROM_ORDER:
//         if (item) {
//           const newItems = state.items.map(x => {
//             if (x.productId === payload.productId) {
//               x.quantity = x.quantity - 1;
//             }
//             return x;
//           });

//           return { ...state, items: newItems.filter(x => x.quantity > 0) };
//         } else {
//           return state;
//         }
//       case OrderActions.UPDATE_QUANTITY:
//         if (item) {
//           const newItems = state.items.map(x => {
//             if (x.productId === payload.productId) {
//               x.quantity = payload.quantity;
//             }
//             return x;
//           });

//           return { ...state, items: newItems.filter(x => x.quantity > 0) };
//         } else {
//           return state;
//         }
//       case OrderActions.CLEAR_ORDER:
//         return { ...state, items: [] };
//     }
//   }

//   return state;
// }
