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
		basepath: '/',
		hash: false,
	},

	// This will be set to true after all routers are
	// initialized and the first page loaded
	loaded: false,

	// The handler for 404 pages, can be overwritten by a custom route
	notfound: function (path) {
		console.error(`Alpine Router: requested path ${path} was not found`);
	},

	// Entry point of the plugin
	start() {
		if (!window.Alpine) {
			throw new Error('Alpine is require for `Alpine Router` to work.');
		}

		// will be dispatched to window when all routers are
		// initialized and the first page loaded
		this.routerloaded = new Event('routerloaded');
		// will be dispatched before the handler on the responsible router only and the window
		this.loadstart = new Event('loadstart');
		// will be dispatched after the handler is done on the responsible router only and the window
		this.loadend = new Event('loadend');

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

				if (typeof routerName != 'string') {
					console.warn(
						'Alpine Router: x-router attribute should be a string of the router name or empty for default'
					);
					routerName = 'default';
				}

				// A router must have a unique name
				// each route will have the name of its router (see this.processRoute() in next lines)
				if (this.routers.findIndex((r) => r.name == routerName) > -1) {
					throw new Error(
						`Alpine Router: A router with the name ${routerName} already exist. Use a different name by setting the attribute x-router to another value`
					);
				}

				// Detect other router settings
				let routerSettings = utils.detectRouterSettings(component.$el);
				// If using hash routing tell Alpine Router to check for hash everytime it changes
				if (this.settings.hash) {
					// window.onhashchange = () => {
					// 	// navigate to the hash route
					// 	this.navigate(window.location.hash.substring(1), true);
					// };
				}

				// Loop through child elements of this router
				Array.from(component.$el.children).forEach((el) => {
					// if the element is a route process it
					if (el.hasAttribute('x-route')) {
						this.processRoute(
							el,
							component,
							routerName,
							routerSettings
						);
					}
				});

				// Add the router name to the routers array to check for its existance
				this.routers.push(new Router(routerName, routerSettings));

				currentRouterCount++;

				// this will run when all routers are set up
				// in order to handle the current page
				if (currentRouterCount == routerCount) {
					if (!this.settings.hash) {
						// navigate to the current page to handle it
						// ONLY if we not using hash routing for the default router
						this.navigate(window.location.pathname);
					} else {
						if (window.location.hash == '') {
							document.location.href =
								window.location.pathname + '#/';
							return;
						} else {
							this.navigate(
								window.location.hash.substring(1),
								true
							);
						}
					}

					this.loaded = true;
					window.dispatchEvent(this.routerloaded);
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
						let link = e.target.getAttribute('href');
						if (this.settings.hash) {
							window.location.hash = '#' + link;
						} else {
							this.navigate(link);
						}
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
						let link = e.target.getAttribute('href');
						this.navigate(link);
					},
					false
				);
			});
		}

		// handle navigation events not emitted by links, for exmaple, back button.
		window.addEventListener('popstate', () => {
			if (this.settings.hash) {
				if (window.location.hash != '') {
					this.navigate(window.location.hash.substring(1), true);
				}
			} else {
				this.navigate(window.location.pathname, true);
			}
		});
	},

	/**
	 * Take the template element of a route and the router component
	 * and test if it can be added or not
	 */
	processRoute(el, component, routerName, routerSettings) {
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

		if (path.indexOf('#') > -1) {
			throw new Error(
				"Alpine Router: A route's path may not have a hash, setting AlpineRouter.settings.hash to true is sufficiant."
			);
		}

		// Get the hanlder which is a string because it's an attribute value
		// Use that string as an index to the component method which is meant to handle the route
		let handlerName = el.getAttribute('x-handler');
		let handler;
		try {
			handler = component.getUnobservedData()[handlerName];
		} catch (error) {
			throw new Error('Alpine Router: ' + error);
		}

		// Check if the hanlder is a function
		if (typeof handler != 'function') {
			throw new Error(
				`Alpine Router: handler must be a callback function, ${typeof handler} given.`
			);
		}

		if (path == 'notfound') {
			// register the route as a 404 handler
			this.notfound = handler;
		} else {
			// add basepath of the entire page/site
			if (['/', '#/'].includes(this.settings.basepath) == false) {
				path = this.settings.basepath + path;
			}

			// add basepath of the router
			if (routerSettings.base != null) {
				path = routerSettings.base + path;
			}

			// check if the route was registered on the same router.
			// this allow having multiple routers with the same route
			// for example a router for navigation and router for content
			let routeExist = this.routes
				.filter((route) => {
					return utils.match(route, path);
				})
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
	navigate(path, frompopstate = false) {
		// process hash route individually
		window.dispatchEvent(this.loadstart);
		if (path == null) {
			path = '/';
		}
		const routes = this.routes.filter((route) => {
			return utils.match(route, path);
		});

		if (routes.length == 0) this.notfound(path);
		// do not call pushstate from popstate event https://stackoverflow.com/a/50830905
		if (!frompopstate) {
			let fullpath;

			if (this.settings.hash) {
				fullpath =
					window.location.pathname + window.location.search + path;
			} else {
				fullpath = path + window.location.search + window.location.hash;
			}
			console.log(fullpath);
			// handle many routes for different routers
			// but only push the route once to history
			history.pushState({ path: fullpath }, '', fullpath);
		}

		routes.forEach((route) => {
			// let routerEl = document.querySelector(
			// 	`[x-router="${route.router}"]`
			// );
			// routerEl.dispatchEvent(this.loadstart);
			route.handle();
			// routerEl.dispatchEvent(this.loadend);
		});
		window.dispatchEvent(this.loadend);
	},
};

const alpine = window.deferLoadingAlpine || ((callback) => callback());

window.AlpineRouter = AlpineRouter;

window.deferLoadingAlpine = function (callback) {
	window.AlpineRouter.start();

	alpine(callback);
};

export default AlpineRouter;
