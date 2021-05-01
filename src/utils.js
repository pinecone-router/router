var isLocation = !!(window.history.location || window.location);

/**
 * Check if the anchor element point to a navigation route.
 * @param {Element} el The anchor element
 * @param {boolean} hash Set to true when using hash routing
 * @returns {bool} true if the link is valid for navigation, false otherwise
 */
export function validLink(el, hash) {
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
 * Create the context object
 * @param {string} route the route
 * @param {string} path the path accessed by the client
 * @param {array} props the routes variables
 * @returns {object} the context object
 */
export function buildContext(route, path, props) {
	return {
		route: route,
		path: path,
		props: props,
		query: window.location.search.substring(1), // query w/out leading '?'
		hash: window.location.hash.substring(1), // hash without leading '#'
		redirect: (path) => {
			window.PineconeRouter.navigate(path);
			return false; // returning false will stop the navigate function, before rendering any views etc.
		},
	};
}

/**
 * Call a function on all middlewares loaded, if any.
 * @param {string} func middlware function to call.
 * @param {array} args arguments to pass to the function.
 * @returns {boolean} false if the middleware function return false, i.e. it want to stop execution of the function and return.
 */
export function middleware(func, args) {
	if (window.PineconeRouterMiddlewares == null) return;
	window.PineconeRouterMiddlewares.forEach((plugin) => {
		if (plugin[func] == null) return;
		return plugin[func](...args);
	});
}

/**
 * execute the handlers of routes that are given passing them the context.
 * @param {array} handlers handlers to execute.
 * @param {array} context the current context to pass as argument.
 * @returns {boolean} false if the handler request a redirect.
 */
export function handle(handlers, context) {
	switch (typeof handlers) {
		// multiple handlers; typeof array == 'object
		case 'object':
			if (handlers.length == 0) return;

			for (const i in handlers) {
				if (typeof handlers[i] == 'function') {
					let result = handlers[i](context);
					// if the handler redirected, return
					// if not go to the next handler
					if (result == false) {
						return false;
					}
				}
			}
			break;

		// single handler
		case 'function':
			return handlers(context);
	}
}

/**
 * Match the path with specified routes
 * Taken from https://github.com/vijitail/simple-javascript-router/blob/master/src/router/Router.js#L14
 * with some modifications to fix bad behavior
 * @param {string} route the route to check for.
 * @param {string} requestPath the path that's requested by the client.
 */
export function match(route, requestPath) {
	let paramNames = [];
	let path = route.path.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	let regexPath =
		path.replace(/([:^\s])(\w+)/g, (_full, _colon, name) => {
			paramNames.push(name);
			return '([^/]+)';
		}) + '(?:/|$)';

	let routeMatch = requestPath.match(new RegExp(regexPath));
	if (routeMatch !== null) {
		if (routeMatch.index != 0) return null;
		if (routeMatch.input != routeMatch[0]) return null;
		let props = routeMatch.slice(1).reduce((params, value, index) => {
			if (params === null) params = {};
			params[paramNames[index]] = value;
			return params;
		}, null);
		route.setProps(props);
	}

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
