import { Context } from './context'
import type { Handler } from './handler'

export interface Route {
	match: (path: string) => MatchResult
	programmaticTemplates: boolean
	templateTargetId: string
	handlers: Handler[]
	templates: string[]
	preload: boolean
	pattern?: RegExp
	path: string
}

export interface MatchResult {
	match: boolean
	params?: Context['params']
}

export interface RouteOptions {
	templateTargetId?: string
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
	{
		templateTargetId = '',
		templates = [],
		handlers = [],
		preload = false,
	}: RouteOptions = {},
): Route {
	// Create the route object
	const route: Route = {
		pattern: path.indexOf(':') !== -1 ? buildRegexp(path) : undefined,
		programmaticTemplates: templates.length > 0,
		templateTargetId,
		templates,
		handlers,
		preload,
		path,

		/**
		 * Check whether a path matches against this route
		 * @param {string} path - path to match against
		 * @returns {MatchResult}
		 */
		match(path: string): MatchResult {
			if (this.pattern) {
				const found = path.match(this.pattern)
				if (!found) return { match: false }
				return { match: true, params: found.groups }
			}
			return { match: path === this.path }
		},
	}

	return route
}

// Based on https://github.com/shaunlee/alpinejs-router/blob/dev/src/pattern.js
const buildRegexp = (path: string): RegExp => {
	path = path.endsWith('/') ? path.slice(0, -1) : path
	let optional: boolean
	const pattern = path
		.split('/')
		.map((segment, i) => {
			if (i == 0) return segment
			if (!segment.startsWith(':')) {
				return '/' + segment
			}
			let field = segment.substring(1)
			let fieldPattern = '[^/]+'

			// Handle parameter modifiers
			if (field.endsWith('?')) {
				field = field.slice(0, -1)
				optional = true
			} else if (field.endsWith('*')) {
				field = field.slice(0, -1)
				fieldPattern = `.*`
			} else if (field.includes('(')) {
				const ef = field.match(/\((.+?)\)/)
				if (ef) {
					field = field.substring(0, field.indexOf('('))
					fieldPattern = ef[1]
				}
			}
			if (optional) {
				// optional modifier requires a different format
				// with the slash inside the optional group
				return `(?:/(?<${field}>${fieldPattern}))?`
			} else {
				return `/(?<${field}>${fieldPattern})`
			}
		})
		.join('')
	return new RegExp(`^${pattern}\/?$`)
}
