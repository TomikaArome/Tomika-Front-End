/**
 * This file is used for defining a variety of utility functions useful across the application
 */

/*----------*
 | Promises |
 *----------*/

/**
 * Wrapper for setTimeout with promises
 * @param time Number of milliseconds to wait for
 */
function wait(time) {
	return new Promise((resolve) => { setTimeout(resolve, time); });
}

/*--------*
 | Export |
 *--------*/

export {
	wait
}