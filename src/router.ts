import { handle, HandlerResult, type Handler } from './handler'
import {
	ROUTE_EXISTS,
	PineconeRouterError,
	TARGET_ID_NOT_SPECIFIED,
} from './errors'
import { buildContext, type Context } from './context'
import createRoute, { type Route, type RouteOptions } from './route'
import { load, preload } from './templates'
import { addBasePath } from './utils'

export type Settings = {
	/**
	 * @default false
	 * @summary enable hash routing
	 */
	hash: boolean
	/**
	 * @default `/`
	 * @summary The base path of the site, for example /blog
	 * Note: do not use with using hash routing!
	 */
	basePath: string
	/**
	 * @default undefined
	 * @summmary Set an optional ID for where the templates will render by default
	 * This can be overriden by the .target modifier
	 */
	templateTargetId?: string
	/**
	 * @default true
	 * @summary Set to false if you don't want to intercept links by default.
	 */
	interceptLinks: boolean
	/**
	 * @default false
	 * @summary Set to true to always send loading events, even if the template is inline and there are no handlers.
	 */
	alwaysSendLoadingEvents: boolean
}

export interface PineconeRouter {
	version: string
	name: string
	notfound: Route
	routes: Route[]
	globalHandlers: Handler[]

	context: Context
	settings: Settings

	loadStart: Event
	loadEnd: Event

	endEventDispatched: boolean
	startEventDispatched: boolean

	// Methods
	/**
	 * Dispatch the loadStart event
	 */
	startLoading: () => void
	/**
	 * Dispatch the loadEnd event
	 */
	endLoading: () => void
	/**
	 * Add a new route
	 *
	 * @param {string} path the path to match
	 * @param {RouteOptions} options the options for the route
	 * @returns {number} the index of the route in the routes array
	 */
	add: (path: string, options: RouteOptions) => number
	/**
	 * Remove a route
	 *
	 * @param {string} path the route to remove
	 */
	remove: (path: string) => void
	/**
	 * Redirect to a specified path
	 * This prevent the execution of subsequent handlers if returned inside a handler.
	 *
	 * @param {string} path - The path to navigate to
	 * @returns {HandlerResult.HALT} HandlerResult.HALT
	 */
	redirect: (path: string) => HandlerResult.HALT
	/**
	 * Check if the router can navigate backward
	 * @returns {boolean} true if the router can go back
	 */
	canGoBack: () => boolean
	/**
	 * Go back to the previous route in the navigation stack
	 */
	back: () => void
	/**
	 * Check if the router can navigate forward
	 *
	 * @returns {boolean} true if the router can go forward
	 */
	canGoForward: () => boolean
	/**
	 * Go to the next route in the navigation stack
	 */
	forward: () => void
	/**
	 *  Navigate to the specified path
	 *
	 * @param {string} path the path with no hash even if using hash routing
	 * @param {boolean} fromPopState this will be set to true if called from window.onpopstate event
	 * @param {boolean} firstLoad this will be set to true if this is the first page loaded, also from page reload
	 * @param {number} navigationIndex the index of the navigation stack to go to
	 */
	navigate: (
		path: string,
		fromPopState?: boolean,
		firstLoad?: boolean,
		navigationIndex?: number,
	) => Promise<void>
}

export const createPineconeRouter = (version: string): PineconeRouter => {
	const router: PineconeRouter = {
		version,
		name: 'pinecone-router',
		notfound: createRoute('notfound', {}),
		routes: [],
		globalHandlers: [],

		context: {
			route: undefined,
			path: '',
			params: {},
			query: window.location.search.substring(1),
			hash: window.location.hash.substring(1),
			navigationStack: [],
			navigationIndex: 0,
		},

		settings: {
			hash: false,
			basePath: '/',
			templateTargetId: undefined,
			interceptLinks: true,
			alwaysSendLoadingEvents: false,
		},

		loadStart: new Event('pinecone-start'),
		loadEnd: new Event('pinecone-end'),

		endEventDispatched: false,
		startEventDispatched: false,

		startLoading: function (): void {
			if (!this.startEventDispatched) document.dispatchEvent(this.loadStart)
			this.startEventDispatched = true
		},

		endLoading: function (): void {
			if (this.startEventDispatched && !this.endEventDispatched)
				document.dispatchEvent(this.loadEnd)
			this.endEventDispatched = true
		},

		add: function (path: string, options: RouteOptions): number {
			// check if the route was registered on the same router.
			if (this.routes.find((r: Route) => r.path == path) != null) {
				throw new PineconeRouterError(ROUTE_EXISTS(path))
			}
			if (options.templates && options.preload) {
				preload(options.templates)
			}
			return this.routes.push(createRoute(path, options)) - 1
		},

		remove: function (path: string): void {
			const i = this.routes.findIndex((r: Route) => r.path == path)
			delete this.routes[i]
		},

		redirect: function (path: string): HandlerResult.HALT {
			this.navigate(path)
			return HandlerResult.HALT
		},

		canGoBack: function (): boolean {
			return this.context.navigationIndex > 0
		},

		back: function (): void {
			this.navigate(
				this.context.navigationStack[this.context.navigationIndex - 1],
				false,
				false,
				this.context.navigationIndex - 1,
			)
		},

		canGoForward: function (): boolean {
			return (
				this.context.navigationIndex < this.context.navigationStack.length - 1
			)
		},

		forward: function (): void {
			this.navigate(
				this.context.navigationStack[this.context.navigationIndex + 1],
				false,
				false,
				this.context.navigationIndex + 1,
			)
		},

		navigate: async function (
			path: string,
			fromPopState: boolean = false,
			firstLoad: boolean = false,
			navigationIndex?: number,
		): Promise<void> {
			// reset the loading events
			this.startEventDispatched = false
			this.endEventDispatched = false

			if (!path) path = '/'

			// if specified add the basePath
			// TODO
			path = addBasePath(path, this.settings.basePath)
			// console.log({ path })

			// if called from this.back() or .forward(), do not add the path to the stack
			// but change the index accordingly
			if (navigationIndex != null) {
				this.context.navigationIndex = navigationIndex
			} else if (path != this.context.path) {
				// the above check makes sure soft-reloading doesnt add to the stack duplicate entries

				// if navigated after using back(), remove all the elements of the stack from the current index to the end
				// then add the current path at the end of the stack
				if (
					this.context.navigationIndex !==
					this.context.navigationStack.length - 1
				) {
					this.context.navigationStack = this.context.navigationStack.slice(
						0,
						this.context.navigationIndex + 1,
					)
					this.context.navigationStack.push(path)
					this.context.navigationIndex = this.context.navigationStack.length - 1
				} else {
					// if this is a regular navigation request, add the path to the stack
					this.context.navigationStack.push(path)
					this.context.navigationIndex++
				}
			}

			const route: Route =
				this.routes.find((route: Route) => route.match(path)) ?? this.notfound

			// add global handlers before the route handlers, if any

			// if the route has handlers, it will mark them unhandled
			// this is so templates won't render till then.
			route.handlersDone = !route.handlers.length && !this.globalHandlers.length

			// alwaysSendLoadingEvents is true
			// or there are handlers or templates to render and the path changed (not soft reload)
			// then dispatch the loading start event
			if (
				this.settings.alwaysSendLoadingEvents ||
				((route.handlers.length ||
					this.globalHandlers.length ||
					route.templates.length) &&
					this.context.path != path)
			) {
				this.startLoading()
			}

			// create a new context object based on the route
			this.context = buildContext(
				route,
				path,
				this.context.navigationStack,
				this.context.navigationIndex,
			)

			// do not call pushstate from popstate event https://stackoverflow.com/a/50830905
			if (!fromPopState) {
				let fullPath = ''
				if (this.settings.hash) {
					fullPath = '#'

					fullPath += path
				} else {
					fullPath = path
					fullPath += window.location.hash
				}
				// don't create duplicate history entry on first page load
				if (!firstLoad) history.pushState({ path: fullPath }, '', fullPath)
				else {
					if (this.settings.hash) {
						if (path == '/') {
							return this.navigate('/', false, false)
						}
					}
				}
			}

			if (route && (route.handlers.length || this.globalHandlers.length)) {
				route.cancelHandlers = false
				let ok = await handle(
					this.globalHandlers.concat(route.handlers),
					this.context,
					route,
				)
				// if a handler halted execution, for example through returning PineconeRouter.redirect(),
				//  return without displaying a template
				if (ok == HandlerResult.HALT) {
					this.endLoading()
					return
				}
				route.handlersDone = true
				if (!route.templates) this.endLoading()
			}

			// show templates added programmatically
			if (route.programmaticTemplates) {
				let target = document.getElementById(
					route.templateTargetId ?? this.settings.templateTargetId,
				)

				if (!target) throw new PineconeRouterError(TARGET_ID_NOT_SPECIFIED)

				load(route.templates, target).then(() => {
					this.endLoading()
				})
			}

			if (this.settings.alwaysSendLoadingEvents) this.endLoading()
		},
	}

	return router
}
