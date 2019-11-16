import config from '../config';

export default {
	namespaced: true,
	state: {
		backEnd: config["back-end-url"],
		backEndUnreachable: true
	},
	getters: {

	},
	mutations: {
		setBackEndUnreachable(state, payload) {
			if (typeof payload !== 'boolean') { payload = true; }
			state.backEndUnreachable = payload;
		}
	},
	actions: {

	}
}