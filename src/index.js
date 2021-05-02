import Route from './route.js';
import {
	match,
	buildContext,
	processTrailingSlash,
	handle,
	validLink,
	middleware,
} from './utils.js';

const PineconeRouter = {
	version: '0.1.1',
	/**
	 * @type {array}
	 * @summary array of routes instantiated from the Route class.
	 */
	routes: [],

	settings: {
		/**
		 * @type {boolean}
		 * @summary detect if links are of the same origin and let Pinecone Router handle them
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
	 * @event pinecone-init
	 * @summary will be dispatched to window when all routers are
	 * initialized and the first page loaded
	 */
	routerloaded: new Event('pinecone-init'),

	/**
	 * @event pinecone-start
	 * @summary be dispatched to the window after before page start loading.
	 */
	loadstart: new Event('pinecone-start'),

	/**
	 * @event pinecone-end
	 * @summary will be dispatched to the window after the page is loaded.
	 */
	loadend: new Event('pinecone-end'),

	/**
	 * @description The handler for 404 pages, can be overwritten by a notfound route
	 * Note that when using x-render or x-views, it'll be set to null in order to let server generate the page
	 * or user specify the view, respectively.
	 * if setting routes in the router with x-render you must set notfound route as well
	 * for example this can be used to validate routes in browser.
	 * @param {object} context The context object.
	 */
	notfound: function (context) {
		console.error(
			`Pinecone Router: requested path ${context.path} was not found`
		);
	},

	/**
	 * Entry point of the plugin
	 */
	start() {
		if (!window.Alpine) {
			throw new Error(
				'Alpine is required for `Pinecone Router` to work.'
			);
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
						'Pinecone Router: Only one router can be in a page.'
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
							'Pinecone Router: Invalid value supplied to x-slash must be either "add", "remove", or empty'
						);
					this.settings.trailingSlash = trail;
				}

				middleware('init', component);

				// Loop through child elements of this router
				// filtering out everything that isn't a template tag
				// and doesnt have x-route atttribute.
				Array.from(component.$el.children)
					.filter(
						(el) =>
							el.tagName.toLowerCase() == 'template' &&
							el.hasAttribute('x-route')
					)
					.forEach((el) => {
						this.processRoute(el, component);
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
		this.interceptLinks();

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
			return window.PineconeRouter.currentContext;
		});
	},

	/**
	 * Take the template element of a route and the router component
	 * @param {Element} el the routes HTML element, must be a template tag.
	 * @param {object} component the router Alpine component
	 */
	processRoute(el, component) {
		// The path will be on x-route and handler on x-handler
		// The path must be a string
		let path = el.getAttribute('x-route');

		if (path.indexOf('#') > -1) {
			throw new Error(
				"Pinecone Router: A route's path may not have a hash, using x-hash is sufficiant."
			);
		}

		middleware('onBeforeRouteProcessed', el, component, path);

		// will hold handlers as functions
		let handlers = [];
		if (
			el.hasAttribute('x-handler') == false &&
			!this.settings.allowNoHandler
		) {
			throw new Error(
				'Pinecone Router: routes must have a handler unless using x-views or x-render.'
			);
		} else if (el.hasAttribute('x-handler')) {
			// Get the handlers which is a string because it's an attribute value
			// Use that string as an index to the component method which is meant to handle the route
			// allow comma separated handler names.
			let handlerNamesArray = el
				.getAttribute('x-handler')
				.replace(/\s/g, '')
				.split(',')
				//https://stackoverflow.com/questions/9141951/splitting-string-by-whitespace-without-empty-elements/39184134#comment67308788_39184134
				.filter((i) => i);

			// get the handler function from the parent
			handlerNamesArray.forEach((handlerName, index) => {
				try {
					handlers[index] = component.getUnobservedData()[
						handlerName
					];
					if (typeof handlers[index] != 'function') {
						throw new Error(
							'Pinecone Router: The handler must be a function name.'
						);
					}
				} catch (error) {
					throw new Error('Pinecone Router: ' + error);
				}
			});

			if (path == 'notfound') {
				// register the route as a 404 route
				this.notfound = handlers;
			}
		}

		if (path != 'notfound') {
			// if specified add the basepath but only if not using hash routing
			if (this.settings.basepath != '/' && !this.settings.hash) {
				path = this.settings.basepath + path;
			}

			path = processTrailingSlash(path, this.settings.trailingSlash);

			// register the new route if possible
			this.addRoute(path, handlers);
		}
	},

	/**
	 * @description Add a handler to click events on all valid links
	 */
	interceptLinks() {
		if (this.interceptLinks) {

			document.body.onclick = function (e) {
				if (
					e.metaKey ||
					e.ctrlKey ||
					e.shiftKey ||
					e.detail != 1 ||
					e.defaultPrevented
				) {
					return;
				}

				// ensure link
				// use shadow dom when available if not, fall back to composedPath()
				// for browsers that only have shady
				var el = e.target;
				var eventPath =
					e.path || (e.composedPath ? e.composedPath() : null);

				if (eventPath) {
					for (var i = 0; i < eventPath.length; i++) {
						if (!eventPath[i].nodeName) continue;
						if (eventPath[i].nodeName.toUpperCase() !== 'A')
							continue;
						if (!eventPath[i].href) continue;

						el = eventPath[i];
						break;
					}
				}

				e.preventDefault();
				let link = validLink(el, window.PineconeRouter.settings.hash);
				if (link == false) return;
				window.PineconeRouter.navigate(link);
			};
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

		// only add basepath if it was set
		// if not using hash routing
		// and if it wasn't added already
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
				let ret = handle(this.notfound, context);
				if (ret == false) return;
			}
		} else {
			context = buildContext(route.path, path, route.props);
		}

		this.currentContext = context;

		if (
			middleware(
				'onBeforeHandlersExecuted',
				route,
				path,
				firstload,
				notfound
			) == false
		) {
			return;
		}

		// the route can be null in case using page rendering with no routes
		// handle routes before rendering to allow checking for permissions etc.
		if (route != null && route.handlers != null) {
			// will only be false when returning context.redirect().
			if (handle(route.handlers, context) == false) {
				return; // so redirect without finishing
			}
		}

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

			history.pushState({ path: fullpath }, '', fullpath);
		}

		if (
			middleware(
				'onHandlersExecuted',
				route,
				path,
				firstload,
				notfound
			) == false
		) {
			return;
		}

		window.dispatchEvent(this.loadend);
	},

	/**
	 * Add a new route
	 * @param {string} path
	 * @param {array} handlers array of functions
	 */
	addRoute(path, handlers) {
		// check if the route was registered on the same router.
		if (this.routes.find((r) => r.path == path) != null) {
			throw new Error('Pinecone Router: route already exist');
		}

		this.routes.push(new Route(path, handlers));
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

window.PineconeRouter = PineconeRouter;

window.deferLoadingAlpine = function (callback) {
	window.PineconeRouter.start();

	alpine(callback);
};

export default PineconeRouter;
