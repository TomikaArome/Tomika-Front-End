export default {
	namespaced: true,
	state: {
		o: null
	},
	getters: {
		connected: (state) => {
			return state.o === null ? false : state.o.connected;
		},
		_id: (state) => {
			return state.o === null || typeof state.o.info !== 'object' || typeof state.o.info._id !== 'string' ? '' :
				state.o.info._id;
		},
		name: (state) => {
			return state.o === null || typeof state.o.info !== 'object' || typeof state.o.info.name !== 'string' ?
				'Guest' : state.o.info.name;
		},
		discriminator: (state) => {
			return state.o === null || typeof state.o.info !== 'object' || typeof state.o.info.discriminator !==
				'string' ? '0000' : state.o.info.discriminator;
		},
		pfpUrl: (state, getters) => {
			let n = getters.discriminator % 5;
			return state.o === null || typeof state.o.info !== 'object' || typeof state.o.info.pfpUrl !== 'string' ?
				`https://cdn.discordapp.com/embed/avatars/${n}.png` : state.o.info.pfpUrl;
		}
	},
	mutations: {
		setUser(state, payload) {
			if (typeof payload !== 'object' || typeof payload.connected !== 'boolean') { payload = null; }
			state.o = payload;
		}
	}
}