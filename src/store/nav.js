/**
 * This file contains data and functionality to manage what content is shown on the page
 * The data array stored under "contentData" contains objects that are organised as follow:
 *  - name: The name of the content as it appears in the nav bar and in the nav drawer
 *  - title: A string containing the contents of the <title> tag. This can also be a function which returns a string and
 *      takes the pathname and state as parameters
 *  - pathname: Either a string or a RegExp object specifying under what pathname the content can be found. If the
 *      content is found under an exact match (for example, something like "/art"), use a string, otherwise if the
 *      content is served based on data in the pathname (for example, something like "/user/248813886583603210"), use
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

		// Array of data specifying what content is available on the site
		contentData: [
			{
				name: '404',
				title: 'Content not found',
				component: 'tomika-content-404'
			},
			{
				name: 'Home',
				title: 'Home of Tomika',
				pathname: '/',
				component: 'tomika-content-index'
			},
			{
				name: 'Admin tools',
				title: 'Admin tools',
				pathname: /^\/admin(\/[\w-]+)?$/,
				component: 'tomika-content-admin',
				auth: 'perm.admin.access'
			},
			{
				name: 'User settings',
				title: 'User settings',
				pathname: '/user',
				component: 'tomika-content-user',
				auth: (store) => { return store.getters['user/connected']; }
			},
			{
				name: 'Stream controller',
				title: 'Stream controller',
				pathname: '/stream-control',
				component: 'tomika-content-stream-control',
				auth: () => { return false; }
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
		}
	},
	actions: {
		async switchContent({ state, commit }, { pathname, component, pushState }) {
			if (pushState === undefined) { pushState = true; }
			let contentData = undefined;
			// Attempt to find the content which corresponds to either the pathname or component specified
			if (typeof pathname !== 'undefined') {
				// Get rid of the trailing slash
				if (pathname !== '/') { pathname = pathname.replace(/\/$/, ''); }
				contentData = state.contentData.find((o) => {
					if (typeof o.pathname === 'object' && o.pathname instanceof RegExp) { return o.pathname.test(pathname); }
					else { return o.pathname === pathname; }
				});
			} else if (typeof component !== 'undefined') {
				contentData = state.contentData.find((o) => { return o.component === component; });
			}
			// If the content object found has a dynamic pathname (not a string), the pathname parameter will have to have been set
			if (typeof pathname === 'undefined' && contentData && typeof contentData.pathname !== 'string') {
				contentData = undefined;
			}
			// If nothing was found, use the 404 component
			if (!contentData) {
				contentData = state.contentData.find((o) => { return o.component === 'tomika-content-404' });
			}
			// Change the URL so it matches
			if (pushState) { window.history.pushState(null, null, pathname); }
			else { window.history.replaceState(null, null, pathname); }
			// Change the title of the page
			document.querySelector('title').innerText = typeof contentData.title === 'function' ?
				contentData.title(pathname, state) : contentData.title;
			// Set the content component
			commit('setContent', contentData);
		}
	}
}