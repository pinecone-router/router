import Route from './route.js';
import {
	match,
	buildContext,
	interceptLinks,
	renderPage,
	renderContent,
	processTrailingSlash,
} from './utils.js';

const AlpineRouter = {
	version: '0.0.8',
	/**
	 * @type {array}
	 * @summary array of routes instantiated from the Route class.
	 */
	routes: [],

	settings: {
		/**
		 * @type {boolean}
		 * @summary detect if links are of the same origin and let Alpine Router handle them
		 */
		interceptLinks: true,
		basepath: '/',
		trailingSlash: null,
		hash: false,
		/**
		 * @type {boolean}
		 * @summary set to true when using x-render or x-views for they dont need handlers
		 */
		allowNoHandler: false,
		/**
		 * @type {boolean}
		 * @summary whether or not to push unregistered paths to history.
		 */
		pushNotfoundToHistory: true,
		// X-RENDER ONLY //
		render: {
			enabled: false,
			selector: 'body',
			preload: true,
			/**
			 * @type {number} miliseconds
			 * @summary time to wait after mouse over a link before preloading a page
			 */
			preloadtime: 200,
			/**
			 * @type {object}
			 * @summary The content that has been preloaded on mouseover event.
			 */
			preloaded: { path: null, content: null }, //
		},
		// X-RENDER END

		// X-VIEWS ONLY
		views: {
			enabled: false,
			basepath: '/',
			selector: '#content',
			/**
			 * @type {string}
			 * @summary the 404 view
			 */
			notfound: null,
			/**
			 * @type {bool}
			 * @summary views are not dynamically generated, this will cache views for later use.
			 */
			static: false,
			/**
			 * @type {array}
			 * @summary array of objects, will hold cached views if static is true
			 */
			cached: [],
		},
		// X-VIEWS END
	},

	/**
	 * @type {boolean}
	 * @summary This will be set to true after all routers are
	 * initialized and the first page loaded
	 */
	loaded: false,

	/**
	 * @type {object}
	 * @summary The context object for current path.
	 */
	currentContext: null,

	/**
	 * @event routerloaded
	 * @summary will be dispatched to window when all routers are
	 * initialized and the first page loaded
	 */
	routerloaded: new Event('routerloaded'),

	/**
	 * @event loadstart
	 * @summary be dispatched to the window after before page start loading.
	 */
	loadstart: new Event('loadstart'),

	/**
	 * @event loadend
	 * @summary will be dispatched to the window after the page is loaded.
	 */
	loadend: new Event('loadend'),

	/**
	 * @description The handler for 404 pages, can be overwritten by a notfound route
	// Note that when using x-render or x-views, it'll be set to null in order to let server generate the page
	// or user specify the view, respectively.
	// Note: if setting routes in the router with x-render you must set notfound route as well
	// for example this can be used to validate routes in browser.
	 * @param {object} context The context object.
	 */
	notfound: function (context) {
		console.error(
			`Alpine Router: requested path ${context.path} was not found`
		);
	},

	/**
	 * Entry point of the plugin
	 */
	start() {
		if (!window.Alpine) {
			throw new Error('Alpine is require for `Alpine Router` to work.');
		}

		// Routers that are already initialized
		let currentRouterCount = 0;

		// Whenever a component is initialized, check if it is a router
		// and check if the children are valid routes
		Alpine.onComponentInitialized((component) => {
			if (component.$el.hasAttribute('x-router')) {
				// This will check if the router is loaded and return,
				// it'll be needed when switching a page
				// so the router from that page wont be loaded again if it's the same one
				if (component.$el.getAttribute('x-router') == 'loaded') return;

				if (currentRouterCount > 1) {
					throw new Error(
						'Alpine Router: Only one router can be in a page.'
					);
				}

				// Detect router settings

				// The router basepath which will be added at the begining
				// of every route in this router
				if (component.$el.hasAttribute('x-base')) {
					this.settings.basepath = component.$el.getAttribute(
						'x-base'
					);
				}

				// hash routing
				if (component.$el.hasAttribute('x-hash')) {
					this.settings.hash = true;
				}

				if (component.$el.hasAttribute('x-slash')) {
					let trail = component.$el.getAttribute('x-slash');
					if (trail == 'add' || trail == '') trail = true;
					else if (trail == 'remove') trail = false;
					else
						throw new Error(
							'Alpine Router: Invalid value suplied to x-slash must be either "add", "remove", or empty'
						);
					this.settings.trailingSlash = trail;
				}

				// X-RENDER ONLY

				// page rendering
				if (component.$el.hasAttribute('x-render')) {
					if (this.settings.hash) {
						throw new Error(
							'Alpine Router: Cannot use x-render along with x-hash.'
						);
					}
					this.settings.render.enabled = true;
					// check if a selector was set
					let selector = component.$el.getAttribute('x-render');
					if (selector != '') {
						this.settings.render.selector = selector;
					}
					// this will disable notfound handling in favor of server rendered 404 page
					// this can be ovewritten if needed by making a notfound route with a handler
					this.notfound = null;
					this.settings.allowNoHandler = true;
				}
				// X-RENDER END

				// X-VIEWS ONLY
				// views rendering, unlike page rendering.
				// they wont be loaded automatically using path
				// instead the user decide the view using x-view for each route
				if (component.$el.hasAttribute('x-views')) {
					if (this.settings.render.enabled) {
						throw new Error(
							'Alpine Router: Cannot use x-views along with x-render.'
						);
					}

					this.settings.views.enabled = true;
					// check if the selector was set, else default to 'body'
					let selector = component.$el.getAttribute('x-views');
					if (selector == 'body') {
						throw new Error(
							'Alpine Router: Do not use body as the selector, it will cause the router component to be removed'
						);
					} else if (selector != '') {
						this.settings.views.selector = selector;
					}

					if (component.$el.hasAttribute('x-static')) {
						this.settings.views.static = true;
					}

					// this will disable notfound handling in favor of 404 view
					// this can be ovewritten if needed by making a notfound route with a handler
					this.notfound = null;
					this.settings.allowNoHandler = true;
				}
				// X-VIEWS END

				// Loop through child elements of this router
				Array.from(component.$el.children).forEach((el) => {
					// if the element is a route process it
					if (el.hasAttribute('x-route')) {
						this.processRoute(el, component);
					}
				});

				component.$el.setAttribute('x-router', 'loaded');
				currentRouterCount++;

				if (!this.settings.hash) {
					// navigate to the current page to handle it
					// ONLY if we not using hash routing for the default router
					this.navigate(window.location.pathname, false, true);
				} else {
					if (window.location.hash == '') {
						document.location.href =
							window.location.pathname + '#/';
						return;
					} else {
						this.navigate(
							window.location.hash.substring(1),
							true,
							true
						);
					}
				}
				this.loaded = true;
				window.dispatchEvent(this.routerloaded);
			}
		});

		// Intercept click event in links
		interceptLinks(this.settings.hash, this.settings.render);

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

		Alpine.addMagicProperty('router', () => {
			return window.AlpineRouter.currentContext;
		});
	},

	/**
	 * Take the template element of a route and the router component
	 * @param {Element} el the routes HTML element, must be a template tag.
	 * @param {object} component the router Alpine component
	 */
	processRoute(el, component) {
		if (el.tagName.toLowerCase() !== 'template') {
			throw new Error(
				'Alpine Router: x-route must be used on a template tag.'
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
				"Alpine Router: A route's path may not have a hash, using x-hash is sufficiant."
			);
		}

		// X-VIEWS ONLY
		let view = null;
		if (this.settings.views.enabled) {
			if (el.hasAttribute('x-view') == false) {
				throw new Error(
					'Alpine Router: route must have an x-view attribute when using x-views.'
				);
			} else {
				view = el.getAttribute('x-view');
				if (this.settings.views.basepath != '/') {
					view = this.settings.views.basepath + view;
				}
			}
			if (path == 'notfound') {
				this.settings.views.notfound = view;
			}
		}
		// X-VIEWS END

		let handler = null;
		if (
			el.hasAttribute('x-handler') == false &&
			!this.settings.allowNoHandler
		) {
			throw new Error(
				'Alpine Router: x-route must have a handler (x-handler="handler") unless using x-views or x-render.'
			);
		} else if (el.hasAttribute('x-handler')) {
			// Get the hanlder which is a string because it's an attribute value
			// Use that string as an index to the component method which is meant to handle the route
			let handlerName = el.getAttribute('x-handler');
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
			}
		}

		if (path != 'notfound') {
			// add basepath of the entire page/site
			if (this.settings.basepath != '/' && !this.settings.hash) {
				path = this.settings.basepath + path;
			}

			path = processTrailingSlash(path, this.settings.trailingSlash);

			// register the new route if possible

			// X-VIEWS ONLY
			if (this.settings.views.enabled) {
				this.addRoute(path, { handler: handler, view: view });
				return;
			}
			// X-VIEWS END

			this.addRoute(path, { handler: handler });
		}
	},

	/**
	 *  Go to the specified path without reloading
	 * @param {string} path the path with no hash even if using hash routing
	 * @param {boolean} frompopstate this will be set to true if called from window.onpopstate event
	 * @param {boolean} firstload this will be set to true if this is the first page loaded, also from page reload
	 */
	navigate(path, frompopstate = false, firstload = false) {
		// process hash route individually
		window.dispatchEvent(this.loadstart);

		if (path == null) {
			path = '/';
		}

		if (
			this.settings.basepath != '/' &&
			!this.settings.hash &&
			path.indexOf(this.settings.basepath) != 0
		) {
			path = this.settings.basepath + path;
		}

		if (path != this.settings.basepath) {
			// add or remove trailing slash based on settings
			path = processTrailingSlash(path, this.settings.trailingSlash);
		} else if (!path.endsWith('/')) {
			path += '/';
		}

		const route = this.routes.find((route) => {
			return match(route, path);
		});

		let notfound = route == null;
		let context;
		if (notfound) {
			context = buildContext('notfound', path, {});
			if (this.notfound != null) {
				this.notfound(context);
			}
		} else {
			context = buildContext(route.path, path, route.props);
		}

		this.currentContext = context;

		// the route can be null in case using page or view rendering with no routes
		// handle routes before rendering to allow checking for permissions etc
		if (route != null && route.settings.handler != null) {
			// will only be false when using context.go()
			if (route.handle(context) == false) {
				return; // so redirect without finishing
			}
		}

		// X-RENDER ONLY

		// if using page rendering and the user just (re)loaded the page
		// dont fetch the content as it is already loaded
		if (this.settings.render.enabled && !firstload && !notfound) {
			if (this.settings.render.preloaded.path == path) {
				this.routes = renderPage(
					this.settings.render.preloaded.content,
					this.settings.render.selector,
					this.routes
				);
				interceptLinks(this.settings.hash, this.settings.render);
				this.settings.render.preloaded.path = null;
				this.settings.render.preloaded.content = null;
			} else {
				fetch(path)
					.then((response) => {
						return response.text();
					})
					.then((response) => {
						this.routes = renderPage(
							response,
							this.settings.render.selector,
							this.routes
						);
						interceptLinks(
							this.settings.hash,
							this.settings.render
						);
					});
			}
		}
		// X-RENDER END

		// X-VIEWS ONLY

		let view =
			route != null ? route.settings.view : this.settings.views.notfound;

		if (this.settings.views.enabled && view != null) {
			if (this.settings.views.static) {
				// check if the view was already loaded
				var cachedview = this.settings.views.cached.find(
					(v) => v.view == view
				);
				if (cachedview != null) {
					renderContent(
						cachedview.content,
						this.settings.views.selector
					);
					interceptLinks(this.settings.hash, this.settings.render);
				}
			}
			fetch(view)
				.then((response) => {
					return response.text();
				})
				.then((response) => {
					renderContent(response, this.settings.views.selector);
					interceptLinks(this.settings.hash, this.settings.render);
					if (this.settings.views.static && cachedview == null) {
						this.settings.views.cached.push({
							view: view,
							content: response,
						});
					}
				});
		}
		// X-VIEWS END

		// do not call pushstate from popstate event https://stackoverflow.com/a/50830905
		// and if the route is not found only push when pushNotfoundToHistory is true
		if (
			!frompopstate &&
			!(notfound && !this.settings.pushNotfoundToHistory)
		) {
			let fullpath = '';

			if (this.settings.hash) {
				fullpath = '#';
				if (window.location.pathname != '/') {
					fullpath += window.location.pathname;
				}
				fullpath += window.location.search + path;
			} else {
				fullpath = path + window.location.search + window.location.hash;
			}

			// handle many routes for different routers
			// but only push the route once to history
			history.pushState({ path: fullpath }, '', fullpath);
		}

		window.dispatchEvent(this.loadend);
	},

	/**
	 *
	 * @param {string} path
	 * @param {function} handler
	 * @param {string} view can be null
	 */
	addRoute(path, handler, view = null) {
		// check if the route was registered on the same router.
		if (this.routes.find((r) => r.path == path) != null) {
			throw new Error('Alpine Router: route already exist');
		}

		this.routes.push(new Route(path, handler, view));
	},

	/**
	 * Remove a route
	 * @param {string} path
	 */
	removeRoute(path) {
		this.routes = this.routes.filter((r) => r.path != path);
	},
};

const alpine = window.deferLoadingAlpine || ((callback) => callback());

window.AlpineRouter = AlpineRouter;

window.deferLoadingAlpine = function (callback) {
	window.AlpineRouter.start();

	alpine(callback);
};

export default AlpineRouter;
