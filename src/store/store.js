// Import dependencies
import Vue from 'vue';
import Vuex from 'vuex';

// Import store modules
import navModule from './nav';
import discordModule from './discord';
import twitchModule from './twitch';

// Inject the store into Vue
Vue.use(Vuex);

export default new Vuex.Store({
	state: {

	},
	getters: {

	},
	mutations: {

	},
	actions: {

	},
	modules: {
		nav: navModule,
		discord: discordModule,
		twitch: twitchModule
	}
});
