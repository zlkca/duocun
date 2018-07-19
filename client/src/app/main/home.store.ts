import { Action } from 'redux';
import { ILocation } from './main.models';
import { HomeActions } from './home.actions';

export const INITIAL_USER_LOCATION:ILocation = {
	street: '303 Holmes Ave',
	city: 'North York',
	province: 'Ontario',
	postalCode: 'M2N 4N2',
	lat:0,
	lng:0
}

export function userLocationReducer(last:ILocation, action: Action):ILocation{
	switch(action.type){
		case HomeActions.CHANGE_USER_LOCATION:
			return { street: '303 Holmes Ave',
					 city: 'North York',
					 province: 'Ontario',
					 postalCode: 'M2N 4N2',
					 lat:0,
					 lng:0 } 
	}

	return last;
}