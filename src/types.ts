import Route from './route'

export declare type Context = {
	route: string
	path: string
	params: { [key: string]: any }
	/**
	 * query without leading '?'
	 */
	query: string
	/**
	 * hash without leading '#'
	 */
	hash: string
	redirect(path: string)
	navigate(path: string)
}

export type Handler = (context: Context) => 'stop' | void

export declare interface Middleware {
	name: string
	version?: string
	settings?: { [key: string]: any }
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
		firstload: boolean
	) => 'stop' | void

	[key: string]: any
}

export declare interface Settings {
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
	 * @default `#app`
	 * @summmary selector for where the views will render
	 */
	viewSelector: string
}
