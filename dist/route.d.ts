import type { Handler } from './handler';
export interface Route {
    /**
     * Set to true automatically when creating a route programmatically.
     * @internal
     */
    readonly programmaticTemplates: boolean;
    /**
     * Set to true when the route is added programmatically and defined as having
     * params in the template urls
     * @internal
     */
    readonly interpolate: boolean;
    /**
     * The regex pattern used to match the route.
     * @internal
     */
    readonly pattern: RegExp;
    /**
     * The target ID for the route's templates
     */
    readonly targetID?: string;
    /**
     * The raw route path
     */
    readonly path: string;
    match(path: string): undefined | {
        [key: string]: string;
    };
    handlers: Handler<unknown, unknown>[];
    templates: string[];
}
export interface RouteOptions {
    handlers?: Route['handlers'];
    interpolate?: boolean;
    templates?: string[];
    targetID?: string;
    preload?: boolean;
}
export type MatchResult = undefined | {
    [key: string]: string;
};
/**
 * Creates a new Route object
 * @param {string} path - route path pattern
 * @param {RouteOptions} options - route configuration options
 * @returns {Route} - a route object
 */
export declare const createRoute: (path: string, { targetID, templates, handlers, interpolate, }?: RouteOptions) => Route;
/**
 * @param {string} input The route pattern
 * @returns {RegExp} The compiled regular expression for the route
 */
export declare function parse(input: string): RegExp;
export default createRoute;
//# sourceMappingURL=route.d.ts.map