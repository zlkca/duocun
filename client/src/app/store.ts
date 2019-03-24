import { Action } from 'redux';
import { combineReducers } from 'redux';
import { DEFAULT_ACCOUNT, accountReducer } from './account/account.reducer';
// import { pictureReducer } from './commerce/commerce.reducers';
// import { locationReducer } from './shared/location/location.reducer';
// import { ILocation } from './shared/location/location.model';
import { ICart } from './order/order.actions';
// import { IPicture, DEFAULT_PICTURE } from './commerce/commerce.actions';
import { cartReducer } from './order/order.reducers';
import { Account } from './lb-sdk';
import { pageReducer } from './page/page.reducers';
import { commandReducer } from './shared/command.reducers';

export interface IAppState {
    cart: ICart;
    account: Account;
    // picture: IPicture;
    // location: ILocation;
    page: string;
    cmd: string;
}

export const INITIAL_STATE: IAppState = {
    cart: { items: [] },
    account: DEFAULT_ACCOUNT,
    // picture: DEFAULT_PICTURE,
    // location: null,
    page: 'home',
    cmd: ''
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
    // location: locationReducer
    page: pageReducer,
    cmd: commandReducer
});
