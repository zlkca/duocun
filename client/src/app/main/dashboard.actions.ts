import { Injectable } from '@angular/core';
import { Action } from 'redux';

@Injectable()
export class DashboardActions{
	static SHOW_DASHBOARD = 'SHOW_DASHBOARD';
	static HIDE_DASHBOARD = 'HIDE_DASHBOARD';

	show():Action {
		return {type:DashboardActions.SHOW_DASHBOARD};
	}

	hide():Action{
		return {type:DashboardActions.HIDE_DASHBOARD};
	}
}
