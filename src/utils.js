const utils = {
	isLocation: !!(window.history.location || window.location),

	validLink(el) {
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
		if (
			el.hasAttribute('download') ||
			el.getAttribute('rel') === 'external'
		) {
			return false;
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
		if (!svg && !this.sameOrigin(el.href)) return false;

		return true;
	},

	/**
	 * Match the path with specified routes
	 * Taken from https://github.com/vijitail/simple-javascript-router/blob/master/src/router/Router.js#L14
	 * with some modifications to fix bad behavior
	 */
	match(route, requestPath) {
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
	},

	/**
	 * Convert to a URL object
	 * https://github.com/visionmedia/page.js/blob/4f9991658f9b9e3de9b6059bade93693af24d6bd/page.js#L888
	 */
	toURL(href) {
		if (typeof URL === 'function' && this.isLocation) {
			return new URL(href, window.location.toString());
		} else {
			var anc = window.document.createElement('a');
			anc.href = href;
			return anc;
		}
	},

	/**
	 * Check if `href` is the same origin.
	 * https://github.com/visionmedia/page.js/blob/4f9991658f9b9e3de9b6059bade93693af24d6bd/page.js#L888
	 */
	sameOrigin(href) {
		if (!href || !this.isLocation) return false;

		var url = this.toURL(href);
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
	},

	samePath(url) {
		if (!this.isLocation) return false;
		var loc = window.location;
		return url.pathname === loc.pathname && url.search === loc.search;
	},

	/**
	 * Take the router's element and check for settings attribute
	 */
	detectRouterSettings(el) {
		let routerSettings = {};
		// The router basepath which will be added at the begining
		// of every route in this router
		if (el.hasAttribute('x-base')) {
			routerSettings.base = el.getAttribute('x-base');
		}
		if (el.hasAttribute('x-render')) {
			let selector = el.getAttribute('x-render');
			routerSettings.render = selector == '' ? 'body' : selector;
		}
		return routerSettings;
	},
};

export default utils;
