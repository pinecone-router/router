declare module "src/context" {
    export const buildContext: contextBuilder;
    type contextBuilder = (path: string, params: Context['params'], route: string) => Context;
    /**
     * This is the global Context object
     * Which can be accessed from `PineconeRouter.context`
     */
    export interface Context {
        readonly path: string;
        readonly route: string;
        readonly params: Record<string, string | undefined>;
    }
}
declare module "src/history" {
    import { type PineconeRouter } from "src/router";
    export interface NavigationHistory {
        /**
         * The current history index
         */
        index: number;
        /**
         * The list of history entries
         */
        entries: string[];
        /**
         * Check if the router can navigate backward
         * @returns {boolean} true if the router can go back
         */
        canGoBack: () => boolean;
        /**
         * Go back to the previous route in the navigation history
         */
        back: () => void;
        /**
         * Check if the router can navigate forward
         *
         * @returns {boolean} true if the router can go forward
         */
        canGoForward: () => boolean;
        /**
         * Go to the next route in the navigation history
         */
        forward: () => void;
        /**
         * Navigate to a specific position in the navigation history
         *
         * @param index The index of the navigation position to navigate to
         * @returns void
         */
        to: (index: number) => void;
        /**
         * Push a new path to the history at the current index.
         * @internal
         * @param path The path to add to the history
         * @param pushState Whether or not to call History.pushState.
         *        Will be set to false if it's the first load or if it's called from
         *        a popstate event.
         * @param hash Whether or not we're using hash routing
         * @returns void
         */
        push: (path: string, pushState: boolean, hash?: boolean) => void;
        /**
         * Call History.pushState
         * @internal
         * @param path The path to add to the history
         * @param hash Whether or not we're using hash routing
         * @returns void
         */
        pushState: (path: string, hash?: boolean) => void;
        /**
         * The router instance
         * @internal
         */
        router?: PineconeRouter;
        /**
         * Set the router instance
         * @internal
         * @param router The router instance to set
         */
        setRouter: (router: PineconeRouter) => void;
    }
    export const createNavigationHistory: () => NavigationHistory;
}
declare module "src/handler" {
    import { Context } from "src/context";
    import { Route } from "src/route";
    /**
     * Handler type takes the In and Out parameters.
     *
     * @param In  is the value of the previous handler, which will be inside
     * `HandlerContext.data`.
     * @param Out is the return value of the handler.
     */
    export type Handler<In, Out> = (context: HandlerContext<In>, controller: AbortController) => Out | Promise<Out>;
    /**
     * HandlerContext is the context passed to the handler.
     * It contains the current route and the data from the previous handler.
     */
    export interface HandlerContext<T = unknown> extends Context {
        readonly data: T;
    }
    /**
     * Execute route handlers sequentially, with cancellation support
     * @param handlers handlers to execute
     * @param context current context
     * @param controller abort controller
     * @returns {Promise<void>}
     */
    export function handle(handlers: Route['handlers'], context: Context, controller: AbortController): Promise<void>;
}
declare module "src/route" {
    import type { Handler } from "src/handler";
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
    export const createRoute: (path: string, { targetID, templates, handlers, interpolate, }?: RouteOptions) => Route;
    /**
     * @param {string} input The route pattern
     * @returns {RegExp} The compiled regular expression for the route
     */
    export function parse(input: string): RegExp;
    export default createRoute;
}
declare module "src/settings" {
    import type { Handler } from "src/handler";
    export interface Settings {
        /**
         * enable hash routing
         * @default false: boolean
         */
        hash: boolean;
        /**
         * The base path of the site, for example /blog.
         * No effect with hash routing.
         * @default ``
         */
        basePath: string;
        /**
         * Set an optional ID for where the templates will render by default.
         * This can be overridden by the .target modifier.
         * @default undefined
         */
        targetID?: string;
        /**
         * Set to false if you don't want to intercept link clicks by default.
         * @default true
         */
        handleClicks: boolean;
        /**
         * Handlers that will run on every route.
         * @default []
         */
        globalHandlers: Handler<unknown, unknown>[];
        /**
         * Set to true to preload all templates.
         * @default false
         * */
        preload: boolean;
    }
    export let settings: Settings;
    export const updateSettings: (value?: Partial<Settings>) => Settings;
}
declare module "src/utils" {
    export const modifierValue: (modifiers: string[], key: string, fallback?: string) => string | undefined;
    /**
     *
     * @param path
     * @param basePath
     * @returns
     */
    export const addBasePath: (path: string, basePath: string) => string;
    export const isArrayExpression: (expression: string) => boolean;
    export const getTargetELement: (targetId?: string, globalTargetId?: string) => HTMLElement | undefined;
}
declare module "src/templates" {
    import { type ElementWithXAttributes, type Alpine } from 'alpinejs';
    import { type Context } from "src/context";
    export const fetchError: (error: string, url: string) => void;
    /**
     * Creates a unique instance of a template with the given expression and target element.
     * @param Alpine Alpine.js instance
     * @param template The template element to be processed.
     * @param expression The expression on the x-template directive.
     * @param targetEl The target element where the template will be rendered.
     * @param urls Template urls
     * @returns void
     */
    export const make: (Alpine: Alpine, template: ElementWithXAttributes<HTMLTemplateElement>, expression: string, // the expression on the x-template directive
    targetEl?: HTMLElement, // the target element where the template will
    urls?: string[]) => void;
    export const hide: (template: ElementWithXAttributes<HTMLTemplateElement>) => void;
    export const show: (Alpine: Alpine, template: ElementWithXAttributes<HTMLTemplateElement>, expression: string, urls?: Array<string>, targetEl?: HTMLElement) => Promise<void>;
    /**
     * Interpolates params in URLs.
     * @param urls Array of template URLs.
     * @param params Object containing params to inject into URLs.
     * @returns Array of interpolated URLs.
     */
    export const interpolate: (urls: string[], params: Context["params"]) => string[];
    /**
     * Load a template from a url and cache its content.
     * @param url Template URL.
     * @param priority Request priority ('high' | 'low'), default: 'high'.
     * @returns {Promise<string>} A promise that resolves to the content of
     * the template as a string.
     */
    export const loadUrl: (url: string, priority?: RequestPriority) => Promise<string>;
    /**
     * Add urls to the preload queue
     * @param urls Array of template URLs to preload
     * @param el Optional target element where to put the content of the urls
     * @returns void
     */
    export const preload: (urls: string[], el?: HTMLElement) => void;
    /**
     * Load all preloaded templates and removes them from the queue.
     * It is called when the router is initialized and the first page
     * finishes loading.
     * @returns void
     */
    export const runPreloads: () => void;
    /**
     * Load templates from urls and puts the content the el.innerHTML.
     * @param urls array of urls to load.
     * @param el target element where to put the content of the urls.
     * @param priority Request priority ('high' | 'low'), default: 'high'.
     * @returns {Promise<void>}
     */
    export const load: (urls: string[], el: HTMLTemplateElement | HTMLElement, priority?: RequestPriority) => Promise<void>;
}
declare module "src/router" {
    import { type NavigationHistory } from "src/history";
    import { type Route, type RouteOptions } from "src/route";
    import { type Settings } from "src/settings";
    import { type Context } from "src/context";
    export type RoutesMap = Map<string, Route> & {
        get(key: 'notfound'): Route;
    };
    export interface PineconeRouter {
        readonly name: string;
        readonly version: string;
        routes: RoutesMap;
        context: Context;
        settings: (value?: Partial<Settings>) => Settings;
        history: NavigationHistory;
        loading: boolean;
        /**
         * Add a new route
         *
         * @param {string} path the path to match
         * @param {RouteOptions} options the options for the route
         */
        add: (path: string, options: RouteOptions) => void;
        /**
         * Remove a route
         *
         * @param {string} path the route to remove
         */
        remove: (path: string) => void;
        /**
         *  Navigate to the specified path
         *
         * @param {string} path the path with no hash even if using hash routing
         * @param {boolean} fromPopState INTERNAL Is set to true when called from
         *                  onpopstate event
         * @param {boolean} firstLoad INTERNAL Is set to true on browser page load.
         * @param {number} index INTERNAL the index of the navigation history
         *                  that was navigated to.
         * @returns {Promise<void>}
         */
        navigate: (path: string, fromPopState?: boolean, firstLoad?: boolean, index?: number) => Promise<void>;
    }
    export const createPineconeRouter: (name: string, version: string) => PineconeRouter;
}
declare module "src/directives/x-route" {
    import { type ElementWithXAttributes, type Alpine } from 'alpinejs';
    import { PineconeRouter } from "src/router";
    export interface RouteTemplate extends ElementWithXAttributes<HTMLTemplateElement> {
        _x_PineconeRouter_route: string;
    }
    const RouteDirective: (Alpine: Alpine, Router: PineconeRouter) => void;
    export default RouteDirective;
}
declare module "src/errors" {
    import { type ElementWithXAttributes } from 'alpinejs';
    import { type RouteTemplate } from "src/directives/x-route";
    /**
     * Centralized error messages
     */
    export const INVALID_EXPRESSION_TYPE: (value: unknown) => string, TARGET_ID_NOT_FOUND: (id: string) => string, ROUTE_EXISTS: (path: string) => string, DIRECTIVE_REQUIRES_TEMPLATE = "Directives can only be used on template elements.", DIRECTIVE_REQUIRES_ROUTE: (directive: string) => string, TARGET_ID_NOT_SPECIFIED = "targetID must be specified for programmatically added templates", ROUTE_NOT_FOUND: (path: string) => string;
    /**
     * Assert functions
     */
    /**
     * Assert that the element is a template element with XAttributes
     * @param value HTMLElement
     */
    export function assertTemplate(value: ElementWithXAttributes<HTMLElement>): asserts value is ElementWithXAttributes<HTMLTemplateElement>;
    /**
     * Assert that the element is a template element with XAttributes
     * and a route attribute
     * @param value {ElementWithXAttributes<HTMLElement>} The element to check
     */
    export function assertRouteTemplate(value: ElementWithXAttributes<HTMLElement>): asserts value is RouteTemplate & {
        _x_PineconeRouter_route: string;
    };
    /**
     * Assert that the element is an array
     * @param value {unknown} The evaluated expression to check
     */
    export function assertExpressionIsArray(value: unknown): asserts value is unknown[];
}
declare module "src/directives/x-template" {
    import { type Alpine } from 'alpinejs';
    import { PineconeRouter } from "src/router";
    const TemplateDirective: (Alpine: Alpine, Router: PineconeRouter) => void;
    export default TemplateDirective;
}
declare module "src/directives/x-handler" {
    import { type Alpine } from 'alpinejs';
    import { PineconeRouter } from "src/router";
    const HandlerDirective: (Alpine: Alpine, Router: PineconeRouter) => void;
    export default HandlerDirective;
}
declare module "src/links" {
    import { type PineconeRouter } from "src/router";
    /**
     * Add a handler to click events on valid links
     */
    export const handleClicks: (Router: PineconeRouter) => void;
}
declare module "src/index" {
    import { type PluginCallback } from 'alpinejs';
    import { type PineconeRouter } from "src/router";
    import { type NavigationHistory } from "src/history";
    import { type Context } from "src/context";
    global {
        interface Window {
            PineconeRouter: PineconeRouter;
        }
    }
    module 'alpinejs' {
        interface XAttributes {
            _x_PineconeRouter_templateUrls: string[];
            _x_PineconeRouter_template: HTMLElement[];
            _x_PineconeRouter_scripts: HTMLScriptElement[];
            _x_PineconeRouter_undoTemplate: () => void;
            _x_PineconeRouter_route: string;
        }
        interface Magics<T> {
            $router: PineconeRouter;
            $stack: NavigationHistory;
            $params: Context['params'];
        }
        interface Alpine {
            $router: PineconeRouter;
        }
    }
    const PineconeRouterPlugin: PluginCallback;
    export default PineconeRouterPlugin;
}
declare module "src/route.test" { }
declare module "src/router.test" { }
declare module "src/templates.test" { }
//# sourceMappingURL=index.d.ts.map