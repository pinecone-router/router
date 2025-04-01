import { type Alpine } from 'alpinejs'

import { createNavigationHistory, type NavigationHistory } from './history'
import { buildContext, type Context } from './context'
import createRoute, { type Route, type RouteOptions } from './route'
import { settings, updateSettings, type Settings } from './settings'
import { load, preload } from './templates'
import { addBasePath } from './utils'
import { handle } from './handler'
import {
	TARGET_ID_NOT_SPECIFIED,
	ROUTE_NOT_FOUND,
	ROUTE_EXISTS,
} from './errors'
import { RouteTemplate } from './directives/x-route'

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

	loading: boolean

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

export const createPineconeRouter = (
	Alpine: Alpine,
	name: string,
	version: string
): PineconeRouter => {
	const notfound = createRoute('notfound', {
		handlers: [
			(ctx) => console.error(new ReferenceError(ROUTE_NOT_FOUND(ctx.path))),
		],
	})

	const routes = new Map([['notfound', notfound]]) as RoutesMap

	const context = buildContext('', {}, '')
	let controller: AbortController | null = null
	let loading = false

	const router: PineconeRouter = {
		name,
		version,
		history: createNavigationHistory(),
		routes,
		context,

		get loading(): boolean {
			return loading
		},

		set loading(value: boolean) {
			if (loading == value) return
			loading = value
			document.dispatchEvent(
				new Event(value ? 'pinecone:start' : 'pinecone:end')
			)
		},

		get settings(): Settings {
			return settings
		},

		set settings(value: Partial<Settings>) {
			updateSettings(value)
		},

		add: function (path: string, options: RouteOptions) {
			// check if the route was registered already
			// but allow updating the notfound route
			if (path != 'notfound') {
				if (this.routes.has(path)) {
					throw new Error(ROUTE_EXISTS(path))
				}
			}

			// preload if specified globally or in the route options
			if (options.templates && (settings.preload || options.preload)) {
				preload(options.templates)
			}

			// path = addBasePath(path, settings.basePath)
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
			// Cancel any ongoing handlers
			if (controller) {
				controller.abort()
			}
			// Create a new controller for this navigation
			controller = new AbortController()
			// controller.signal.addEventListener('abort', () => {
			// 	this.loading = false
			// })

			// if specified add the basePath
			// TODO: Test basepath
			path = addBasePath(path || '/', settings.basePath)

			// special case: first load with hash routing and root path
			if (firstLoad && settings.hash && path === '/') {
				return this.navigate('/', false, false)
			}

			let route = this.routes.get('notfound')
			let params = {}

			for (let [_, r] of this.routes) {
				const res = r.match(path)
				if (res) {
					params = res
					route = r
					break
				}
			}

			// create a new local context object.
			// this is to prevent editing the global context, which triggers
			// Alpine effects and causes them to run before this function has
			// done its work.
			const context = buildContext(path, params, route.path)

			const handlers = settings.globalHandlers.concat(route.handlers)

			this.loading = true

			if (handlers.length) {
				try {
					await handle(handlers, context, controller)
				} catch (_) {
					this.loading = false
					return
				}

				if (!route.templates) {
					this.loading = false
				}
			}

			if (index != null) {
				// if called from history.to(), do not push to the NavigationHistory.
				// only call History.pushState() to update the URL
				this.history.index = index
				this.history.pushState(path, settings.hash)
			} else if (path != this.context.path) {
				// if this was non-history navigation, and  path has changed,
				//  push the path to the NavigationHistory
				this.history.push(path, !fromPopState && !firstLoad, settings.hash)
			}

			// update the global context, trigger Alpine effect, and render templates.
			this.context = context

			// show templates added programmatically
			if (route.programmaticTemplates) {
				let target = document.getElementById(
					route.targetID ?? settings.targetID ?? ''
				)

				if (!target) throw new Error(TARGET_ID_NOT_SPECIFIED)

				load(route.templates, target).finally(() => (this.loading = false))
			}

			// end loading if there are no templates
			if (!route.templates) this.loading = false
		},
	}
	document.addEventListener('pinecone:start', () => {
		router.loading = true
	})
	document.addEventListener('pinecone:end', () => {
		router.loading = false
	})
	router.history.setRouter(router)

	return router
}
