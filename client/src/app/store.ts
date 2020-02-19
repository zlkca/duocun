import { combineReducers } from 'redux';
import { accountReducer } from './account/account.reducer';
// import { pictureReducer } from './commerce/commerce.reducers';
// import { locationReducer } from './location/location.reducer';
// import { ILocation } from './location/location.model';
// import { IPicture, DEFAULT_PICTURE } from './commerce/commerce.actions';
import { pageReducer } from './main/main.reducers';
import { commandReducer, ICommand } from './shared/command.reducers';
import { DEFAULT_MALL } from './mall/mall.actions';
import { IMall } from './mall/mall.model';
import { mallReducer } from './mall/mall.reducers';
import { IDelivery } from './delivery/delivery.model';
import { deliveryReducer, DEFAULT_DELIVERY } from './delivery/delivery.reducer';
import { IContact } from './contact/contact.model';
import { contactReducer } from './contact/contact.reducer';
import { ICart } from './cart/cart.model';
import { cartReducer, DEFAULT_CART } from './cart/cart.reducer';
import { IMerchant } from './merchant/merchant.model';
import { Account } from './account/account.model';
import { orderReducer } from './order/order.reducers';
import { IOrder } from './order/order.model';
import { addressReducer } from './location/address.reducer';
import { IRange } from './range/range.model';
import { rangeReducer } from './range/range.reducer';
import { merchantReducer } from './merchant/merchant.reducer';
export interface IAppState {
    cart: ICart;
    account: Account;
    // picture: IPicture;
    // location: ILocation;
    page: string;
    cmd: ICommand;
    // deliveryTime: IDeliveryTime;
    restaurant: IMerchant;
    malls: IMall[];
    delivery: IDelivery;
    contact: IContact;
    order: IOrder;
    address: string;
    range: IRange;
}

export const INITIAL_STATE: IAppState = {
    cart: DEFAULT_CART,
    account: null,
    // picture: DEFAULT_PICTURE,
    // location: null,
    page: 'home',
    cmd: {name: '', args: ''},
    // deliveryTime: {text: '', from: null, to: null},
    restaurant: null,
    malls: [DEFAULT_MALL],
    delivery: DEFAULT_DELIVERY,
    contact: null,
    order: null,
    address: '',
    range: null
};

// export function rootReducer(last:IAppState, action:Action):IAppState{
// 	// switch (action.type){
// 	// 	case DashboardActions.SHOW_DASHBOARD:
// 	// 		return { dashboard: 'main' };
// 	// 	case DashboardActions.HIDE_DASHBOARD:
// 	// 		return { dashboard: ''};
// 	// }
// 	return last;
// }

export const rootReducer = combineReducers({
    cart: cartReducer,
    account: accountReducer,
    // picture: pictureReducer,
    // location: locationReducer,
    page: pageReducer,
    cmd: commandReducer,
    // deliveryTime: deliveryTimeReducer,
    merchant: merchantReducer,
    malls: mallReducer,
    delivery: deliveryReducer,
    contact: contactReducer,
    order: orderReducer,
    address: addressReducer,
    range: rangeReducer
});
