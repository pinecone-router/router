import type { Handler } from './handler';
export interface Route {
    /**
     * The raw route path
     */
    readonly path: string;
    /**
     * The name of the route
     */
    readonly name: string;
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
    name?: string;
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
export declare const createRoute: (path: string, { templates, handlers, name }?: RouteOptions) => Route;
/**
 * @param {string} input The route pattern
 * @returns {RegExp} The compiled regular expression for the route
 */
export declare function parse(input: string): RegExp;
export default createRoute;
//# sourceMappingURL=route.d.ts.map