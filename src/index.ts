import type { ComponentController } from '@leanadmin/alpine-typescript';

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
	name: 'pinecone-router',
	version: '1.0.3',
	/**
	 * @type Route[]
	 * @summary array of routes instantiated from the Route class.
	 */
	routes: <Route[]>[],

	settings: <Settings>{
		hash: false,
		basePath: '/',
		allowNoHandler: false,
		middlewares: {},
	},

	/**
	 * @type {Context}
	 * @summary The context object for current path.
	 */
	currentContext: <Context>{},

	/**
	 * @description The handler for 404 pages, can be overwritten by a notfound route
	 */
	notfound: new Route('notfound'),

	/**
	 * Entry point of the plugin
	 */
	start() {
		if (!window.Alpine) {
			throw new Error(`Alpine is required for ${this.name} to work.`);
		}

		// Routers that are already initialized
		let routerCount = 0;

		// Whenever a component is initialized, check if it is a router
		// and check if the children are valid routes
		window.Alpine.onComponentInitialized(
			(component: ComponentController) => {
				// @ts-ignore
				if (component.$el.hasAttribute('x-router')) {
					if (routerCount > 1) {
						throw new Error(
							`${this.name}: Only one router can be in a page.`
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
					// @ts-ignore
					Array.from(component.$el.children)
						.filter(
							(el: any) => el.tagName.toLowerCase() == 'template'
						)
						.forEach((el: any) => this.processRoute(el, component));

					routerCount++;

					if (!this.settings.hash) {
						// navigate to the current page to handle it
						// ONLY if we not using hash routing for the default router
						return this.navigate(
							window.location.pathname,
							false,
							true
						);
					}

					this.navigate(
						window.location.hash.substring(1),
						true,
						true
					);
				}
			}
		);

		// Intercept click event in links
		this.interceptLinks(this);

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
	 * Take the template element of a route and the router component
	 * @param {HTMLTemplateElement} el the routes HTML element, must be a template tag.
	 * @param {any} component the router Alpine component
	 */
	processRoute(el: HTMLTemplateElement, component: ComponentController) {
		// The path must be a string
		let path = el.getAttribute('x-route') ?? '/';

		if (path.indexOf('#') > -1) {
			throw new Error(
				`${this.name}: A route's path may not have a hash character.`
			);
		}

		middleware('onBeforeRouteProcessed', el, component, path);

		// will hold handlers as functions
		let handlers = [];
		if (!el.hasAttribute('x-handler') && !this.settings.allowNoHandler) {
			throw new Error(`${this.name}: Routes must have a handler.`);
		} else if (el.hasAttribute('x-handler')) {
			let result = saferEval(
				el.getAttribute('x-handler'),
				component.$data
			);

			if (typeof result == 'function') handlers = [result];
			else if (typeof result == 'object') handlers = result;
			else
				throw new Error(
					`${this.name}: Invalid handler type: ${typeof result}.`
				);

			if (path == 'notfound') this.notfound.handlers = handlers;
		}

		if (path != 'notfound') {
			// if specified add the basePath
			if (this.settings.basePath != '/') {
				path = this.settings.basePath + path;
			}

			// register the new route if possible
			this.add(path, handlers);
		}
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
	 * @description Add a handler to click events on all valid links
	 */
	interceptLinks(t: any) {
		window.document.body.addEventListener(
			document.ontouchstart ? 'touchstart' : 'click',
			function (e: any) {
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
						if (eventPath[i].nodeName.toUpperCase() !== 'A')
							continue;
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
			}
		);
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
			!path.startsWith(this.settings.basePath)
		) {
			path = this.settings.basePath + path;
		}

		if (path == this.settings.basePath && !path.endsWith('/')) {
			path += '/';
		}

		const route: Route | undefined = this.routes.find((route: Route) => {
			let m = match(path, route.path);
			route.params = m != false ? m : {};
			return m;
		});

		let context =
			typeof route == 'undefined'
				? buildContext('notfound', path, [])
				: buildContext(route.path, path, route.params);

		this.currentContext = context;

		// the middleware may return 'stop' to stop execution of this function
		if (
			middleware('onBeforeHandlersExecuted', route, path, firstLoad) ==
			'stop'
		)
			return;

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

		if (!handle(route?.handlers ?? this.notfound.handlers, context)) return;

		middleware('onHandlersExecuted', route, path, firstLoad);
	},

	/**
	 * Add a new route
	 */
	add(path: string, handlers: Handler) {
		// check if the route was registered on the same router.
		if (this.routes.find((r: Route) => r.path == path) != null) {
			throw new Error('Pinecone Router: route already exist');
		}

		this.routes.push(new Route(path, handlers));
	},

	/**
	 * Remove a route
	 */
	remove(path: string) {
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

export default PineconeRouter;

declare global {
	interface Window {
		PineconeRouter: typeof PineconeRouter;
		PineconeRouterMiddlewares: Array<Middleware>;
	}
}

export declare type Context = {
	route: string;
	path: string;
	params: { [key: string]: any };
	// query without leading '?'
	query: string;
	// hash without leading '#'
	hash: string;
	redirect: (path: string) => string;
};

export declare interface Settings {
	/**
	 * @default false
	 * @summary enable hash routing
	 */
	hash: boolean;
	/**
	 * @default `/`
	 * @summary The base path of the site, for example /blog
	 * Note: do not use with using hash routing!
	 */
	basePath: string;

	/**
	 * @default false
	 * @summary when true it wont throw an error when the handler of a route is not specified.
	 */
	allowNoHandler: boolean;
	/**
	 * @default []
	 * @summmary array of middlewares
	 */
	middlewares: {[key: string]: Middleware};
}

export type Handler = ((context: Context) => any)[];

export declare interface Middleware {
	name: string;
	version?: string;
	settings?: { [key: string]: any };
	/**
	 * This will be called at router initialization.
	 * used for detecting router settings.
	 */
	init?: (component: ComponentController, settings: Settings) => void;
	/**
	 * Called for each route during initialization,
	 * before the route is processed & added.
	 * @param {HTMLTemplateElement} el the route's <template> element
	 * @param {ComponentController} component the router's alpine component
	 * @param {string} path the route's path
	 */
	onBeforeRouteProcessed?: (
		el: HTMLTemplateElement,
		component: ComponentController,
		path: string
	) => void;
	/**
	 * Will be called before the handlers are executed.
	 * during navigation (PineconeRouter.navigate()).
	 * @param {Route} route the matched route, undefined if not found.
	 * @param {string} path the path visited by the client
	 * @param {boolean} firstload first page load and not link navigation request
	 * @returns {'stop'|null} 'stop' to make the navigate function exit (make sure to send the loadend event); none to continute execution.
	 */
	onBeforeHandlersExecuted?: (
		route: Route,
		path: string,
		firstload: boolean
	) => 'stop' | void;

	/**
	 * Will be called after the handlers are executed and done.
	 * during navigation (PineconeRouter.navigate()).
	 * @param {Route} route the matched route, undefined if not found.
	 * @param {string} path the path visited by the client
	 * @param {boolean} firstload first page load and not link navigation request
	 * @returns {'stop'|null} 'stop' to make the navigate function exit (make sure to send the loadend event); none to continute execution.
	 */
	onHandlersExecuted?: (
		route: Route,
		path: string,
		firstload: boolean
	) => 'stop' | void;

	[key: string]: any;
}
