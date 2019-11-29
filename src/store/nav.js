export default {
	namespaced: true,
	state: {

		// Pane visibility states
		navDrawerOpen: false,
		discordPaneOpen: false,
		twitchPaneOpen: false,
		twitterPaneOpen: false,

		// Popup visibility states
		settingsOpen: false,

		// Misc
		unreadTweets: false

	},
	getters: {

	},
	mutations: {
		// Pane visibility mutations
		setNavDrawerOpen(state, payload) {
			if (typeof payload !== 'boolean') { payload = !state.navDrawerOpen; }
			state.navDrawerOpen = payload;
		},
		setDiscordPaneOpen(state, payload) {
			if (typeof payload !== 'boolean') { payload = !state.discordPaneOpen; }
			state.discordPaneOpen = payload;
		},
		setTwitchPaneOpen(state, payload) {
			if (typeof payload !== 'boolean') { payload = !state.twitchPaneOpen; }
			state.twitchPaneOpen = payload;
		},
		setTwitterPaneOpen(state, payload) {
			if (typeof payload !== 'boolean') { payload = !state.twitterPaneOpen; }
			state.twitterPaneOpen = payload;
			// Also change the unread tweets to false
			state.unreadTweets = false;
		},
		// Popup visibility mutations
		setSettingsOpen(state, payload) {
			if (typeof payload !== 'boolean') { payload = !state.settingsOpen; }
			state.settingsOpen = payload;
		},
		// Misc
		setUnreadTweets(state, payload) {
			if (typeof payload !== 'boolean') { payload = false; }
			state.unreadTweets = payload;
		}
	},
	actions: {

	}
}