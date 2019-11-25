// Import dependencies
import Vue from 'vue';

export default {
	namespaced: true,
	state: {
		// This object stores requests being made to the back-end for each resource being requested
		progress: {}
	},
	getters: {

	},
	mutations: {
		setProgress(state, payload) {
			if (payload.progress) {
				Vue.set(state.progress, payload.path, true);
			}
			else {
				Vue.set(state.progress, payload.path, false);
			}
		}
	},
	actions: {

	}
}