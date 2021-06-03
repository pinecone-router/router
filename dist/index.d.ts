import type { ComponentController } from '@leanadmin/alpine-typescript';
import Route from './route';
declare const PineconeRouter: {
    name: string;
    version: string;
    /**
     * @type Route[]
     * @summary array of routes instantiated from the Route class.
     */
    routes: Route[];
    settings: Settings;
    /**
     * @type {Context}
     * @summary The context object for current path.
     */
    currentContext: Context;
    /**
     * @description The handler for 404 pages, can be overwritten by a notfound route
     */
    notfound: Route;
    /**
     * Entry point of the plugin
     */
    start(): void;
    /**
     * Take the template element of a route and the router component
     * @param {HTMLTemplateElement} el the routes HTML element, must be a template tag.
     * @param {any} component the router Alpine component
     */
    processRoute(el: HTMLTemplateElement, component: ComponentController): void;
    /**
     * Check if the anchor element point to a navigation route.
     * @param {any} el The anchor element or Event target
     * @param {boolean} hash Set to true when using hash routing
     * @returns {object} {valid: boolean, link: string}
     */
    validLink(el: any, hash: boolean): {
        valid: boolean;
        link: string;
    };
    /**
     * @description Add a handler to click events on all valid links
     */
    interceptLinks(t: any): void;
    /**
     *  Go to the specified path without reloading
     * @param {string} path the path with no hash even if using hash routing
     * @param {boolean} fromPopState this will be set to true if called from window.onpopstate event
     * @param {boolean} firstLoad this will be set to true if this is the first page loaded, also from page reload
     */
    navigate(path: string, fromPopState?: boolean, firstLoad?: boolean): void;
    /**
     * Add a new route
     */
    add(path: string, handlers: Handler[]): void;
    /**
     * Remove a route
     */
    remove(path: string): void;
};
export default PineconeRouter;
declare global {
    interface Window {
        PineconeRouter: typeof PineconeRouter;
        PineconeRouterMiddlewares: Array<Middleware>;
    }
}
export declare type Context = {
    route: string;
    path: string;
    params: {
        [key: string]: any;
    };
    /**
     * query without leading '?'
     */
    query: string;
    /**
     * hash without leading '#'
     */
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
    middlewares: {
        [key: string]: Middleware;
    };
}
export declare type Handler = (context: Context) => 'stop' | void;
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
    onBeforeRouteProcessed?: (el: HTMLTemplateElement, component: ComponentController, path: string) => void;
    /**
     * Will be called before the handlers are executed.
     * during navigation (PineconeRouter.navigate()).
     * @param {Route} route the matched route, undefined if not found.
     * @param {string} path the path visited by the client
     * @param {boolean} firstload first page load and not link navigation request
     * @returns {'stop'|null} 'stop' to make the navigate function exit (make sure to send the loadend event); none to continute execution.
     */
    onBeforeHandlersExecuted?: (route: Route, path: string, firstload: boolean) => 'stop' | void;
    /**
     * Will be called after the handlers are executed and done.
     * during navigation (PineconeRouter.navigate()).
     * @param {Route} route the matched route, undefined if not found.
     * @param {string} path the path visited by the client
     * @param {boolean} firstload first page load and not link navigation request
     * @returns {'stop'|null} 'stop' to make the navigate function exit (make sure to send the loadend event); none to continute execution.
     */
    onHandlersExecuted?: (route: Route, path: string, firstload: boolean) => 'stop' | void;
    [key: string]: any;
}
