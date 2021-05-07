import Route from './route';
import {
	buildContext,
	handle,
	sameOrigin,
	samePath,
	middleware,
	saferEval,
	match,
} from './utils';

const PineconeRouter = {
	version: '0.3.0',
	/**
	 * @type Array<Route>
	 * @summary array of routes instantiated from the Route class.
	 */
	routes: Array(),

	settings: {
		/**
		 * @type {boolean}
		 * @summary enable hash routing
		 */
		hash: false,
		/**
		 * @type {string}
		 * @summary The base path of the site, for example /blog
		 * Note: ignored when using hash routing.
		 */
		basePath: '/',

		/**
		 * @type {boolean}
		 * @summary may be set to true by a middleware that don't need handlers like x-views.
		 */
		allowNoHandler: false,
	},

	/**
	 * @type {string}
	 * @summary detect click event, do not set manually.
	 */
	clickEvent: document.ontouchstart ? 'touchstart' : 'click',

	/**
	 * @type {object}
	 * @summary The context object for current path.
	 */
	currentContext: {},

	/**
	 * @description The handler for 404 pages, can be overwritten by a notfound route
	 * @param {object} context The context object.
	 */
	notfound: Array(),

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
		let routerCount = 0;

		// Whenever a component is initialized, check if it is a router
		// and check if the children are valid routes
		window.Alpine.onComponentInitialized((component: any) => {
			if (component.$el.hasAttribute('x-router')) {
				if (routerCount > 1) {
					throw new Error(
						'Pinecone Router: Only one router can be in a page.'
					);
				}

				// Detect router settings

				// javascript config
				// this will check if there is a "settings" parameter
				// inside the router component's data.
				this.settings = {
					...this.settings,
					...(component.getUnobservedData()['settings'] ?? {}),
				};

				middleware('init', component, this.settings);

				// Loop through child elements of this router
				// filtering out everything that isn't a template tag
				// and doesn't have x-route attribute.
				Array.from(component.$el.children)
					.filter((el: any) => el.tagName.toLowerCase() == 'template')
					.forEach((el: any) => this.processRoute(el, component));

				routerCount++;

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
			}
		});

		// Intercept click event in links
		this.interceptLinks();

		// handle navigation events not emitted by links, for example, back button.
		window.addEventListener('popstate', () => {
			if (this.settings.hash) {
				if (window.location.hash != '') {
					this.navigate(window.location.hash.substring(1), true);
				}
			} else {
				this.navigate(window.location.pathname, true);
			}
		});

		// The $router magic helper
		window.Alpine.addMagicProperty(
			'router',
			() => window.PineconeRouter.currentContext
		);
	},
	/**
	 * Check if the anchor element point to a navigation route.
	 * @param {any} el The anchor element or Event target
	 * @param {boolean} hash Set to true when using hash routing
	 * @returns {object} {valid: boolean, link: string}
	 */
	validLink(el: any, hash: boolean): { valid: boolean; link: string } {
		// the object we'll return
		let ret = { valid: false, link: '' };

		// The checks in this block are taken from
		// https://github.com/visionmedia/page.js/blob/master/index.js#L370

		// continue ensure link

		// el.nodeName for svg links are 'a' instead of 'A'
		// traverse up till we find an anchor tag, since clicks
		// on image links for example set the target as img instead of a.
		while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
		if (!el || 'A' !== el.nodeName.toUpperCase()) return ret;

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
			return ret;
		}

		// ensure non-hash for the same path
		ret.link = el.getAttribute('href') ?? '';
		if (!hash && samePath(el) && (el.hash || '#' === ret.link)) {
			return ret;
		}

		// Check for mailto: in the href
		if (ret.link && ret.link.indexOf('mailto:') > -1) return ret;

		// check target
		// svg target is an object and its desired value is in .baseVal property
		if (svg ? el.target.baseVal : el.target) return ret;

		// x-origin
		// note: svg links that are not relative don't call click events (and skip page.js)
		// consequently, all svg links tested inside page.js are relative and in the same origin
		if (!svg && !sameOrigin(el.href)) return ret;

		ret.valid = true;
		return ret;
	},

	/**
	 * Take the template element of a route and the router component
	 * @param {HTMLTemplateElement} el the routes HTML element, must be a template tag.
	 * @param {any} component the router Alpine component
	 */
	processRoute(el: HTMLTemplateElement, component: any) {
		// The path must be a string
		let path = el.getAttribute('x-route') ?? '/';

		if (path.indexOf('#') > -1) {
			throw new Error(
				"Pinecone Router: A route's path may not have a hash character."
			);
		}

		middleware('onBeforeRouteProcessed', el, component, path);

		// will hold handlers as functions
		let handlers = [];
		if (
			el.hasAttribute('x-handler') == false &&
			!this.settings.allowNoHandler
		) {
			throw new Error('Pinecone Router: Routes must have a handler.');
		} else if (el.hasAttribute('x-handler')) {
			let result = saferEval(
				el.getAttribute('x-handler'),
				component.$data
			);

			switch (typeof result) {
				// a single function
				case 'function':
					handlers = [result];
					break;

				// and array of functions
				case 'object':
					handlers = result;
					break;

				default:
					throw new Error(
						`Pinecone Router: Invalid handler type: ${typeof result}.`
					);
			}

			if (path == 'notfound') {
				// register the handlers for the notfound route
				this.notfound = handlers;
			}
		}

		if (path != 'notfound') {
			// if specified add the basePath but only if not using hash routing
			if (this.settings.basePath != '/' && !this.settings.hash) {
				path = this.settings.basePath + path;
			}

			// register the new route if possible
			this.addRoute(path, handlers);
		}
	},

	/**
	 * @description Add a handler to click events on all valid links
	 */
	interceptLinks() {
		var t = this;
		window.document.body.onclick = function (e: any) {
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
			let el = e.target;

			let eventPath =
				e.path || (e.composedPath ? e.composedPath() : null);

			if (eventPath) {
				for (let i = 0; i < eventPath.length; i++) {
					if (!eventPath[i].nodeName) continue;
					if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
					if (!eventPath[i].href) continue;

					el = eventPath[i];
					break;
				}
			}

			// allow skipping handler
			if (el.hasAttribute('native')) return;

			let ret = t.validLink(el, t.settings.hash);
			if (!ret.valid) return;
			t.navigate(ret.link);

			// prevent default behavior.
			e.preventDefault();
		};
	},

	/**
	 *  Go to the specified path without reloading
	 * @param {string} path the path with no hash even if using hash routing
	 * @param {boolean} fromPopState this will be set to true if called from window.onpopstate event
	 * @param {boolean} firstLoad this will be set to true if this is the first page loaded, also from page reload
	 */
	navigate(
		path: string,
		fromPopState: boolean = false,
		firstLoad: boolean = false
	) {
		path ??= '/';

		// only add basePath if it was set
		// if not using hash routing
		// and if it wasn't added already
		if (
			this.settings.basePath != '/' &&
			!this.settings.hash &&
			path.indexOf(this.settings.basePath) != 0
		) {
			path = this.settings.basePath + path;
		}

		if (path == this.settings.basePath && !path.endsWith('/')) {
			path += '/';
		}

		const route: Route | undefined = this.routes.find((route: Route) => {
			let m = match(path, route.path);
			if (m) {
				route.params = m;
				return true;
			}
		});

		let notfound = route == undefined;
		let context =
			typeof route == 'undefined'
				? buildContext('notfound', path, [])
				: buildContext(route.path, path, route.params);

		this.currentContext = context;

		// the middleware may return false to stop execution
		if (
			middleware(
				'onBeforeHandlersExecuted',
				route,
				path,
				firstLoad,
				notfound
			) == 'stop'
		) {
			return;
		}

		// do not call pushstate from popstate event https://stackoverflow.com/a/50830905
		if (!fromPopState) {
			let fullPath = '';

			if (this.settings.hash) {
				fullPath = '#';
				if (window.location.pathname != '/') {
					fullPath += window.location.pathname;
				}
				fullPath += window.location.search + path;
			} else {
				fullPath = path + window.location.search + window.location.hash;
			}

			history.pushState({ path: fullPath }, '', fullPath);
		}

		if (route && route.handlers != []) {
			// will only be false when returning context.redirect().
			// so redirect without finishing
			if (!handle(route.handlers, context)) return; 
		} else if (notfound && this.notfound != null) {
			if (!handle(this.notfound, context)) return;
		}

		middleware('onHandlersExecuted', route, path, firstLoad, notfound);
	},

	/**
	 * Add a new route
	 * @param {string} path
	 * @param {array} handlers array of functions
	 */
	addRoute(path: string, handlers: Array<any>) {
		// check if the route was registered on the same router.
		if (this.routes.find((r: Route) => r.path == path) != null) {
			throw new Error('Pinecone Router: route already exist');
		}

		this.routes.push(new Route(path, handlers));
	},

	/**
	 * Remove a route
	 * @param {string} path
	 */
	removeRoute(path: string) {
		this.routes = this.routes.filter((r: Route) => r.path != path);
	},
};

const alpine =
	window.deferLoadingAlpine || ((callback: Function) => callback());

window.PineconeRouter = PineconeRouter;

window.deferLoadingAlpine = function (callback: Function) {
	window.PineconeRouter.start();

	alpine(callback);
};

declare global {
	interface Window {
		Alpine: any;
		deferLoadingAlpine: any;
		PineconeRouter: typeof PineconeRouter;
		PineconeRouterMiddlewares: Array<Object>;
	}
}

export default PineconeRouter;
