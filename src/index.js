const AlpineRouter = {
	routes: [],
	isLocation: !!(window.history.location || window.location),
	notfound: function () {
		console.log('Alpine Router: not found');
	},

	start() {
		if (!window.Alpine) {
			throw new Error('Alpine is require for `Alpine Router` to work.');
		}

		// Whenever a component is initialized, check if it is a router
		// and run test the children if they're valid routes
		Alpine.onComponentInitialized((component) => {
			if (component.$el.hasAttribute('x-router')) {
				Array.from(component.$el.children).forEach((el) => {
					if (el.hasAttribute('x-route')) {
						this.processRoute(el, component);
					}
				});
			}
		});

		// Intercept click event in links
		document.querySelectorAll('a').forEach((el) => {
			// Taken from page.js https://github.com/visionmedia/page.js/blob/master/index.js#L370
			// el.nodeName for svg links are 'a' instead of 'A'
			while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
			if (!el || 'A' !== el.nodeName.toUpperCase()) return;

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
				return;
			}

			var link = el.getAttribute('href');

			// Check for mailto: in the href
			if (link && link.indexOf('mailto:') > -1) return;

			// check target
			// svg target is an object and its desired value is in .baseVal property
			if (svg ? el.target.baseVal : el.target) return;

			// x-origin
			// note: svg links that are not relative don't call click events (and skip page.js)
			// consequently, all svg links tested inside page.js are relative and in the same origin
			if (!svg && !this.sameOrigin(el.href)) return;

			el.addEventListener(
				'click',
				(e) => {
					e.preventDefault();
					this.navigate(e.target.getAttribute('href'));
				},
				false
			);
		});
		
		window.addEventListener('popstate', (e) => router.navigate(e.detail));
	
		// navigate to the current page to handle it
		this.navigate(location.pathname + location.hash);
	},

	/**
	 * Take the template element of a route and the router component
	 * and test if it can be added or not
	 */
	processRoute(el, component) {
		if (el.tagName.toLowerCase() !== 'template') {
			throw new Error(
				'Alpine Router: x-routes must be used on a template tag.'
			);
		}

		if (el.hasAttribute('x-handler') == false) {
			throw new Error(
				'Alpine Router: x-route must have a handler (x-handler="handler")'
			);
		}

		let path = el.getAttribute('x-route');
		let handlerName = el.getAttribute('x-handler');
		let handler = component.getUnobservedData()[handlerName];

		if (path == 'notfound') {
			// register the route as a 404 handler
			this.notfound = handler;
		} else {
			// register the new route.
			this.routes.push(new Route(path, handler));
		}
	},

	/**
	 * Match the path with specified routes
	 * https://github.com/vijitail/simple-javascript-router/blob/master/src/router/Router.js#L14
	 */
	match(route, requestPath) {
		let paramNames = [];
		let regexPath =
			route.path.replace(/([:*])(\w+)/g, (_full, _colon, name) => {
				paramNames.push(name);
				return '([^/]+)';
			}) + '(?:/|$)';

		let params = {};
		let routeMatch = requestPath.match(new RegExp(regexPath));
		if (routeMatch !== null) {
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
	 * Go to the specified path without reloading
	 * https://github.com/vijitail/simple-javascript-router/blob/master/src/router/Router.js#L37
	 */
	navigate(path) {
		const route = this.routes.filter((route) => this.match(route, path))[0];
		if (!route) this.notfound();
		else {
			history.pushState({}, '', path);
			route.handle();
		}
	},

	/**
	 * Convert to a URL object
	 * https://github.com/visionmedia/page.js/blob/4f9991658f9b9e3de9b6059bade93693af24d6bd/page.js#L888
	 */
	_toURL(href) {
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

		var url = this._toURL(href);
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
	_samePath(url) {
		if (!this.isLocation) return false;
		var loc = window.location;
		return url.pathname === loc.pathname && url.search === loc.search;
	},
};

class Route {
	constructor(path, handler) {
		this.path = path;
		this.handler = handler;
	}

	setProps(newProps) {
		this.props = newProps;
	}

	handle() {
		return this.handler(this.props);
	}
}

const alpine = window.deferLoadingAlpine || ((callback) => callback());

window.AlpineRouter = AlpineRouter;

window.deferLoadingAlpine = function (callback) {
	window.AlpineRouter.start();

	alpine(callback);
};

export default AlpineRouter;
