import { ElementWithXAttributes } from 'alpinejs'
import { RouteTemplate } from './directives/x-route'

/**
 * Centralized error messages
 */

export const INVALID_EXPRESSION_TYPE = (value: unknown) =>
		`Invalid expression type. Expression: ${value}.`,
	TARGET_ID_NOT_FOUND = (id: string) =>
		`Can't find an element with the supplied target ID: ${id}`,
	ROUTE_EXISTS = (path: string) => `Route already exists: ${path}`,
	MISSING_TEMPLATE_TARGET = 'No target specified for template rendering',
	DIRECTIVE_REQUIRES_TEMPLATE =
		'Directives can only be used on template elements.',
	DIRECTIVE_REQUIRES_ROUTE = (directive: string) =>
		`x-${directive} must be used on the same template as x-route.`,
	TARGET_ID_NOT_SPECIFIED =
		'targetID must be specified for programmatically added templates.',
	ROUTE_NOT_FOUND = (path: string) => `Path: ${path} was not found.`,
	TEMPLATE_PARAM_NOT_FOUND = (param: string, url: string) =>
		`The param ${param} in the template url ${url} does not exist.` as const

/**
 * Assert functions
 */

/**
 * Assert that the element is a template element with XAttributes
 * @param value HTMLElement
 */
export function assertTemplate(
	value: ElementWithXAttributes<HTMLElement>
): asserts value is ElementWithXAttributes<HTMLTemplateElement> {
	if (value.tagName.toLowerCase() !== 'template') {
		throw new TypeError(DIRECTIVE_REQUIRES_TEMPLATE)
	}
}

/**
 * Assert that the element is a template element with XAttributes and a route attribute
 * @param value {ElementWithXAttributes<HTMLElement>} The element to check
 */
export function assertRouteTemplate(
	value: ElementWithXAttributes<HTMLElement>
): asserts value is RouteTemplate & { _x_PineconeRouter_route: string } {
	assertTemplate(value)

	if (value._x_PineconeRouter_route === undefined) {
		throw new TypeError(DIRECTIVE_REQUIRES_ROUTE('template'))
	}
}

/**
 * Assert that the element is a template element with XAttributes and a route attribute
 * @param value {unknown} The evaluated expression to check
 */
export function assertExpressionIsArray(
	value: unknown
): asserts value is unknown[] {
	if (typeof value != 'object' || !Array.isArray(value)) {
		throw new TypeError(INVALID_EXPRESSION_TYPE(value))
	}
}
