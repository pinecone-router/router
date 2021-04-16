import Route from './route.js';
import Router from './router.js';
import utils from './utils.js';

const AlpineRouter = {
	// routes are instantiated from the Routes classs
	routes: [],

	// array of trings that hold routers name which must be unique.
	routers: [],

	// These can be used to control Alpine Router externally
	settings: {
		interceptLinks: true, // detect if links are of the same origin and let Alpine Router handle them
	},

	// this will be set to true after all routers are
	// initialized and the first page loaded
	loaded: false,

	// The handler for 404 pages, can be overwritten by a custom route
	notfound: function () {
		console.error('Alpine Router: not found');
	},

	// Entry point of the plugin
	start() {
		if (!window.Alpine) {
			throw new Error('Alpine is require for `Alpine Router` to work.');
		}

		// will be dispatched before the handler on the responsible router only
		this.loadstart = new Event('loadstart');
		// will be dispatched after the handler is done on the responsible router only
		this.loadend = new Event('loadend');
		// will be dispatched to all routers after any page change
		this.pagechange = new Event('pagechange');

		// Get the amout of routers in the page at load.
		// However routers may be added dynamically and they will also be initialized.
		let routerCount = document.querySelectorAll('[x-data][x-router]')
			.length;

		// Routers that are already initialized
		let currentRouterCount = 0;

		// Whenever a component is initialized, check if it is a router
		// and check if the children are valid routes
		Alpine.onComponentInitialized((component) => {
			if (component.$el.hasAttribute('x-router')) {
				// take the router name if specified
				let routerName = component.$el.getAttribute('x-router');
				if (typeof routerName != 'string') {
					console.warn(
						'Alpine Router: x-router attribute should be a string of the router name or empty for default'
					);
					routerName = 'default';
				}

				// empty x-router will turn to default,
				// to easily querySelector() the router later on in this.navigate
				if (routerName == '') {
					routerName = 'default';
					component.$el.setAttribute('x-router', routerName);
				}

				// A router must have a unique name
				// each route will have the name of its router (see this.processRoute() in next lines)
				if (this.routers.findIndex((r) => r.name == routerName) > -1) {
					throw new Error(
						`Alpine Router: A router with the name ${routerName} already exist. Use a different name by setting the attribute x-router to another value`
					);
				}

				// Detect other router settings
				let routerSettings = {};
				// The router basepath which will be added at the begining
				// of
				if (component.$el.hasAttribute('x-base')) {
					routerSettings.base = component.$el.getAttribute('x-base');
				}

				if (typeof routerName != 'string') {
					console.warn(
						'Alpine Router: x-router attribute should be a string of the router name or empty for default'
					);
					routerName = 'default';
				}

				// Loop through child elements of this router
				Array.from(component.$el.children).forEach((el) => {
					// if the element is a route process it
					if (el.hasAttribute('x-route')) {
						this.processRoute(el, component, routerName);
					}
				});

				// Add the router name to the routers array to check for its existance
				this.routers.push(new Router(routerName, routerSettings));

				currentRouterCount++;

				// this will run when all routers are set up
				// in order to handle the current page
				if (currentRouterCount == routerCount) {
					// navigate to the current page to handle it
					this.navigate(location.pathname + location.hash);
					this.loaded = true;
				}
			}
		});

		// Intercept click event in links
		if (this.settings.interceptLinks) {
			document.querySelectorAll('a').forEach((el) => {
				// check if the link should watched for click events.
				if (utils.validLink(el) == false) return;

				el.addEventListener(
					'click',
					(e) => {
						e.preventDefault();
						this.navigate(e.target.getAttribute('href'));
					},
					false
				);
			});
		} else {
			// If we're not intercepting all links, only watch ones with x-link attribute
			document.querySelectorAll('a[x-link]').forEach((el) => {
				el.addEventListener(
					'click',
					(e) => {
						e.preventDefault();
						this.navigate(e.target.getAttribute('x-link'));
					},
					false
				);
			});
		}

		// handle navigation events not emitted by links, for exmaple, back button.
		window.addEventListener('popstate', (e) => this.navigate(e.detail));
	},

	/**
	 * Take the template element of a route and the router component
	 * and test if it can be added or not
	 */
	processRoute(el, component, routerName) {
		if (el.tagName.toLowerCase() !== 'template') {
			throw new Error(
				'Alpine Router: x-route must be used on a template tag.'
			);
		}

		if (el.hasAttribute('x-handler') == false) {
			throw new Error(
				'Alpine Router: x-route must have a handler (x-handler="handler")'
			);
		}

		// The path will be on x-route and handler on x-handler
		// The path must be a string and the handler a function callback
		let path = el.getAttribute('x-route');
		if (typeof path != 'string') {
			throw new Error(
				`Alpine Router: x-route must be a string, ${typeof path} given.`
			);
		}
		let handlerName = el.getAttribute('x-handler');

		let handler;
		try {
			handler = component.getUnobservedData()[handlerName];
		} catch (error) {
			throw new Error('Alpine Router: ' + error);
		}

		if (typeof handler != 'function') {
			throw new Error(
				`Alpine Router: handler must be a callback function, ${typeof handler} given.`
			);
		}

		if (path == 'notfound') {
			// register the route as a 404 handler
			this.notfound = handler;
		} else {
			// check if the route was registered on the same router.
			// this allow having multiple routers with the same route
			// for example a router for navigation and router for content
			let routeExist = this.routes
				.filter((route) => utils.match(route, path))
				.forEach((e) => {
					if (e.router == routerName) return true;
				});
			if (routeExist == true) {
				throw new Error(
					'Alpine Router: Route `${path}` is already registered on router `${routerName}`.'
				);
			} else {
				// register the new route.
				this.routes.push(new Route(path, handler, routerName));
			}
		}
	},

	/**
	 * Go to the specified path without reloading
	 * Based on https://github.com/vijitail/simple-javascript-router/blob/master/src/router/Router.js#L37
	 */
	navigate(path) {
		const routes = this.routes.filter((route) => utils.match(route, path));
		if (!routes) this.notfound();
		else {
			// handle many routes for different routers
			// but only push the route once to history
			history.pushState({}, '', path);
			routes.forEach((route) => {
				let routerEl = document.querySelector(
					`[x-router="${route.router}"]`
				);
				routerEl.dispatchEvent(this.loadstart);
				route.handle();
				routerEl.dispatchEvent(this.loadend);
			});
		}
		let routers = Array.from(document.querySelectorAll(['x-router']));
		routers.forEach((r) => r.dispatchEvent(this.pagechange));
	},
};

const alpine = window.deferLoadingAlpine || ((callback) => callback());

window.AlpineRouter = AlpineRouter;

window.deferLoadingAlpine = function (callback) {
	window.AlpineRouter.start();

	alpine(callback);
};

export default AlpineRouter;
