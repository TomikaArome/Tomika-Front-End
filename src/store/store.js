// Import dependencies
import Vue from 'vue';
import Vuex from 'vuex';

// Import store modules
import appModule from './app';
import userModule from './user';
import navModule from './nav';
import requestModule from './request';
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
		user: userModule,
		nav: navModule,
		request: requestModule,
		twitch: twitchModule,
		twitter: twitterModule
	}
});
