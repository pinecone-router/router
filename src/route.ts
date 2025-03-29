import type { Handler } from './handler'
export interface Route {
	/**
	 * Set to true automatically when creating a route programmatically.
	 */
	readonly programmaticTemplates: boolean
	/**
	 * The regex pattern used to match route params, if any.
	 */
	readonly pattern?: RegExp
	/**
	 * The target ID for the route templates
	 */
	readonly targetID?: string
	/**
	 * The raw route path
	 */
	readonly path: string

	handlers: Handler[]
	templates: string[]
}

export interface RouteOptions {
	targetID?: string
	handlers?: Handler[]
	templates?: string[]
	preload?: boolean
}

/**
 * Creates a new Route object
 * @param {string} path - route path pattern
 * @param {RouteOptions} options - route configuration options
 * @returns {Route} - a route object
 */
export default function createRoute(
	path: string,
	{ targetID, templates = [], handlers = [] }: RouteOptions = {}
	// ignoreTrailingSlash: boolean = true
): Route {
	// Create the route object
	const route: Route = {
		programmaticTemplates: templates.length > 0,
		targetID,
		templates,
		handlers,
		path,
		/**
		 * Check whether a path matches against this route
		 * @param {string} path path to match against
		 * @returns {undefined | Context['params']}  returns undefined if no match,
		 *          otherwise returns the route params
		 */
	}

	return route
}
type RouteArgs =
	| undefined
	| {
			[key: string]: string
	  }

// https://github.com/amio/my-way
export function match(pattern: string, path: string): RouteArgs {
	const args: Record<string, string> = {}

	// Pre-compile regexes once
	const patternRegex = /\/(:)?([\w-]+)([*?+])?(?:<([^>]+)>)?/g
	const pathRegex = /\/([^/]+)/g

	let patternMatch = patternRegex.exec(pattern)
	let pathMatch = pathRegex.exec(path)

	while (patternMatch !== null) {
		const [fullPattern, isParam, name, flag, constraint] = patternMatch

		// No path segment to match against
		if (pathMatch === null) {
			return flag === '?' || flag === '*' ? args : undefined
		}

		// Handle rest parameters (+ and *)
		if (flag === '+' || flag === '*') {
			const rest = safeDecodeURIComponent(path.slice(pathMatch.index + 1))
			if (constraint && !new RegExp(`^${constraint}$`).test(rest))
				return undefined
			args[name] = rest
			return args
		}

		const [fullPath, value] = pathMatch

		// Literal segment must match exactly
		if (!isParam && fullPattern !== fullPath) return undefined

		// Named parameter with optional constraint
		if (isParam) {
			if (constraint && !new RegExp(`^${constraint}$`).test(value))
				return undefined
			args[name] = safeDecodeURIComponent(value)
		}

		patternMatch = patternRegex.exec(pattern)
		pathMatch = pathRegex.exec(path)
	}

	// Make sure we've consumed the entire path
	return pathMatch === null ? args : undefined
}

function safeDecodeURIComponent(uri: string): string {
	try {
		return decodeURIComponent(uri)
	} catch {
		return uri
	}
}
