import createRoute, { type Route, type RouteOptions } from './route'
import { handle, HandlerResult, type Handler } from './handler'
import { buildContext, type Context } from './context'
import { load, preload } from './templates'
import { addBasePath } from './utils'
import {
	TARGET_ID_NOT_SPECIFIED,
	PineconeRouterError,
	ROUTE_NOT_FOUND,
	ROUTE_EXISTS,
} from './errors'

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
	cancelHandlers: boolean
	handlersDone: boolean

	context: Context
	settings: Settings

	loadStart: Event
	loadEnd: Event

	loading: boolean

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
	const notfound = createRoute('notfound', {
		handlers: [
			(ctx) =>
				console.error(new PineconeRouterError(ROUTE_NOT_FOUND(ctx.path))),
		],
	})

	const context = buildContext('', {
		route: notfound,
		params: {},
		navigationStack: [],
		navigationIndex: 0,
	})

	const router: PineconeRouter = {
		version,
		name: 'pinecone-router',
		notfound: notfound,
		routes: [],
		globalHandlers: [],
		cancelHandlers: false,
		handlersDone: false,

		context,

		settings: {
			hash: false,
			basePath: '/',
			templateTargetId: undefined,
			interceptLinks: true,
			alwaysSendLoadingEvents: false,
		},

		loadStart: new Event('pinecone:start'),
		loadEnd: new Event('pinecone:end'),

		loading: false,

		startLoading: function (): void {
			if (!this.loading) {
				document.dispatchEvent(this.loadStart)
				this.loading = true
			}
		},

		endLoading: function (): void {
			if (this.loading) {
				document.dispatchEvent(this.loadEnd)
				this.loading = false
			}
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
			// if a navigation request was made before previous route handlers were done, cancel them
			// this include link clicks, back/forward, etc
			if (!this.handlersDone) {
				this.cancelHandlers = true
			}

			if (!path) path = '/'

			// if specified add the basePath
			// TODO
			path = addBasePath(path, this.settings.basePath)
			// console.debug({ path })

			// create a new local context
			// this is to prevent editing the global context
			// which trigger Alpine effects
			// which causes them to run before this function has done its work.
			const context = buildContext(path, { ...this.context })

			const route: Route =
				this.routes.find((route: Route) => {
					const r = route.match(path)
					if (r.params) context.params = r.params
					return r.match
				}) ?? this.notfound

			context.route = route

			// if alwaysSendLoadingEvents is true
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

			// do not call pushstate from popstate event https://stackoverflow.com/a/50830905
			if (!fromPopState) {
				// build the full path based on settings
				const fullPath = this.settings.hash
					? '#' + path
					: path + window.location.hash

				// handle history state management
				if (!firstLoad) {
					history.pushState({ path: fullPath }, '', fullPath)
				} else if (this.settings.hash && path === '/') {
					// special case: first load with hash routing and root path
					return this.navigate('/', false, false)
				}
			}

			if (route.handlers.length || this.globalHandlers.length) {
				const ok = await handle(
					this,
					this.globalHandlers.concat(route.handlers),
					context,
				)

				// if a handler halted execution, for example through returning PineconeRouter.redirect(),
				//  return without displaying a template
				if (ok == HandlerResult.HALT) {
					this.endLoading()
					return
				}
				if (!route.templates) {
					this.endLoading()
				}
			} else {
				this.handlersDone = true
			}

			// if called from this.back() or .forward(), do not add the path to the stack
			if (navigationIndex != null) {
				context.navigationIndex = navigationIndex
			} else if (path != this.context.path) {
				// Only update stack if navigating to a different path
				if (context.navigationIndex < context.navigationStack.length - 1) {
					// Trim navigation stack if we're not at the end
					context.navigationStack = context.navigationStack.slice(
						0,
						context.navigationIndex + 1,
					)
				}
				// Add current path and update index
				context.navigationStack.push(path)
				context.navigationIndex = context.navigationStack.length - 1
			}

			this.context = context

			const dispatch = (name: string) =>
				document.dispatchEvent(
					new CustomEvent(`pinecone:${name}`, {
						detail: { context },
					}),
				)

			dispatch('navigate')
			if (this.context.route.path === route.path) {
				// if the route is the same, but the path has changed (ie. param change)
				if (this.context.path != context.path) dispatch('update')
				else dispatch('refresh')
			} else dispatch('change')

			// show templates added programmatically
			if (route.programmaticTemplates) {
				let target = document.getElementById(
					route.templateTargetId ?? this.settings.templateTargetId,
				)

				if (!target) throw new PineconeRouterError(TARGET_ID_NOT_SPECIFIED)

				load(route.templates, target).finally(() => this.endLoading())
			}

			if (this.settings.alwaysSendLoadingEvents) this.endLoading()
		},
	}

	return router
}
