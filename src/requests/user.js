/*----------*
 | Requires |
 *----------*/

// Imports
import f from './fetch';
import store from '../store/store';

/*-----*
 | GET |
 *-----*/

const userInfoReq = async () => {
	const userInfo = await f('/user/@me');
	if (userInfo.success) {
		store.commit('discord/setUser', await userInfo.o);
	}
};

/*------*
 | POST |
 *------*/

const disconnectReq = async () => {
	let disconnect = await f('/discord/disconnect', { method: 'POST' });
	if (disconnect.success) {
		store.commit('discord/setUser');
		store.commit('nav/setSettingsOpen', false);
	}
};

/*---------*
 | Exports |
 *---------*/

export {
	userInfoReq,
	disconnectReq
}