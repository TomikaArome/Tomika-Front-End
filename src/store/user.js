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
		discordId: (state) => {
			return state.o === null || typeof state.o.info !== 'object' || typeof state.o.info.discordId !== 'string' ?
				'' : state.o.info.discordId;
		},
		name: (state) => {
			return state.o === null || typeof state.o.info !== 'object' || typeof state.o.info.name !== 'string' ?
				'Guest' : state.o.info.name;
		},
		discriminator: (state) => {
			return state.o === null || typeof state.o.info !== 'object' || typeof state.o.info.discriminator !==
				'string' ? '0000' : state.o.info.discriminator;
		},
		avatar: (state, getters) => {
			return state.o === null || typeof state.o.info !== 'object' || typeof state.o.info.avatar !== 'string' ?
				String(getters.discriminator % 5) : state.o.info.avatar;
		},
		hasPermission: (state) => (permString) => {
			if (typeof permString !== 'string' || state.o === null || typeof state.o.permissions !== 'object' ||
				!(state.o.permissions instanceof Array)) {
				return false;
			}
			return state.o.permissions.reduce((acc, perm) => {
				return acc || permString.substring(0, perm.length) === perm;
			}, false);
		}
	},
	mutations: {
		setUser(state, payload) {
			if (typeof payload !== 'object' || typeof payload.connected !== 'boolean') { payload = null; }
			state.o = payload;
		}
	}
}