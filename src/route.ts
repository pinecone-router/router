import type { Handler } from './handler'
export interface Route {
	/**
	 * Set to true automatically when creating a route programmatically.
	 * @internal
	 */
	readonly programmaticTemplates: boolean
	/**
	 * The regex pattern used to match the route.
	 * @internal
	 */
	readonly pattern: RegExp
	/**
	 * The target ID for the route's templates
	 */
	readonly targetID?: string
	/**
	 * The raw route path
	 */
	readonly path: string

	match(path: string): RouteArgs
	handlers: Handler<unknown, unknown>[]
	templates: string[]
}

export interface RouteOptions {
	targetID?: string
	handlers?: Route['handlers']
	templates?: Route['templates']
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
): Route {
	// Create the route object
	const route: Route = {
		programmaticTemplates: templates.length > 0,
		targetID,
		templates,
		handlers,
		pattern: parse(path),
		path,
		match(path: string) {
			let m = this.pattern.exec(path)
			if (m) {
				return { ...m.groups }
			}
		},
	}

	return route
}
type RouteArgs = void | {
	[key: string]: string
}

/**
 * @param {string} input The route pattern
 */
export function parse(input: string): RegExp {
	let optionalIndex: number,
		segment: string | undefined,
		extensionIndex: number,
		pattern = ''
	const segments = input.split('/')
	segments[0] || segments.shift()

	while ((segment = segments.shift())) {
		if (segment.startsWith(':')) {
			optionalIndex = segment.indexOf('?', 1)
			extensionIndex = segment.indexOf('.', 1)
			let paramName = segment.substring(
				1,
				Math.min(
					...[optionalIndex, extensionIndex, segment.length].filter(
						(i) => i > 0
					)
				)
			)

			const isWildcard = paramName.endsWith('*') || paramName.endsWith('+')
			const isOptionalWildcard = paramName.endsWith('*')

			if (isWildcard) {
				paramName = paramName.slice(0, -1)
				pattern += isOptionalWildcard
					? `(?:/(?<${paramName}>.*)?)?`
					: `/(?<${paramName}>.+)`
			} else {
				pattern +=
					optionalIndex > 0 && extensionIndex < 0
						? `(?:/(?<${paramName}>[^/]+?))?`
						: `/(?<${paramName}>[^/]+?)`

				if (extensionIndex > 0)
					pattern +=
						(optionalIndex > 0 ? '?' : '') +
						'\\' +
						segment.substring(extensionIndex)
			}
		} else {
			pattern += '/' + segment
		}
	}

	return new RegExp('^' + pattern + '\/?$', 'i')
}
