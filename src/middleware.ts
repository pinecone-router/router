import { type Route } from './route'
import { type Settings } from './router'

export declare interface Middleware {
	name: string
	version?: string
	settings?: Record<string, any>
	/**
	 * This will be called at router initialization.
	 * used for detecting router settings.
	 */
	init?: (settings: Settings) => void
	/**
	 * Called for each route during initialization,
	 * before the route is processed & added.
	 * @param {HTMLTemplateElement} el the route's <template> element
	 * @param {ComponentController} component the router's alpine component
	 * @param {string} path the route's path
	 */
	onBeforeRouteProcessed?: (el: HTMLTemplateElement, path: string) => void
	/**
	 * Called for each route on initialization,
	 * after the route is processed & added.
	 * @param {HTMLTemplateElement} el the route's <template> element
	 * @param {ComponentController} component the router's alpine component
	 * @param {string} path the route's path
	 */
	onAfterRouteProcessed?: (el: HTMLTemplateElement, path: string) => void
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
		firstload: boolean,
	) => 'stop' | void

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
		firstload: boolean,
	) => 'stop' | void

	[key: string]: any
}

/**
 * Call a function on all middlewares loaded, if any.
 * @param {string} func middleware function to call.
 * @param {any} args arguments to pass to the function.
 * @returns {boolean} false if the middleware function return false, i.e. it want to stop execution of the function and return.
 */
export function middleware(func: string, ...args: any): string | undefined {
	if (!window.PineconeRouterMiddlewares) return
	for (const i in window.PineconeRouterMiddlewares) {
		let plugin: Middleware = window.PineconeRouterMiddlewares[i]
		if (plugin[func] == null) return
		let ret = plugin[func](...args)
		// the return of the function will only be 'stop'
		// if the middleware request stopping the navigate function.
		if (ret == 'stop') return 'stop'
	}
}
