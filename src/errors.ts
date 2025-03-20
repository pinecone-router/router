/**
 * Centralized error messages for Pinecone Router
 */

export const INVALID_TEMPLATE_TYPE = (type: string) =>
		`Invalid template type: ${type}. Expected an array of strings.`,
	TARGET_ID_NOT_FOUND = (id: string) =>
		`Can't find an element with the supplied target ID: ${id}`,
	ROUTE_EXISTS = (path: string) => `Route already exists: ${path}`,
	MISSING_TEMPLATE_TARGET = 'No target specified for template rendering',
	DIRECTIVE_REQUIRES_TEMPLATE_ELEMENT =
		'Directives can only be used on template elements.',
	TEMPLATE_REQUIRES_ROUTE =
		'x-template must be used on the same element as x-route.',
	TEMPLATE_WITH_CHILD =
		'x-template cannot be used alongside an inline template (template element should not have a child).',
	HANDLER_REQUIRES_ROUTE =
		'x-handler must be set on the same element as x-route, or on any element with the modifier .global.',
	ROUTE_WITH_HASH = "A route's path may not have a hash character.",
	TARGET_ID_NOT_SPECIFIED =
		'templateTargetId must be specified for programmatically added templates.',
	INVALID_HANDLER_TYPE = (type: string) => `Invalid handler type: ${type}.`,
	TEMPLATE_PARAM_NOT_FOUND = (param: string, url: string) =>
		`The param ${param} in the template url ${url} does not exist.` as const

// Custom error class for Pinecone Router
export class PineconeRouterError extends Error {
	constructor(message: string) {
		super('Pinecone Router Error: ' + message)
		this.name = 'PineconeRouterError'
		Object.setPrototypeOf(this, PineconeRouterError.prototype)
	}
}
