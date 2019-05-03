import { IDelivery } from './delivery.model';
import { DeliveryActions } from './delivery.actions';

export const DEFAULT_DELIVERY = {
  origin: null,
  destination: null,
  distance: 0,
  fromTime: null,
  toTime: null
};

export interface IDeliveryAction {
  type: string;
  payload: IDelivery;
}

export function deliveryReducer(state: IDelivery = DEFAULT_DELIVERY, action: IDeliveryAction) {
  switch (action.type) {
    case DeliveryActions.CLEAR:
      return null;
    case DeliveryActions.UPDATE:
      return action.payload;
    case DeliveryActions.UPDATE_TIME:
      return {
        ...state,
        fromTime: action.payload.fromTime,
        toTime: action.payload.toTime
      };
    case DeliveryActions.UPDATE_ORIGIN:
      return {
        ...state,
        origin: action.payload.origin
      };
    case DeliveryActions.UPDATE_DESTINATION:
      return {
        ...state,
        destination: action.payload.destination,
        distance: action.payload.distance
      };
    case DeliveryActions.UPDATE_DISTANCE:
      return {
        ...state,
        distance: action.payload.distance
      };
    case DeliveryActions.UPDATE_AVAILABLE_RANGES:
      return {
        ...state,
        availableRanges: action.payload.availableRanges
      };
    case DeliveryActions.UPDATE_FROM_CHANGE_ORDER:
      return {
        ...state,
        fromTime: action.payload.fromTime,
        toTime: action.payload.toTime,
        origin: action.payload.origin,
        destination: action.payload.destination,
        distance: action.payload.distance
      };
    default:
      return state || null;
  }
}
