import { Context } from ".";

var isLocation = window.location;

/**
 * Create the context object
 */
export function buildContext(route: string, path: string, params: {}): Context {
	return {
		route: route,
		path: path,
		params: params,
		query: window.location.search.substring(1), // query w/out leading '?'
		hash: window.location.hash.substring(1), // hash without leading '#'
		redirect: (path: string): string => {
			window.PineconeRouter.navigate(path);
			// returning 'stop' will stop the navigate function
			// and return before calling any middleware.
			return 'stop';
		},
	};
}

/**
 * taken from preact-router
 * https://github.com/preactjs/preact-router
 * @param url url to segmentize
 * @returns
 */
function segmentize(url: string): string[] {
	return url.replace(/(^\/+|\/+$)/g, '').split('/');
}

/**
 * check if a path match with this route
 * taken from preact-router
 * https://github.com/preactjs/preact-router
 * @param path {string}
 * @param routePath {string}
 * @returns {false|object}
 */
export function match(url: string, routePath: string): false | object {
	let reg = /(?:\?([^#]*))?(#.*)?$/,
		c = url.match(reg),
		matches: any = {},
		ret;
	if (c && c[1]) {
		let p = c[1].split('&');
		for (let i = 0; i < p.length; i++) {
			let r = p[i].split('=');
			matches[decodeURIComponent(r[0])] = decodeURIComponent(
				r.slice(1).join('=')
			);
		}
	}
	let urlSeg = segmentize(url.replace(reg, '')),
		route: string[] = segmentize(routePath || ''),
		max = Math.max(urlSeg.length, route.length);
	for (let i = 0; i < max; i++) {
		if (route[i] && route[i].charAt(0) === ':') {
			let param: string = route[i].replace(/(^:|[+*?]+$)/g, ''),
				flags: string = (route[i].match(/[+*?]+$/) || {}).toString()[0],
				plus = ~flags.indexOf('+'),
				star = ~flags.indexOf('*'),
				val = urlSeg[i] || '';
			if (!val && !star && (flags.indexOf('?') < 0 || plus)) {
				ret = false;
				break;
			}
			matches[param] = decodeURIComponent(val);
			if (plus || star) {
				matches[param] = urlSeg
					.slice(i)
					.map(decodeURIComponent)
					.join('/');
				break;
			}
		} else if (route[i] !== urlSeg[i]) {
			ret = false;
			break;
		}
	}
	if (ret === false) return false;
	return matches;
}
/**
 * Call a function on all middlewares loaded, if any.
 * @param {string} func middleware function to call.
 * @param {any} args arguments to pass to the function.
 * @returns {boolean} false if the middleware function return false, i.e. it want to stop execution of the function and return.
 */
export function middleware(func: string, ...args: any): string | undefined {
	if (!window.PineconeRouterMiddlewares) return;
	for (const i in window.PineconeRouterMiddlewares) {
		let plugin: any = window.PineconeRouterMiddlewares[i];
		if (plugin[func] == null) return;
		let ret = plugin[func](...args);
		// the return of the function will only be 'stop'
		// if the middleware request stopping the navigate function.
		if (ret == 'stop') return 'stop';
	}
}

/**
 * @param {any} expression the expression to eval
 * @param {object} dataContext the alpine component data object
 * @param {object} additionalHelperVariables
 * @returns
 */
export function saferEval(
	expression: any,
	dataContext: object,
	additionalHelperVariables: object = {}
) {
	// eslint-disable-next-line no-new-func
	return new Function(
		//@ts-ignore
		['$data', ...Object.keys(additionalHelperVariables)],
		`var __alpine_result; with($data) { __alpine_result = ${expression} }; return __alpine_result`
	)(dataContext, ...Object.values(additionalHelperVariables));
}

/**
 * execute the handlers of routes that are given passing them the context.
 * @param {array} handlers handlers to execute.
 * @param {object} context the current context to pass as argument.
 * @returns {boolean} false if the handler request a redirect.
 */
export function handle(handlers: Array<Function>, context: object): boolean {
	for (let i = 0; i < handlers.length; i++) {
		if (typeof handlers[i] == 'function') {
			let result = handlers[i](context);
			// if the handler redirected, return
			if (result == 'stop') return false;
		}
	}
	return true;
}

/**
 * Convert to a URL object
 * https://github.com/visionmedia/page.js/blob/4f9991658f9b9e3de9b6059bade93693af24d6bd/page.js#L888
 */
function toURL(href: string): URL | HTMLAnchorElement {
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
export function sameOrigin(href: string) {
	if (!href || !isLocation) return false;

	var url = toURL(href);
	var loc = window.location;

	/*
	When the port is the default http port 80 for http, or 443 for
	https, internet explorer 11 returns an empty string for loc.port,
	so we need to compare loc.port with an empty string if url.port
	is the default port 80 or 443.
	Also the comparison with `port` is changed from `===` to `==` because
	`port` can be a string sometimes. This only applies to ie11.
	*/
	return (
		loc.protocol === url.protocol &&
		loc.hostname === url.hostname &&
		(loc.port === url.port ||
			(loc.port === '' && (url.port == '80' || url.port == '443')))
	); // jshint ignore:line
}

export function samePath(url: any) {
	if (!isLocation) return false;
	var loc = window.location;
	return url.pathname === loc.pathname && url.search === loc.search;
}
