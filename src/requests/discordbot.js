/*----------*
 | Requires |
 *----------*/

// Imports
import f from './fetch';
import store from '../store/store';

/*-----*
 | GET |
 *-----*/

const infoReq = async () => {
	const botInfo = await f('/discord/bot/user');
	if (botInfo.ok) {
		store.commit('discord/setBot', botInfo.result);
		store.dispatch('discord/startUptimeInterval');
	}
};

/*------*
 | POST |
 *------*/

const startReq = async () => {
	const start = await f('/discord/bot/start', { method: 'POST' });
	if (start.ok) {
		await infoReq();
	}
};

const stopReq = async () => {
	const stop = await f('/discord/bot/stop', { method: 'POST' });
	if (stop.ok) {
		await infoReq();
	}
};

/*---------*
 | Exports |
 *---------*/

export {
	infoReq,
	startReq,
	stopReq
}