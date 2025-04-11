import type { Handler } from './handler'
export interface Route {
	/**
	 * Set to true automatically when creating a route programmatically.
	 * @internal
	 */
	readonly programmaticTemplates: boolean

	/**
	 * Set to true when the route is added programmatically and defined as having
	 * params in the template urls
	 * @internal
	 */
	readonly interpolate: boolean

	/**
	 * The regex pattern used to match the route.
	 * @internal
	 */
	readonly pattern: RegExp

	/**
	 * The raw route path
	 */
	readonly path: string

	/**
	 * The target ID for the route's templates
	 */
	readonly targetID?: string

	/**
	 * The name of the route
	 */
	readonly name: string

	match(path: string): undefined | { [key: string]: string }
	handlers: Handler<unknown, unknown>[]
	templates: string[]
}

export interface RouteOptions {
	handlers?: Route['handlers']
	interpolate?: boolean
	templates?: string[]
	targetID?: string
	preload?: boolean
	name?: string
}

export type MatchResult =
	| undefined
	| {
			[key: string]: string
	  }

/**
 * Creates a new Route object
 * @param {string} path - route path pattern
 * @param {RouteOptions} options - route configuration options
 * @returns {Route} - a route object
 */
export const createRoute = (
	path: string,
	{
		targetID,
		templates = [],
		handlers = [],
		interpolate = false,
		name,
	}: RouteOptions = {}
): Route => ({
	programmaticTemplates: templates.length > 0,
	pattern: parse(path),
	interpolate,
	templates,
	targetID,
	handlers,
	name: name || path,
	path,
	match(path: string) {
		const m = this.pattern.exec(path)
		if (m) {
			return { ...m.groups }
		}
	},
})

/**
 * @param {string} input The route pattern
 * @returns {RegExp} The compiled regular expression for the route
 */
export function parse(input: string): RegExp {
	// split the input string into segments by '/'
	const segments = input.split('/').filter(Boolean)

	// construct the regex pattern from the segments
	const pattern = segments
		.map((segment) => {
			// if the segment does not start with ':', return it as a static
			// path segment
			if (!segment.startsWith(':')) return '/' + segment

			// extract the parameter name, modifier, and extension (if any) from
			// the segment
			const [, name, modifier, ext] =
				segment.match(/^:(\w+)([?+*]?)(?:\.(.+))?$/) || []

			// check if the segment is a wildcard or optional
			const isWildcard = modifier === '*' || modifier === '+'
			const isOptional = modifier === '?' || modifier === '*'

			// create the base pattern for matching the segment
			const basePattern = isWildcard ? (isOptional ? '.*?' : '.+') : '[^/]+?'

			// construct the named capture group pattern for the segment
			const namedPattern = `(?<${name}>${basePattern})`

			// if the segment has an extension, add it to the pattern
			const extensionPattern = ext ? `\\.${ext}` : ''

			// combine the named pattern and extension pattern
			const segmentPattern = namedPattern + extensionPattern

			// if the segment is optional, wrap it in a non-capturing group
			// with a '?' quantifier
			if (isOptional) return `(?:/${segmentPattern})?`

			// return the segment pattern as a required part of the path
			return `/${segmentPattern}`
		})
		.join('')

	// create a regex pattern that matches the entire path, allowing for an
	// optional trailing slash and case insensitivity
	return new RegExp(`^${pattern}/?$`, 'i')
}

export default createRoute
