// This needs changing later when I have a better understanding of how to import configs
// This bit of code has also been moved to ../requests/requests.js instead, it will no longer be needed here once the
// centralisation for requests has been finished
const config = {
	'back-end-url': process.env.NODE_ENV === 'development' ? 'http://localhost' : 'https://ec2.tomika.ink'
};

export default {
	namespaced: true,
	state: {
		backEnd: config['back-end-url'],
		backEndUnreachable: true,
		popupStack: [],
		appWidth: window.innerWidth,
		appHeight: window.innerHeight - 40
	},
	getters: {

	},
	mutations: {
		setBackEndUnreachable(state, payload) {
			if (typeof payload !== 'boolean') { payload = true; }
			state.backEndUnreachable = payload;
		},
		/**
		 * The structure of the object passed as payload should be as follows:
		 *  - popupComponent: a template object of the component that should be displayed. This could be the
		 *      tomika-popup element itself, or a wrapper component
		 *  - noScreenClose: if set to true, the popup won't close from clicking the screen
		 *  - bigPopup: if set to true, the popup will be fixed in size and will spread across the entire screen on
		 *      smaller screens
		 */
		pushPopup(state, payload) {
			if (!payload.popupComponent) { payload.popupComponent = 'div'; }
			state.popupStack.push(payload);
		},
		popPopup(state) {
			state.popupStack.pop();
		},
		setAppSize(state, payload) {
			state.appWidth = payload.w;
			state.appHeight = payload.h;
		}
	},
	actions: {

	}
}