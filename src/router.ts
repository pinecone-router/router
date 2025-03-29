import createRoute, { match, type Route, type RouteOptions } from './route'
import { createNavigationHistory, type NavigationHistory } from './history'
import { settings, updateSettings, type Settings } from './settings'
import { handle, HandlerResult, handlerState } from './handler'
import { buildContext, type Context } from './context'
import { load, preload } from './templates'
import { addBasePath } from './utils'
import {
	TARGET_ID_NOT_SPECIFIED,
	ROUTE_NOT_FOUND,
	ROUTE_EXISTS,
} from './errors'

// Create a custom type that guarantees the notfound route exists
export type RoutesMap = Map<string, Route> & {
	get(key: 'notfound'): Route
}

export interface PineconeRouter {
	readonly name: string
	readonly version: string

	routes: RoutesMap
	context: Context
	settings: Settings
	history: NavigationHistory

	isLoading: () => boolean

	/**
	 * Add a new route
	 *
	 * @param {string} path the path to match
	 * @param {RouteOptions} options the options for the route
	 */
	add: (path: string, options: RouteOptions) => void

	/**
	 * Remove a route
	 *
	 * @param {string} path the route to remove
	 */
	remove: (path: string) => void

	/**
	 *  Navigate to the specified path
	 *
	 * @param {string} path the path with no hash even if using hash routing
	 * @param {boolean} fromPopState INTERNAL Is set to true when called from
	 *                               onpopstate event
	 * @param {boolean} firstLoad INTERNAL Is set to true on browser page load.
	 * @param {number} index INTERNAL the index of the navigation history to go to
	 * @returns {Promise<void>}
	 */
	navigate: (
		path: string,
		fromPopState?: boolean,
		firstLoad?: boolean,
		index?: number
	) => Promise<void>
}

export const loadingState = {
	loading: false,
	loadStart: new Event('pinecone:start'),
	loadEnd: new Event('pinecone:end'),

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
}

export const createPineconeRouter = (
	name: string,
	version: string
): PineconeRouter => {
	const notfound = createRoute('notfound', {
		handlers: [
			(ctx) => console.error(new ReferenceError(ROUTE_NOT_FOUND(ctx.path))),
		],
	})

	const routes = new Map([['notfound', notfound]]) as RoutesMap

	const context = buildContext('', {
		route: notfound,
		params: {},
	})

	const router: PineconeRouter = {
		name,
		version,
		history: createNavigationHistory(),
		routes,
		context,
		isLoading: () => loadingState.loading,

		get settings(): Settings {
			return settings
		},

		set settings(value: Partial<Settings>) {
			updateSettings(value)
		},

		add: function (path: string, options: RouteOptions) {
			// check if the route was registered already
			// but allow updating the notfound route
			if (path != 'notfound' && this.routes.has(path)) {
				throw new Error(ROUTE_EXISTS(path))
			}

			if (options.templates && options.preload) {
				preload(options.templates)
			}
			this.routes.set(path, createRoute(path, options))
		},

		remove: function (path: string): void {
			this.routes.delete(path)
		},

		navigate: async function (
			path: string,
			fromPopState?: boolean,
			firstLoad?: boolean,
			index?: number
		) {
			// if a navigation request was made before previous route handlers were
			// done, cancel them
			if (!handlerState.done) handlerState.cancel = true

			// if specified add the basePath
			// TODO: Test basepath
			path = addBasePath(path || '/', settings.basePath)

			// special case: first load with hash routing and root path
			if (firstLoad && settings.hash && path === '/') {
				return this.navigate('/', false, false)
			}

			let route = this.routes.get('notfound')
			let params = {}

			this.routes.forEach((r: Route) => {
				const res = match(addBasePath(r.path, settings.basePath), path)
				if (res) {
					params = res
					route = r
					return
				}
			})

			// create a new local context object.
			// this is to prevent editing the global context, which triggers
			// Alpine effects and causes them to run before this function has
			// done its work.
			const context = buildContext(path, {
				...this.context,
				route,
				params,
			})

			const handlers = settings.globalHandlers.concat(context.route.handlers)

			// if alwaysSendLoadingEvents is true, or there are handlers or templates
			// to render and the path changed
			// (ie. not soft reload), then dispatch the loading start event
			if (
				settings.alwaysLoad ||
				((handlers.length || context.route.templates.length) &&
					this.context.path != path)
			) {
				loadingState.startLoading()
			}

			if (handlers.length) {
				const ok = await handle(handlers, context)

				// if a handler halted execution,
				// return without displaying a template
				if (ok == HandlerResult.HALT) {
					loadingState.endLoading()
					return
				}
				if (!context.route.templates) {
					loadingState.endLoading()
				}
			} else {
				handlerState.done = true
			}

			// if called from navigateTo(), do not add the path to the stack
			if (index != null) {
				this.history.index = index
			} else if (path != this.context.path) {
				// if path has changed push it to the stack
				this.history.push(path, !fromPopState && !firstLoad, settings.hash)
			}

			// update the global context, trigger Alpine effect, and render templates.
			this.context = context

			// show templates added programmatically
			if (context.route.programmaticTemplates) {
				let target = document.getElementById(
					context.route.targetID ?? settings.targetID ?? ''
				)

				if (!target) throw new Error(TARGET_ID_NOT_SPECIFIED)

				load(context.route.templates, target).finally(() =>
					loadingState.endLoading()
				)
			}

			if (settings.alwaysLoad) loadingState.endLoading()
		},
	}

	router.history.setRouter(router)

	return router
}
