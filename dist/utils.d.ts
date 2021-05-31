import type { Alpine, ComponentController } from "@leanadmin/alpine-typescript";
import PineconeRouter from ".";
import Route from "./route";
/**
 * Create the context object
 */
export declare function buildContext(route: string, path: string, params: {}): Context;
/**
 * check if a path match with this route
 * taken from preact-router
 * https://github.com/preactjs/preact-router
 * @param path {string}
 * @param routePath {string}
 * @returns {false|object}
 */
export declare function match(url: string, routePath: string): false | object;
/**
 * Call a function on all middlewares loaded, if any.
 * @param {string} func middleware function to call.
 * @param {any} args arguments to pass to the function.
 * @returns {boolean} false if the middleware function return false, i.e. it want to stop execution of the function and return.
 */
export declare function middleware(func: string, ...args: any): string | undefined;
/**
 * @param {any} expression the expression to eval
 * @param {object} dataContext the alpine component data object
 * @param {object} additionalHelperVariables
 * @returns
 */
export declare function saferEval(expression: any, dataContext: object, additionalHelperVariables?: object): any;
/**
 * execute the handlers of routes that are given passing them the context.
 * @param {array} handlers handlers to execute.
 * @param {object} context the current context to pass as argument.
 * @returns {boolean} false if the handler request a redirect.
 */
export declare function handle(handlers: Array<Function>, context: object): boolean;
/**
 * Check if `href` is the same origin.
 * https://github.com/visionmedia/page.js/blob/4f9991658f9b9e3de9b6059bade93693af24d6bd/page.js#L888
 */
export declare function sameOrigin(href: string): boolean;
export declare function samePath(url: any): boolean;
declare global {
    interface Window {
        Alpine: Alpine;
        deferLoadingAlpine: any;
        PineconeRouter: typeof PineconeRouter;
        PineconeRouterMiddlewares: Array<Object>;
    }
}
export declare type Context = {
    route: string;
    path: string;
    params: object;
    query: string;
    hash: string;
    redirect: (path: string) => string;
};
export declare interface Settings {
    /**
     * @default false
     * @summary enable hash routing
     */
    hash: boolean;
    /**
     * @default `/`
     * @summary The base path of the site, for example /blog
     * Note: do not use with using hash routing!
     */
    basePath: string;
    /**
     * @default false
     * @summary when true it wont throw an error when the handler of a route is not specified.
     */
    allowNoHandler: boolean;
    /**
     * @default []
     * @summmary array of middlewares
     */
    middlewares: Middleware[];
}
export declare type Handler = ((context: Context) => any)[];
export declare interface Middleware {
    name: string;
    version?: string;
    settings?: {
        [key: string]: any;
    };
    /**
     * This will be called at router initialization.
     * used for detecting router settings.
     */
    init?: (component: ComponentController, settings: Settings) => void;
    /**
     * Called for each route during initialization,
     * before the route is processed & added.
     * @param {HTMLTemplateElement} el the route's <template> element
     * @param {ComponentController} component the router's alpine component
     * @param {string} path the route's path
     */
    onBeforeRouteProcessed?: (el: Element, component: ComponentController, path: string) => void;
    /**
     * Will be called before the handlers are executed.
     * during navigation (PineconeRouter.navigate()).
     * @param {object} route the matched route, undefined if not found.
     * @param {string} path the path visited by the client
     * @param {boolean} firstload first page load and not link navigation request
     * @returns {'stop'|null} 'stop' to make the navigate function exit (make sure to send the loadend event); none to continute execution.
     */
    onBeforeHandlersExecuted?: (route: Route, path: string, firstload: boolean) => 'stop' | void;
    /**
     * Will be called after the handlers are executed and done.
     * during navigation (PineconeRouter.navigate()).
     * @param {object} route the matched route, undefined if not found.
     * @param {string} path the path visited by the client
     * @param {boolean} firstload first page load and not link navigation request
     * @returns {'stop'|null} 'stop' to make the navigate function exit (make sure to send the loadend event); none to continute execution.
     */
    onHandlersExecuted?: (route: Route, path: string, firstload: boolean) => 'stop' | void;
    [key: string]: any;
}
