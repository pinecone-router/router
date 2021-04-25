var isLocation = !!(window.history.location || window.location);

/**
 * Check if the anchor element point to a navigation route.
 * @param {Element} el The anchor element
 * @param {boolean} hash Set to true when using hash routing
 * @returns {bool} true if the link is valid for navigation, false otherwise
 */
function validLink(el, hash) {
	// The checks in this block are taken from page.js https://github.com/visionmedia/page.js/blob/master/index.js#L370
	// el.nodeName for svg links are 'a' instead of 'A'
	while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
	if (!el || 'A' !== el.nodeName.toUpperCase()) return false;

	// check if link is inside an svg
	// in this case, both href and target are always inside an object
	var svg =
		typeof el.href === 'object' &&
		el.href.constructor.name === 'SVGAnimatedString';

	// Ignore if tag has
	// 1. "download" attribute
	// 2. rel="external" attribute
	if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') {
		return false;
	}

	// ensure non-hash for the same path
	var link = el.getAttribute('href');
	if (!hash && samePath(el) && (el.hash || '#' === link)) {
		return;
	}

	var link = el.getAttribute('href');

	// Check for mailto: in the href
	if (link && link.indexOf('mailto:') > -1) return false;

	// check target
	// svg target is an object and its desired value is in .baseVal property
	if (svg ? el.target.baseVal : el.target) return false;

	// x-origin
	// note: svg links that are not relative don't call click events (and skip page.js)
	// consequently, all svg links tested inside page.js are relative and in the same origin
	if (!svg && !sameOrigin(el.href)) return false;

	return true;
}

/**
 * Process trailing slash in path based on settings
 * @param {string} path the path to be processed
 * @param {boolean} trail null to ignore true to add false to remove
 * @param {string} path path after adding or removing the slash
 */
export function processTrailingSlash(path, trail) {
	switch (trail) {
		case true:
			if (!path.endsWith('/')) {
				path += '/';
			}
			break;
		case false:
			if (path.endsWith('/')) {
				path = path.substr(0, path.length - 1);
			}
	}
	return path;
}

/**
 * @param {boolean} hash set to  true when using hash routing
 * @param {object} render render settings
 * @description Add a handler to click events on all links currently in the page
 * if using page or views rendering this will be called everytime the page changes
 * this may also be called by the developer if they added other links dynamicly
 */
export function interceptLinks(hash, render = null) {
	document.querySelectorAll('a').forEach((el) => {
		// check if we already add this link
		if (el.hasAttribute('x-link')) return;
		// check if the link is a navigation link
		if (validLink(el, hash) == false) return;

		// add an x-link attribute this will tell this function
		// that the link already been handled.
		el.setAttribute('x-link', '');

		// X-RENDER ONLY
		if (render != null) {
			el.addEventListener('mouseover', (e) => {
				if (!render.enabled || !render.preload) {
					return;
				}
				let path = e.target.getAttribute('href');
				if (path == null) path = '/';
				if (render.preloaded.path == path) {
					return;
				}

				window.setTimeout(function () {
					fetch(path)
						.then((response) => {
							return response.text();
						})
						.then((response) => {
							render.preloaded.path = path;
							render.preloaded.content = response;
						});
				});
			});
		}
		// X-RENDER END

		el.addEventListener(
			'click',
			(e) => {
				e.preventDefault();
				let link = el.pathname;
				if (hash) {
					window.location.hash = '#' + link;
				} else {
					AlpineRouter.navigate(link);
				}
			},
			false
		);
	});
}

/**
 * This will replace the content fetched from `path` into `selector`.
 * The content is assumed to not be an entire html page but a chunk of it.
 * @param {string} content the html content.
 * @param {string} selector the selector of where to put the content.
 */
export function renderContent(content, selector) {
	// replace the content of the selector with the fetched content
	document.querySelector(selector).innerHTML = content;
}

/**
 * This will replace the content fetched from `path` into `selector`.
 * Unlike renderContent, this will assume the fetched content to be an entire HTML.
 * meaning it needs to process the routes as well.
 * @param {string} content the html content.
 * @param {string} selector the selector of where to put the content.
 * @param {array} routes routes array to be processed.
 * @returns {array} processed routes
 */
export function renderPage(content, selector, routes) {
	let doc = new DOMParser().parseFromString(content, 'text/html');
	doc = doc.querySelector(selector);
	// This takes the document fetched, remove routers already initialized from it
	// and also remove routers initialized but not found in it
	// that is for routers that are not needed in this page.
	let r = processRoutersInFetchedDoc(doc, selector, routes);
	doc = r.doc;
	content = doc.innerHTML;
	renderContent(content, selector);
	return r.routes;
}

export function buildContext(route, path, props) {
	return {
		route: route,
		path: path,
		props: props,
		query: window.location.search.substring(1), // query w/out leading '?'
		hash: window.location.hash.substring(1), // hash without leading '#'
		go: (path) => {
			window.AlpineRouter.navigate(path);
			return false; // returning false will stop the navigate function, before rendering any views etc.
		},
	};
}

/**
 * This takes the document fetched, remove routers already initialized from it
 * @param {Document} doc
 * @param {array} routes
 * @returns {object} {doc, routes}
 */
function processRoutersInFetchedDoc(doc, selector, routes) {
	let routersInDoc = doc.querySelectorAll('[x-router]');
	switch (routersInDoc.length) {
		case 0:
			// if there is no router in the fetched doc, remove the routes registered
			// but only if the selector is body
			if (selector == 'body') routes = [];
			break;
		case 1:
			// the router currently loaded
			let currentRouter = document.querySelector('[x-router]');
			// if the router in the doc dont have x-router set to 'loaded'
			// thus remove it from the current router element before checking if they're the same
			currentRouter.setAttribute('x-router', '');
			// check if the one in fetched doc is the same as the current one
			if (
				routersInDoc[0].isEqualNode(
					document.querySelector('[x-router]')
				)
			) {
				// if it is, mark the router as loaded, so routes wont be processed again
				routersInDoc[0].setAttribute('x-router', 'loaded');
				// remove the router element currently in the page, in case it is not within the selector.
				document.querySelector('[x-router]').remove();
			} else {
				// if they're not the same remove the routes, the new ones will be added once this new router is added
				routes = [];
				document.querySelector('[x-router]').remove();
			}
			break;
		default:
			// more than one
			throw new Error(
				'Alpine Router: there can only be one router in the same page'
			);
	}

	return { doc, routes };
}

/**
 * Match the path with specified routes
 * Taken from https://github.com/vijitail/simple-javascript-router/blob/master/src/router/Router.js#L14
 * with some modifications to fix bad behavior
 */
export function match(route, requestPath) {
	let paramNames = [];
	let path = route.path.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	let regexPath =
		path.replace(/([:^\s])(\w+)/g, (_full, _colon, name) => {
			paramNames.push(name);
			return '([^/]+)';
		}) + '(?:/|$)';

	let params = {};
	let routeMatch = requestPath.match(new RegExp(regexPath));
	if (routeMatch !== null) {
		if (routeMatch.index != 0) return null;
		if (routeMatch.input != routeMatch[0]) return null;
		params = routeMatch.slice(1).reduce((params, value, index) => {
			if (params === null) params = {};
			params[paramNames[index]] = value;
			return params;
		}, null);
	}

	route.setProps(params);
	return routeMatch;
}

/**
 * Convert to a URL object
 * https://github.com/visionmedia/page.js/blob/4f9991658f9b9e3de9b6059bade93693af24d6bd/page.js#L888
 */
function toURL(href) {
	if (typeof URL === 'function' && isLocation) {
		return new URL(href, window.location.toString());
	} else {
		var anc = window.document.createElement('a');
		anc.href = href;
		return anc;
	}
}

/**
 * Check if `href` is the same origin.
 * https://github.com/visionmedia/page.js/blob/4f9991658f9b9e3de9b6059bade93693af24d6bd/page.js#L888
 */
function sameOrigin(href) {
	if (!href || !isLocation) return false;

	var url = toURL(href);
	var loc = window.location;

	/*
		   When the port is the default http port 80 for http, or 443 for
		   https, internet explorer 11 returns an empty string for loc.port,
		   so we need to compare loc.port with an empty string if url.port
		   is the default port 80 or 443.
		   Also the comparition with `port` is changed from `===` to `==` because
		   `port` can be a string sometimes. This only applies to ie11.
		*/
	return (
		loc.protocol === url.protocol &&
		loc.hostname === url.hostname &&
		(loc.port === url.port ||
			(loc.port === '' && (url.port == 80 || url.port == 443)))
	); // jshint ignore:line
}

function samePath(url) {
	if (!isLocation) return false;
	var loc = window.location;
	return url.pathname === loc.pathname && url.search === loc.search;
}
