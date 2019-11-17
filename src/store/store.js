// Import dependencies
import Vue from 'vue';
import Vuex from 'vuex';

// Import store modules
import appModule from './app';
import navModule from './nav';
import discordModule from './discord';
import twitchModule from './twitch';
import twitterModule from './twitter';

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
		app: appModule,
		nav: navModule,
		discord: discordModule,
		twitch: twitchModule,
		twitter: twitterModule
	}
});
