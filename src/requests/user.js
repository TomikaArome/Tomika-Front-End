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
	const userInfo = await f('/user/me');
	if (userInfo.ok) {
		store.commit('user/setUser', userInfo.result);
	}
};

/*------*
 | POST |
 *------*/

const userDisconnectReq = async () => {
	let disconnect = await f('/user/disconnect', { method: 'POST' });
	if (disconnect.ok) {
		store.commit('user/setUser');
	}
};

/*---------*
 | Exports |
 *---------*/

export {
	userInfoReq,
	userDisconnectReq
}