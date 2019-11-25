// This needs changing later when I have a better understanding of how to import configs
// This bit of code has also been moved to ../requests/requests.js instead, is will no longer be needed here once the
// centralisation for requests has been finished
const config = {
	'back-end-url': process.env.NODE_ENV === 'development' ? 'http://localhost' : 'https://ec2.tomika.ink'
};

export default {
	namespaced: true,
	state: {
		backEnd: config['back-end-url'],
		backEndUnreachable: true,
		popupStack: []
	},
	getters: {

	},
	mutations: {
		setBackEndUnreachable(state, payload) {
			if (typeof payload !== 'boolean') { payload = true; }
			state.backEndUnreachable = payload;
		},
		pushPopup(state, payload) {
			state.popupStack.push(payload);
		},
		popPopup(state) {
			state.popupStack.pop();
		}
	},
	actions: {

	}
}