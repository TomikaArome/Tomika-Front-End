/**
 * The purpose of this folder is to have one centralised location for all requests made to the back end
 * This file creates a wrapper for the fetch API that is specialised for communication with the back-end
 */

/*----------*
 | Requires |
 *----------*/

// Imports
import store from '../store/store';
// This needs changing later when I have a better understanding of how to import configs
const config = {
	'back-end-url': process.env.NODE_ENV === 'development' ? 'http://localhost' : 'https://ec2.tomika.ink'
};

/*-----------*
 | Constants |
 *-----------*/

// Constant for the back-end for convenience (this value should never change)
const backEnd = config['back-end-url'];

/**
 * Wrapper for fetch. The differences from fetch include:
 *  - Instead of providing a full URL, only the path should be provided since this wrapper is meant for use with the
 *    back-end exclusively
 *  - The credentials option in the options object defaults to 'include', to also send cookies for authentication
 *  - Error handling for when the back-end is unreachable
 *  - The return value is the result of the JSON obtained in the back-end. Even if the fetch result encounters an error
 *    it will still be structured in the same was, that is to say:
 *    - ok: Whether or not the request succeeded. If it fails, that could be due to an error when fetching or an
 *      application error
 *    - error: If ok is false, the error that caused it to fail. This is always an object with a code an a message, and
 *      sometimes some extra context for the error
 *    - result: If ok is true, the result of the request
 *    - fetch: This property is not provided by the back-end, it's the original fetch object from the Fetch API, if
 *      needed
 * @param path The path of the back-end resource
 * @param options The options object for fetch
 * @returns {Promise<Object>} A promise for the returned object
 */
const f = async (path, options) => {
	let r = {};
	if (!options) { options = {}; }
	if (!options.credentials) { options.credentials = 'include'; }
	options.method = options.method ? options.method.toUpperCase() : 'GET';
	if (options.body) {
		if (!options.headers) { options.headers = {}; }
		options.headers['Content-Type'] = 'application/json';
		if (typeof options.body === 'object') { options.body = JSON.stringify(options.body); }
	}
	store.commit('request/setProgress', { path, progress: true });
	try {
		let fetchResult = await fetch(backEnd + path, options);
		store.commit('app/setBackEndUnreachable', false);
		if (fetchResult.ok) {
			try {
				r = await fetchResult.json();
				// At this point either the result is positive, or the back-end sent another error of its own
				// If the error was specifically DISAUTH_REFRESH_NOT_PERMITTED, the user has been logged out so we must
				// redirect them to a page where they can connect their Discord account again
				// TODO
			} catch (err) {
				r.ok = false;
				r.error = {
					code: 'CLIENTFETCH_INVALID_JSON',
					message: 'The back-end received the request but the response was not valid JSON'
				};
			}
		} else {
			r.ok = false;
			r.error = {
				code: 'CLIENTFETCH_OK_FALSE',
				message: 'The fetch API sent back an error'
			};
		}
		r.fetch = fetchResult;
	} catch (err) {
		store.commit('app/setBackEndUnreachable');
		r.ok = false;
		r.error = {
			code: 'CLIENTFETCH_BACK_END_UNREACHABLE',
			message: 'The back-end could not be reached'
		};
	}
	store.commit('request/setProgress', { path });
	return r;
};

/*---------*
 | Exports |
 *---------*/

export default f;