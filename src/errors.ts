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
	DIRECTIVE_REQUIRES_ROUTE = (directive: string) =>
		`x-${directive} must be used on the same element as x-route.`,
	TEMPLATE_WITH_CHILD =
		'x-template cannot be used alongside an inline template (template element should not have a child).',
	TARGET_ID_NOT_SPECIFIED =
		'templateTargetId must be specified for programmatically added templates.',
	INVALID_HANDLER_TYPE = (type: string) => `Invalid handler type: ${type}.`,
	ROUTE_NOT_FOUND = (path: string) => `Path: ${path} was not found.`,
	TEMPLATE_PARAM_NOT_FOUND = (param: string, url: string) =>
		`The param ${param} in the template url ${url} does not exist.` as const

// Custom error class for Pinecone Router
export class PineconeRouterError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'PineconeRouterError'
		Object.setPrototypeOf(this, PineconeRouterError.prototype)
	}
}
