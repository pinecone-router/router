import Route from './route.js';
import utils from './utils.js';

const AlpineRouter = {
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
		hash: false,
		/**
		 * @type {boolean}
		 * @summary whether or not to push unregistered paths to history.
		 */
		pushNotfoundToHistory: true,
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
					this.settings.basepath = el.getAttribute('x-base');
				}
				// page rendering
				if (component.$el.hasAttribute('x-render')) {
					this.settings.render.enabled = true;
					// check if a selector was set
					let selector = component.$el.getAttribute('x-render');
					if (selector != '') {
						this.settings.render.selector = selector;
					}
					// this will disable notfound handling in favor of server rendered 404 page
					// this can be ovewritten if needed by making a notfound route with a handler
					this.notfound = null;
				} else {
					// hash routing, it can't be used with page rendering
					// too lazy to explain i think it's obvious
					if (component.$el.hasAttribute('x-hash')) {
						this.settings.hash = true;
					}
				}

				// views rendering, unlike page rendering.
				// they wont be loaded automatically using path
				// instead the user decide the view using x-view for each route
				if (component.$el.hasAttribute('x-views')) {
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
				}

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
				component.$el.dispatchEvent(this.routerloaded);
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
	},

	/**
	 * Add a handler to click events on all links currently in the page
	 * if using views rendering this will be called everytime the page changes
	 * this may also be called by the developer if they added other links dynamicly
	 */
	interceptLinks() {
		if (this.settings.interceptLinks) {
			document.querySelectorAll('a').forEach((el) => {
				// check if we already add this link
				if (el.hasAttribute('x-link')) return;
				// check if the link is a navigation link
				if (utils.validLink(el) == false) return;

				// add an x-link attribute this will tell this function
				// that the link already been handled.
				el.setAttribute('x-link', '');

				el.addEventListener('mouseover', (e) => {
					if (
						!this.settings.render.enabled ||
						!this.settings.render.preload
					) {
						return;
					}
					let path = e.target.getAttribute('href');
					if (path == null) path = '/';
					if (this.settings.render.preloaded.path == path) {
						return;
					}

					window.setTimeout(function () {
						fetch(path)
							.then((response) => {
								return response.text();
							})
							.then((response) => {
								window.AlpineRouter.settings.render.preloaded.path = path;
								window.AlpineRouter.settings.render.preloaded.content = response;
							});
					}, this.settings.render.preloadtime);
				});

				el.addEventListener(
					'click',
					(e) => {
						e.preventDefault();
						let link = el.pathname;
						if (this.settings.hash) {
							window.location.hash = '#' + link;
						} else {
							this.navigate(link);
						}
					},
					false
				);
			});
		}
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
				"Alpine Router: A route's path may not have a hash, setting Alpinethis.settings.hash to true is sufficiant."
			);
		}

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

		let handler = null;
		if (
			el.hasAttribute('x-handler') == false &&
			this.settings.views.enabled == false &&
			this.settings.render.enabled == false
		) {
			throw new Error(
				'Alpine Router: x-route must have a handler (x-handler="handler") unless using x-render.'
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
			if (this.settings.basepath != '/') {
				path = this.settings.basepath + path;
			}

			// register the new route if possible
			this.addRoute(path, handler, view);
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
			console.log({ path });
		}

		const route = this.routes.find((route) => {
			return utils.match(route, path);
		});

		let notfound =
			route == null &&
			(!this.settings.render.enabled ||
				(this.settings.render.enabled && this.notfound != null));
		let context;
		if (notfound) {
			context = utils.buildContext('notfound', path, {});
			if (this.notfound != null) {
				this.notfound(context);
			}
		} else {
			context = utils.buildContext(route.path, path, route.props);
		}

		// if using page rendering and the user just (re)loaded the page
		// dont fetch the content as it is already loaded
		if (this.settings.render.enabled && !firstload && !notfound) {
			if (this.settings.render.preloaded.path == path) {
				this.renderContent(
					this.settings.render.preloaded.content,
					this.settings.render.selector,
					true
				);
				this.settings.render.preloaded.path = null;
				this.settings.render.preloaded.content = null;
			} else {
				fetch(path)
					.then((response) => {
						return response.text();
					})
					.then((response) => {
						this.renderContent(
							response,
							this.settings.render.selector,
							falsenotfound && this.settings.pushNotfoundToHistory
						);
					});
			}
		}

		let view = route != null ? route.view : this.settings.views.notfound;

		if (this.settings.views.enabled && view != null) {
			if (this.settings.views.static) {
				// check if the view was already loaded
				var cachedview = this.settings.views.cached.find(
					(v) => v.view == view
				);
				if (cachedview != null) {
					this.renderContent(
						cachedview.content,
						this.settings.views.selector
					);
				}
			}
			fetch(view)
				.then((response) => {
					return response.text();
				})
				.then((response) => {
					this.renderContent(response, this.settings.views.selector);
					if (this.settings.views.static && cachedview == null) {
						this.settings.views.cached.push({
							view: view,
							content: response,
						});
					}
				});
		}

		// do not call pushstate from popstate event https://stackoverflow.com/a/50830905
		// and if the route is not found only push when pushNotfoundToHistory is true
		if (!frompopstate && !(notfound && !this.settings.pushNotfoundToHistory)) {
			let fullpath;

			if (this.settings.hash) {
				fullpath =
					window.location.pathname + window.location.search + path;
			} else {
				fullpath = path + window.location.search + window.location.hash;
			}
			// handle many routes for different routers
			// but only push the route once to history
			history.pushState({ path: fullpath }, '', fullpath);
		}

		// the route can be null in case using page rendering with no routes
		if (route != null && route.handler != null) route.handle(path);

		this.currentContext = context;

		window.dispatchEvent(this.loadend);
	},

	/**
	 *
	 * @param {string} path
	 * @param {function} handler
	 * @param {string} view
	 */
	addRoute(path, handler, view) {
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

	/**
	 * This will replace the content fetched from `path` into `selector`.
	 * to use this you need to add x-render to the router
	 * @param {string} content the html content.
	 * @param {string} selector the selector of where to put the content.
	 * @param {boolean} isEntirePage if true, the content is assumend to be the entire HTML page.
	 * 								true when used with x-render, false with x-views
	 */
	renderContent(content, selector, isEntirePage) {
		// if called from x-render
		if (isEntirePage) {
			let doc = new DOMParser().parseFromString(content, 'text/html');
			doc = doc.querySelector(selector);
			// This takes the document fetched, remove routers already initialized from it
			// and also remove routers initialized but not found in it
			// that is for routers that are not needed in this page.
			let r = utils.processRoutersInFetchedDoc(
				doc,
				selector,
				this.routes
			);

			doc = r.doc;
			this.routes = r.routes;

			content = doc.innerHTML;
		}

		// replace the content of the selector with the fetched content
		document.querySelector(selector).innerHTML = content;

		this.interceptLinks();
	},
};

const alpine = window.deferLoadingAlpine || ((callback) => callback());

window.AlpineRouter = AlpineRouter;

window.deferLoadingAlpine = function (callback) {
	window.AlpineRouter.start();

	alpine(callback);
};

export default AlpineRouter;
