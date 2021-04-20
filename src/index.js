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

	// This have the content that has been preloaded on mouseover event.
	fetchedContent: { path: null, content: null },

	// this will be set to true if there is a router that uses view rendering
	preloadPages: false,

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
						'Alpine Router: x-router attribute should be a string of the router name or empty for "default".'
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
				// No need for this as link clicks are handled and pushstate is
				// if (this.settings.hash) {
				// 	window.onhashchange = () => {
				// 		// navigate to the hash route
				// 		this.navigate(window.location.hash.substring(1), true);
				// 	};
				// }

				// If there is a router that use page rendering then allow preloading on hover
				if (!this.preloadPages && routerSettings.render != null) {
					this.preloadPages = true;
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
					if (!this.preloadPages) return;
					let path = e.target.getAttribute('href');
					if (
						this.fetchedContent.path != null &&
						this.fetchedContent.path == path
					) {
						return;
					}
					window.setTimeout(function () {
						fetch(path)
							.then((response) => {
								return response.text();
							})
							.then((response) => {
								window.AlpineRouter.fetchedContent.path = path;
								window.AlpineRouter.fetchedContent.content = response;
							});
					}, this.settings.hoverFetchTime);
				});
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
		}

		// TODO: it will cause the links to be handled twice when the page is changed if using x-render
		// meaning that we need to add x-handled to the link which is too much?
		// The link validation method from page.js is good i think and this is not needed.
		// however users can use @click.prevent(AlpineRouter.navigate($el.href))
		// else {
		// 	// If we're not intercepting all links, only watch ones with x-link attribute
		// 	document.querySelectorAll('a[x-link]').forEach((el) => {
		// 		el.addEventListener(
		// 			'click',
		// 			(e) => {
		// 				e.preventDefault();
		// 				let link = e.target.getAttribute('href');
		// 				this.navigate(link);
		// 			},
		// 			false
		// 		);
		// 	});
		// }
	},

	/**
	 * Take the template element of a route and the router component
	 * @param {Element} el the routes HTML element, must be a template tag.
	 * @param {object} component the router Alpine component
	 * @param {string} routerName the router's name
	 * @param {object} routerSettings the router's setting object
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
			// handle many routes for different routers
			// but only push the route once to history
			history.pushState({ path: fullpath }, '', fullpath);
		}

		let rendered = false;
		routes.forEach((route) => {
			// if the user just (re)loaded the page, dont fetch the content.
			if (firstload != true) {
				if (!rendered) {
					let router = this.routers.find(
						(e) => e.name == route.router
					);
					if (router.settings.render != null) {
						let selector = router.settings.render;
						if (
							this.fetchedContent.path != null &&
							this.fetchedContent.path == path
						) {
							console.log(
								'Alpine Router: Using preloaded conteent'
							);
							this.renderEntirePage(
								this.fetchedContent.content,
								selector
							);
							this.fetchedContent.path = null
							this.fetchedContent.content = null;
						} else {
							fetch(path)
								.then((response) => {
									return response.text();
								})
								.then((response) => {
									this.renderEntirePage(response, selector);
								});
						}
						this.rendered = true;
					}
				}
			}
			route.handle();
		});
		window.dispatchEvent(this.loadend);
	},

	/**
	 * This will replace the content fetched from `path` into `selector`.
	 * to use this you need to add x-render to the router
	 * @param {string} content the html content.
	 * @param {string} selector the selector of where to put the content.
	 */
	renderEntirePage(content, selector) {
		let doc = new DOMParser().parseFromString(content, 'text/html');

		doc = doc.querySelector(selector);

		// This takes the document fetched, remove routers already initialized from it
		// and also remove routers initialized but not found in it
		// that is for routers that are not needed in this page.
		let r = utils.processRoutersInFetchedDoc(
			doc,
			this.routers,
			this.routes,
			true
		);

		doc = r.doc;
		this.routers = r.routers;
		this.routes = r.routes;

		// check if there is still a router that uses page rendering
		this.preloadPages = this.routers.findIndex((e) => e.settings.render != null) != null;

		// replace the content of the selector with the fetched content
		document.querySelector(selector).innerHTML = doc.innerHTML;

		this.interceptLinks();
	},
	/**
	 * This will render content by fetching the path specfied in the routes `x-view`.
	 * 
	 * @summary To use this add `x-views` to the routers element.
	 * 
	 * NOTE: This will be called *per route*, not *per path*.
	 * It means if there were two routers in the page with a route to `/a/path`, meaning two routes,
	 * the content will be fetched from path in *each route's* `x-view` *two times* and replaces content of `x-selector`
	 * 
	 * This requires routes to have `x-view` for the *path* of content to fetch, and `x-selector` for *where* to put that content.

	 */
	renderChunks() {},
};

const alpine = window.deferLoadingAlpine || ((callback) => callback());

window.AlpineRouter = AlpineRouter;

window.deferLoadingAlpine = function (callback) {
	window.AlpineRouter.start();

	alpine(callback);
};

export default AlpineRouter;
