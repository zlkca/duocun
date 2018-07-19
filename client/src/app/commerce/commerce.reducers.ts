import { LocationActions, PictureActions, CartActions } from './commerce.actions';
import { ILocation, IPicture, ICart, ICartItem } from './commerce.actions';
import { DEFAULT_LOCATION, DEFAULT_PICTURE } from './commerce.actions';

// export interface ICartAction{
// 	type:string,
// 	payload:any
// }


export function pictureReducer(state: IPicture = DEFAULT_PICTURE, action: any) {
    if (action.payload) {
        const payload = action.payload;

        switch (action.type) {
            case PictureActions.ADD_PICTURE:
                return action.payload;

            case PictureActions.CHANGE_PICTURE:
                return { ...state, ...payload };

            case PictureActions.REMOVE_PICTURE:
                return DEFAULT_PICTURE;
        }
    }
    return state;
}
// reducer for array of pictures
// export function pictureReducer(state: IPicture[] = [], action: any) {
//     if (action.payload) {
//         const payload = action.payload;
//         let a = [];

//         switch (action.type) {
//             case PictureActions.ADD_PICTURE:
//                 a = state.filter(x => x.product.id != payload.product.id);
//                 return [...a, ...[payload]];

//             case PictureActions.CHANGE_PICTURE:
//                 a = state.filter(x => x.product.id != payload.product.id);
//                 return [...a, ...[payload]];

//             case PictureActions.REMOVE_PICTURE:
//                 return [];
//         }
//     }
//     return state;
// }
export interface ICartAction {
    type: string,
    payload: any
}

export function cartReducer(state: ICart = { items: [] }, action: any) {
    if (action.payload) {
        let pid = action.payload.pid;
        let payload = action.payload;
        let item = state.items.find(x => x.pid == payload.pid);

        switch (action.type) {
            case CartActions.ADD_TO_CART:
                if (item) {
                    let newItems = state.items.map(x => {
                        if (x.pid == payload.pid) {
                            x.quantity = x.quantity + 1;
                        }
                        return x;
                    });

                    return { ...state, items: newItems }
                } else {
                    return {
                        ...state,
                        items: [...state.items, { ...action.payload, 'quantity': 1 }]
                    }
                }
            case CartActions.REMOVE_FROM_CART:
                if (item) {
                    let newItems = state.items.map(x => {
                        if (x.pid == payload.pid) {
                            x.quantity = x.quantity - 1;
                        }
                        return x;
                    });

                    return { ...state, items: newItems.filter(x => x.quantity > 0) }
                } else {
                    return state;
                }
            case CartActions.UPDATE_QUANTITY:
                if (item) {
                    let newItems = state.items.map(x => {
                        if (x.pid == payload.pid) {
                            x.quantity = payload.quantity;
                        }
                        return x;
                    });

                    return { ...state, items: newItems.filter(x => x.quantity > 0) }
                } else {
                    return state;
                }
            case CartActions.CLEAR_CART:
                return { ...state, items: [] }
        }
    }

    return state;
}
