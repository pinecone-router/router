import { type ElementWithXAttributes } from 'alpinejs';
import { type RouteTemplate } from './directives/x-route';
/**
 * Centralized error messages
 */
export declare const INVALID_EXPRESSION_TYPE: (value: unknown) => string, TARGET_ID_NOT_FOUND: (id: string) => string, ROUTE_EXISTS: (path: string) => string, DIRECTIVE_REQUIRES_TEMPLATE = "Directives can only be used on template elements.", DIRECTIVE_REQUIRES_ROUTE: (directive: string) => string, ROUTE_NOT_FOUND: (path: string) => string;
/**
 * Assert functions
 */
/**
 * Assert that the element is a template element with XAttributes
 * @param value HTMLElement
 */
export declare function assertTemplate(value: ElementWithXAttributes<HTMLElement>): asserts value is ElementWithXAttributes<HTMLTemplateElement>;
/**
 * Assert that the element is a template element with XAttributes
 * and a route attribute
 * @param value {ElementWithXAttributes<HTMLElement>} The element to check
 */
export declare function assertRouteTemplate(value: ElementWithXAttributes<HTMLElement>): asserts value is RouteTemplate & {
    _x_PineconeRouter_route: string;
};
/**
 * Assert that the element is an array
 * @param value {unknown} The evaluated expression to check
 */
export declare function assertExpressionIsArray(value: unknown): asserts value is unknown[];
//# sourceMappingURL=errors.d.ts.map