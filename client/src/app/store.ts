import { Action } from 'redux';
import { combineReducers } from 'redux';
import { DEFAULT_ACCOUNT, accountReducer } from './account/account.reducer';
// import { pictureReducer } from './commerce/commerce.reducers';
import { locationReducer } from './location/location.reducer';
import { ILocation } from './location/location.model';
// import { IPicture, DEFAULT_PICTURE } from './commerce/commerce.actions';
import { Account } from './lb-sdk';
import { pageReducer, deliverTimeReducer } from './main/main.reducers';
import { commandReducer } from './shared/command.reducers';
import { DEFAULT_MALL } from './mall/mall.actions';
import { IMall } from './mall/mall.model';
import { mallReducer } from './mall/mall.reducers';
import { IDelivery } from './delivery/delivery.model';
import { deliveryReducer } from './delivery/delivery.reducer';
import { IContact } from './contact/contact.model';
import { contactReducer } from './contact/contact.reducer';
import { ICart } from './cart/cart.model';
import { cartReducer } from './cart/cart.reducer';
import { amountReducer } from './order/order.reducers';
import { IAmount } from './order/order.model';
import { restaurantReducer } from './restaurant/restaurant.reducer';
import { IRestaurant } from './restaurant/restaurant.model';

export interface IAppState {
    cart: ICart;
    account: Account;
    // picture: IPicture;
    location: ILocation;
    page: string;
    cmd: string;
    deliverTime: string;
    restaurant: IRestaurant;
    malls: IMall[];
    delivery: IDelivery;
    contact: IContact;
    amount: IAmount;
}

export const INITIAL_STATE: IAppState = {
    cart: { items: [] },
    account: DEFAULT_ACCOUNT,
    // picture: DEFAULT_PICTURE,
    location: null,
    page: 'home',
    cmd: '',
    deliverTime: '',
    restaurant: null,
    malls: [DEFAULT_MALL],
    delivery: null,
    contact: null,
    amount: null,
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
    location: locationReducer,
    page: pageReducer,
    cmd: commandReducer,
    deliverTime: deliverTimeReducer,
    restaurant: restaurantReducer,
    malls: mallReducer,
    delivery: deliveryReducer,
    contact: contactReducer,
    amount: amountReducer
});
