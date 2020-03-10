/**
 * This file contains data and functionality to manage what content is shown on the page
 * The data array is organised as follows:
 *  - id: A string to identify the content. Often the component name with the prefix
 *  - name: The name of the content as it appears in the nav bar and in the nav drawer
 *  - title: A string containing the contents of the <title> tag. This can also be a function which returns a string and
 *      takes the pathname and store as parameters
 *  - pathname: Either a string or a RegExp object specifying under what pathname the content can be found. If the
 *      content is found under an exact match (for example, something like "/art"), use a string, otherwise if the
 *      content is served based on data in the pathname (for example, something like "/users/248813886583603210"), use
 *      a regular expression to validate the pathname
 *  - component: A string containing the name of the component that the content is generated from. This name should be
 *      prefixed with "tomika-content-" in most cases
 *  - auth: A function which takes the pathname and store as parameters which and returns a boolean. The content will
 *      only be served if this function returns true. In the event no auth function is available, it is assumed the
 *      content is available for everyone
 */

// Import dependencies
import store from './store/store';

// Array of data specifying what content is available on the site
const data = [
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
];

/**
 * Switches the content by first checking the content exists
 * @param pathname The pathname of the content to switch to
 * @param handle404 If true, switch to the 404 page in the event the pathname did not correspond to any content
 * @param pushState If true, a new entry in the user's browser history will be created. Defaults to true
 */
const switchContent = (pathname, handle404, pushState) => {
	if (pushState === undefined) { pushState = true; }
	if (pathname !== '/') { pathname = pathname.replace(/\/$/, ''); }
	let contentData = data.find((e) => {
		if (typeof e.pathname === 'object' && e.pathname instanceof RegExp) { return e.pathname.test(pathname); }
		else { return e.pathname === pathname; }
	});
	if (contentData) {
		// Change the URL so it matches
		if (pushState) { window.history.pushState(null, null, pathname); }
		else { window.history.replaceState(null, null, pathname); }
		// Change the title of the page
		document.querySelector('title').innerText = typeof contentData.title === 'function' ?
			contentData.title(pathname, store) : contentData.title;
		// Set the content component
		store.commit('nav/setContentComponent', contentData.component);
	} else if (handle404) {
		console.log('404');
	}
};

export {
	data,
	switchContent
}