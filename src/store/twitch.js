export default {
	namespaced: true,
	state: {

		// The Client ID of the tomika.ink Twitch integration app
		apiClientId: '46rjndwt9swkut47ardl8e2pjlbek7',

		// The user id of my Twitch channel
		userId: 42788803,
		// The name of my Twitch channel
		userName: 'TomikaArome',
		// The URL to the stream
		channelUrl: 'https://twitch.tv/tomikaarome/',

		// The frequency (in ms) at which to update the status of a stream
		updateFrequency: 60000,

		// The currently active stream, null means there is no active stream
		activeStream: null

	},
	getter: {

	},
	mutations: {
		// Set the active stream
		setActiveStream(state, payload) {
			if (typeof payload !== 'object') { payload = null; }
			state.activeStream = payload;
		}
	},
	actions: {

	}
}