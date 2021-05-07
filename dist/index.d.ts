import Route from './route';
declare const PineconeRouter: {
    name: string;
    version: string;
    /**
     * @type Array<Route>
     * @summary array of routes instantiated from the Route class.
     */
    routes: any[];
    settings: {
        /**
         * @type {boolean}
         * @summary enable hash routing
         */
        hash: boolean;
        /**
         * @type {string}
         * @summary The base path of the site, for example /blog
         * Note: do not use with using hash routing!
         */
        basePath: string;
        /**
         * @type {boolean}
         * @summary may be set to true by a middleware that don't need handlers like x-views.
         */
        allowNoHandler: boolean;
    };
    /**
     * @type {object}
     * @summary The context object for current path.
     */
    currentContext: {};
    /**
     * @description The handler for 404 pages, can be overwritten by a notfound route
     * @param {object} context The context object.
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
    processRoute(el: HTMLTemplateElement, component: any): void;
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
     * @param {string} path
     * @param {array} handlers array of functions
     */
    add(path: string, handlers: Array<Function>): void;
    /**
     * Remove a route
     * @param {string} path
     */
    remove(path: string): void;
};
declare global {
    interface Window {
        Alpine: any;
        deferLoadingAlpine: any;
        PineconeRouter: typeof PineconeRouter;
        PineconeRouterMiddlewares: Array<Object>;
    }
}
export default PineconeRouter;
