import Route from './route'
import type { Settings, Context, Middleware, Handler } from './types'
import { handle, match, middleware, validLink } from './utils'

const PineconeRouter = {
	version: '3.1.0',
	name: 'pinecone-router',
	settings: <Settings>{
		hash: false,
		basePath: '/',
	},

	/**
	 * @description The handler for 404 pages, can be overwritten by a notfound route
	 */
	notfound: new Route('notfound'),
	/**
	 * @type Route[]
	 * @summary array of routes instantiated from the Route class.
	 */
	routes: <Route[]>[],
	/**
	 * @type {Context}
	 * @summary The context object for current path.
	 */
	currentContext: <Context>{},
	/**
	 * Add a new route
	 */
	add(path: string, options?: {}) {
		// check if the route was registered on the same router.
		if (this.routes.find((r: Route) => r.path == path) != null) {
			throw new Error('Pinecone Router: route already exist')
		}

		this.routes.push(new Route(path, options))
	},
	/**
	 * Remove a route
	 */
	remove(path: string) {
		this.routes = this.routes.filter((r: Route) => r.path != path)
	},
	/**
	 * @event pinecone-start
	 * @summary be dispatched to the window after before page start loading.
	 */
	loadStart: new Event('pinecone-start'),

	/**
	 * @event pinecone-end
	 * @summary will be dispatched to the window after the views are fetched
	 */
	loadEnd: new Event('pinecone-end'),
}

declare global {
	interface Window {
		PineconeRouter: typeof PineconeRouter
		PineconeRouterMiddlewares: Array<Middleware>
	}
}

export default function (Alpine) {
	window.PineconeRouter = Alpine.reactive(PineconeRouter)

	Alpine.directive(
		'route',
		(el, { value, modifiers, expression }, { Alpine, effect, cleanup }) => {
			let path = expression
			if (path.indexOf('#') > -1) {
				throw new Error(
					`Pinecone Router: A route's path may not have a hash character.`
				)
			}
			middleware('onBeforeRouteProcessed', el, path)
			if (path != 'notfound') {
				// if specified add the basePath
				if (window.PineconeRouter.settings.basePath != '/') {
					path = window.PineconeRouter.settings.basePath + path
				}

				// register the new route if possible
				window.PineconeRouter.add(path)
			}
			middleware('onAfterRouteProcessed', el, path)
		}
	)

	Alpine.directive(
		'handler',
		(
			el,
			{ value, modifiers, expression },
			{ Alpine, effect, cleanup, evaluate }
		) => {
			if (!el.hasAttribute('x-route')) {
				throw new Error(
					`Pinecone Router: x-handler must be set alongside x-route.`
				)
			}
			let handlers
			// check if the handlers expression is an array
			// if not make it one
			if (
				!(expression.startsWith('[') && expression.endsWith(']')) &&
				!(expression.startsWith('Array(') && expression.endsWith(')'))
			) {
				expression = `[${expression}]`
			}
			let evaluatedExpression = evaluate(expression)
			let path = el.getAttribute('x-route')
			if (typeof evaluatedExpression == 'object')
				handlers = evaluatedExpression
			else {
				throw new Error(
					`Pinecone Router: Invalid handler type: ${typeof evaluatedExpression}.`
				)
			}
			if (path == 'notfound')
				window.PineconeRouter.notfound.handlers = handlers
			else {
				// if specified add the basePath
				if (window.PineconeRouter.settings.basePath != '/') {
					path = window.PineconeRouter.settings.basePath + path
				}

				// add handlers to the route
				let i = window.PineconeRouter.routes.findIndex(
					(r) => r.path == path
				)
				window.PineconeRouter.routes[i].handlers = handlers
			}
		}
	)

	Alpine.magic('router', (el, Alpine) => window.PineconeRouter.currentContext)

	document.addEventListener('alpine:initialized', () => {
		middleware('init')
		// virtually navigate the path on the first page load
		// this will register the path in history and sets the pathvariable
		// navigate(window.location.pathname, false, true)
		if (!window.PineconeRouter.settings.hash) {
			// navigate to the current page to handle it
			// ONLY if we not using hash routing for the default router
			navigate(window.location.pathname, false, true)
		} else {
			navigate(window.location.hash.substring(1), false, true)
		}
	})

	// handle navigation events not emitted by links, for example, back button.
	window.addEventListener('popstate', () => {
		if (window.PineconeRouter.settings.hash) {
			if (window.location.hash != '') {
				navigate(window.location.hash.substring(1), true)
			}
		} else {
			navigate(window.location.pathname, true)
		}
	})

	// intercept click event in links
	interceptLinks()
}

/**
 * @description Add a handler to click events on all valid links
 */
function interceptLinks() {
	window.document.body.addEventListener(
		document.ontouchstart ? 'touchstart' : 'click',
		function (e) {
			if (
				e.metaKey ||
				e.ctrlKey ||
				e.shiftKey ||
				e.detail != 1 ||
				e.defaultPrevented
			) {
				return
			}

			// ensure link
			// use shadow dom when available if not, fall back to composedPath()
			// for browsers that only have shady
			let el = e.target

			let eventPath: any = e.composedPath()
			if (eventPath) {
				for (let i = 0; i < eventPath.length; i++) {
					if (!eventPath[i].nodeName) continue
					if (eventPath[i].nodeName.toUpperCase() !== 'A') continue
					if (!eventPath[i].href) continue

					el = eventPath[i]
					break
				}
			}
			if (el == null) return
			// allow skipping link
			// @ts-ignore
			if (el.hasAttribute('native')) return
			let ret = validLink(el, window.PineconeRouter.settings.hash)
			if (!ret.valid) return
			// prevent default behavior.
			if (e.stopImmediatePropagation) e.stopImmediatePropagation()
			if (e.stopPropagation) e.stopPropagation()
			e.preventDefault()
			navigate(ret.link)
		}
	)
}

/**
 *  Go to the specified path without reloading
 * @param {string} path the path with no hash even if using hash routing
 * @param {boolean} fromPopState this will be set to true if called from window.onpopstate event
 * @param {boolean} firstLoad this will be set to true if this is the first page loaded, also from page reload
 */
function navigate(path, fromPopState = false, firstLoad = false) {
	if (!path) path = '/'
	window.PineconeRouter.currentContext.path = path

	// only add basePath if it was set
	// if not using hash routing
	// and if it wasn't added already
	if (!window.PineconeRouter.settings.hash) {
		if (
			window.PineconeRouter.settings.basePath != '/' &&
			!path.startsWith(window.PineconeRouter.settings.basePath)
		) {
			path = window.PineconeRouter.settings.basePath + path
		}
		if (
			path == window.PineconeRouter.settings.basePath &&
			!path.endsWith('/')
		) {
			path += '/'
		}
	}

	const route: Route | undefined = window.PineconeRouter.routes.find(
		(route: Route) => {
			let m = match(path, route.path)
			route.params = m != false ? m : {}
			return m != false
		}
	)

	let context =
		typeof route == 'undefined'
			? buildContext('notfound', path, [])
			: buildContext(route.path, path, route.params)

	window.PineconeRouter.currentContext = context
	// window.dispatchEvent(window.PineconeRouter.loadStart)
	// the middleware may return 'stop' to stop execution of this function
	if (
		middleware('onBeforeHandlersExecuted', route, path, firstLoad) == 'stop'
	)
		return
	// do not call pushstate from popstate event https://stackoverflow.com/a/50830905
	if (!fromPopState) {
		let fullPath = ''
		if (window.PineconeRouter.settings.hash) {
			fullPath = '#'
			fullPath += window.location.search + path
		} else {
			fullPath = path + window.location.search + window.location.hash
		}
		// don't create duplicate history entry on first page load
		if (!firstLoad) history.pushState({ path: fullPath }, '', fullPath)
		else {
			if (window.PineconeRouter.settings.hash) {
				if (path == '/') {
					return navigate('/', false, false)
				}
			}
		}
	}
	// only call handle if the route has a handler
	// or the route doesnt exist and there is a not found handler
	if (
		(!route && !!window.PineconeRouter.notfound.handlers) ||
		(route && !!route.handlers)
	) {
		if (
			!handle(
				route?.handlers ?? window.PineconeRouter.notfound.handlers,
				context
			)
		) {
			window.dispatchEvent(window.PineconeRouter.loadEnd)
			return // do not call onHandlersExecuted middlewares
		}
	}
	middleware('onHandlersExecuted', route, path, firstLoad)
}

/**
 * Create the context object
 */
export function buildContext(route: string, path: string, params: {}): Context {
	return {
		route: route,
		path: path,
		params: params,
		query: window.location.search.substring(1), // query w/out leading '?'
		hash: window.location.hash.substring(1), // hash without leading '#'
		redirect(path) {
			navigate(path)
			return 'stop'
		},
		navigate(path) {
			navigate(path)
		},
	}
}
