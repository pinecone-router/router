import Route from './route.js';
import utils from './utils.js';

const AlpineRouter = {
	routes: [],
	settings: [],
	loading: false,
	notfound: function () {
		console.log('Alpine Router: not found');
	},

	start() {
		if (!window.Alpine) {
			throw new Error('Alpine is require for `Alpine Router` to work.');
		}
		const loadstarted = new Event('loadstarted');
		const loadended = new Event('loadended');
		const pagechanged = new Event('pagechanged');

		// Get the amout of routers in the page at load.
		// However routers may be added dynamically and they will also be setup.
		// This is only to detect all routers currently loaded are initialized
		// in order to process the current page.
		let routerCount = document.querySelectorAll('[x-data][x-router]')
			.length;

		// Routers that are already set up
		let currentRouterCount = 0;

		// Whenever a component is initialized, check if it is a router
		// and run test the children if they're valid routes
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
				if (routerName == '') {
					routerName = 'default';
				}

				// Loop through routes of this router
				Array.from(component.$el.children).forEach((el) => {
					if (el.hasAttribute('x-route')) {
						this.processRoute(el, component, routerName);
					}
				});

				currentRouterCount++;
				// this will run when all routers are set up
				// in order to handle the current page
				if (currentRouterCount == routerCount) {
					console.log({ routerCount });
					// navigate to the current page to handle it
					this.navigate(location.pathname + location.hash);
				}
			}
		});

		// Intercept click event in links
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

		let path = el.getAttribute('x-route');
		let handlerName = el.getAttribute('x-handler');
		let handler = component.getUnobservedData()[handlerName];

		if (path == 'notfound') {
			// register the route as a 404 handlerconsole.warn(
			this.notfound = handler;
		} else {
			// check if the route was registered on the same router.
			// this allow having multiple routers with the same route
			// for example a router for navigation and router for content
			let routeExist = this.routes
				.filter((route) => utils.match(route, path))
				.forEach((e) => {
					if (e.routerName == routerName) return true;
				});
			if (routeExist) {
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
			routes.forEach((route) => route.handle());
		}
	},
};

const alpine = window.deferLoadingAlpine || ((callback) => callback());

window.AlpineRouter = AlpineRouter;

window.deferLoadingAlpine = function (callback) {
	window.AlpineRouter.start();

	alpine(callback);
};

export default AlpineRouter;
