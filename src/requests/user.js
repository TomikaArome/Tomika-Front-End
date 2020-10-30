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

const userSplatnetConnectRedirectReq = async (redirectUri) => {
	let response = await f('/user/splatnet/connect-redirect', {
		method: 'POST',
		body: {
			redirectUri: redirectUri
		}
	});
	if (response.ok) {
		// Do another user info request to refresh
		await userInfoReq();
	} else if (typeof response.error === 'object' && response.error.code) {
		return response.error;
	}
	return true;
};

const userSplatnetDisconnectReq = async () => {
	let response = await f('/user/splatnet/disconnect', { method: 'POST' });
	if (response.ok) {
		await userInfoReq();
	}
	return response.ok;
};

/**
 * Manually sets the iksm_session cookie
 * @param cookie The cookie to set
 */
const userSplatnetManualCookieReq = async (cookie) => {
	if (!/iksm_session=[0-9a-f]+(.*)expires=([^;]+)(;|$)/.test(cookie)) { return 'SPLATNET_COOKIE_BADLY_FORMED'; }
	let response = await f('/user/splatnet/cookie', {
		method: 'POST',
		body: {
			cookie: cookie
		}
	});
	if (response.ok) {
		return true;
	} else {
		return response.error.code;
	}
};

/*---------*
 | Exports |
 *---------*/

export {
	userInfoReq,
	userDisconnectReq,
	userSplatnetConnectRedirectReq,
	userSplatnetDisconnectReq,
	userSplatnetManualCookieReq
}