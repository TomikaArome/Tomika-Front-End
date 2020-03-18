// Import dependencies
import Vue from 'vue';
import { wait } from '../util';

let uptimeInterval = null;

export default {
	namespaced: true,
	state: {
		user: null,
		bot: null
	},
	getters: {
		connected: (state) => {
			return state.user === null ? false : state.user.connected;
		}
	},
	mutations: {
		setUser(state, payload) {
			if (typeof payload !== 'object' || typeof payload.connected !== 'boolean') { payload = null; }
			state.user = payload;
		},
		setBot(state, payload) {
			if (uptimeInterval != null) { clearInterval(uptimeInterval); }
			if (typeof payload !== 'object' || typeof payload.connected !== 'boolean') { payload = null; }
			state.bot = payload;
		},
		setBotUptime(state, payload) {
			if (typeof payload === 'number' && state.bot !== null) {
				Vue.set(state.bot, 'uptime', payload);
			}
		}
	},
	actions: {
		startUptimeInterval({ state, commit }) {
			if (state.bot.connected) {
				uptimeInterval = setInterval(() => { commit('setBotUptime', state.bot.uptime + 1000); }, 1000);
			}
		},
		/**
		 * Returns true if the user is an admin. This action is asynchronous and will wait for the request to the
		 * backend to have finished before returning
		 */
		async isAdmin({ state, rootState }) {
			while (!rootState.discord.user) {
				await wait(1);
			}
			return state.user.admin;
		}
	}
}