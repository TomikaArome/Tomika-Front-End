export default {
	namespaced: true,
	state: {
		user: null
	},
	getters: {
		connected: (state) => {
			return state.user === null ? false : state.user.connected;
		}
	},
	mutations: {
		setUser: (state, payload) => {
			if (typeof payload !== 'object' || typeof payload.connected !== 'boolean') { payload = null; }
			state.user = payload;
		}
	},
	actions: {

	}
}