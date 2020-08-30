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
 *      back-end exclusively
 *  - The credentials option in the options object defaults to 'include', to also send cookies for authentication
 *  - Error handling for when the back-end is unreachable
 *  - The return value, instead of being a Response object, will be an object containing the following:
 *    - success: boolean representing whether or not the request succeeded. This includes back-end availability AND http
 *        error codes in the 4xx and 5xx categories
 *    - r: the original Response object that is normally returned by fetch
 *    - o: if the method was set to GET, the JSON is automatically processed and placed in this object
 *    - err: if the request failed, information concerning the error will be placed in here
 *  - The request module in the store will be updated with whether or not a request is in progress
 * @param path The path of the back-end resource
 * @param options The options object for fetch
 * @returns {Promise<Object>} A promise for the returned object
 */
const f = async (path, options) => {
	let obj = { success: true };
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
		obj.r = await fetch(backEnd + path, options);
		store.commit('app/setBackEndUnreachable', false);
		if (obj.r.ok) {
			try {
				obj.o = await obj.r.json();
			} catch (err) {
				obj.success = false;
				obj.err = err;
			}
		} else {
			obj.success = false;
		}
	} catch (err) {
		store.commit('app/setBackEndUnreachable');
		obj.success = false;
		obj.err = err;
	}
	store.commit('request/setProgress', { path });
	return obj;
};

/*---------*
 | Exports |
 *---------*/

export default f;