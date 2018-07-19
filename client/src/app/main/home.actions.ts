import { Injectable } from '@angular/core';
import { Action } from 'redux';
import { NgRedux } from '@angular-redux/store';

@Injectable()
export class HomeActions{
	static CHANGE_USER_LOCATION = 'CHANGE_USER_LOCATION';

	changeUserLocation(): Action {
		return { type: HomeActions.CHANGE_USER_LOCATION };
	}
}