/**
 * This file contains data and functionality to manage what content is shown on the page
 * The data array stored under "contentData" contains objects that are organised as follow:
 *  - id: A string to identify the content. Often the component name with the prefix
 *  - name: The name of the content as it appears in the nav bar and in the nav drawer
 *  - title: A string containing the contents of the <title> tag. This can also be a function which returns a string and
 *      takes the pathname and state as parameters
 *  - pathname: Either a string or a RegExp object specifying under what pathname the content can be found. If the
 *      content is found under an exact match (for example, something like "/art"), use a string, otherwise if the
 *      content is served based on data in the pathname (for example, something like "/users/248813886583603210"), use
 *      a regular expression to validate the pathname
 *  - component: A string containing the name of the component that the content is generated from. This name should be
 *      prefixed with "tomika-content-" in most cases
 *  - auth: A function which takes the pathname and state as parameters which and returns a boolean. The content will
 *      only be served if this function returns true. In the event no auth function is available, it is assumed the
 *      content is available for everyone
 */

export default {
	namespaced: true,
	state: {

		// The component that has the currently displayed content
		content: null,

		// Pane visibility states
		navDrawerOpen: false,
		discordPaneOpen: false,
		twitchPaneOpen: false,
		twitterPaneOpen: false,

		// Popup visibility states
		settingsOpen: false,

		// Misc
		unreadTweets: false,

		// Array of data specifying what content is available on the site
		contentData: [
			{
				id: 'index',
				name: "Home",
				title: 'Home of Tomika',
				pathname: '/',
				component: 'tomika-content-index'
			},
			{
				id: 'art',
				name: 'Art',
				title: 'Art',
				pathname: /^\/artwork\/[0-9]+$/,
				component: 'fake-component'
			}
		]

	},
	getters: {

	},
	mutations: {
		// Content mutation
		setContent(state, payload) {
			if (typeof payload === 'object') {
				state.content = payload;
			}
		},

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
		switchContent({ state, commit }, { pathname, handle404, pushState }) {
			if (pushState === undefined) { pushState = true; }
			if (pathname !== '/') { pathname = pathname.replace(/\/$/, ''); }
			// Attempt to find the content which corresponds to the pathname specified
			let contentData = state.contentData.find((e) => {
				if (typeof e.pathname === 'object' && e.pathname instanceof RegExp) { return e.pathname.test(pathname); }
				else { return e.pathname === pathname; }
			});
			// Check if content was found
			if (contentData) {
				// Change the URL so it matches
				if (pushState) { window.history.pushState(null, null, pathname); }
				else { window.history.replaceState(null, null, pathname); }
				// Change the title of the page
				document.querySelector('title').innerText = typeof contentData.title === 'function' ?
					contentData.title(pathname, state) : contentData.title;
				// Set the content component
				commit('setContent', contentData);
			} else if (handle404) {
				console.log('404');
			}
		}
	}
}