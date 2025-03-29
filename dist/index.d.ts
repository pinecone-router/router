declare module "src/handler" {
    import { type Context } from "src/context";
    export type Handler = (context: Context, result: typeof HandlerResult) => HandlerResult | void | Promise<HandlerResult | void>;
    export enum HandlerResult {
        HALT = 0,
        CONTINUE = 1
    }
    export const handlerState: {
        cancel: boolean;
        done: boolean;
    };
    /**
     * Execute route handlers sequentially, with cancellation support
     * @param {Handler[]} handlers handlers to execute
     * @param {Context} context current context
     * @returns {Promise<HandlerResult>} CONTINUE if all handlers completed,
     *                                   HALT otherwise.
     */
    export function handle(handlers: Handler[], context: Context): Promise<HandlerResult>;
}
declare module "src/route" {
    import type { Handler } from "src/handler";
    export interface Route {
        /**
         * Set to true automatically when creating a route programmatically.
         */
        readonly programmaticTemplates: boolean;
        /**
         * The regex pattern used to match route params, if any.
         */
        readonly pattern?: RegExp;
        /**
         * The target ID for the route templates
         */
        readonly targetID?: string;
        /**
         * The raw route path
         */
        readonly path: string;
        handlers: Handler[];
        templates: string[];
    }
    export interface RouteOptions {
        targetID?: string;
        handlers?: Handler[];
        templates?: string[];
        preload?: boolean;
    }
    /**
     * Creates a new Route object
     * @param {string} path - route path pattern
     * @param {RouteOptions} options - route configuration options
     * @returns {Route} - a route object
     */
    export default function createRoute(path: string, { targetID, templates, handlers }?: RouteOptions): Route;
    type RouteArgs = undefined | {
        [key: string]: string;
    };
    export function match(pattern: string, path: string): RouteArgs;
}
declare module "src/context" {
    import { type Route } from "src/route";
    export const buildContext: (path: string, { route, params, }: {
        route: Route;
        params: Context["params"];
    }) => Context;
    export interface Context {
        readonly path: string;
        readonly route: Route;
        readonly params: Record<string, string | undefined>;
    }
}
declare module "src/history" {
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
         * Go back to the previous route in the navigation stack
         */
        back: () => void;
        /**
         * Check if the router can navigate forward
         *
         * @returns {boolean} true if the router can go forward
         */
        canGoForward: () => boolean;
        /**
         * Go to the next route in the navigation stack
         */
        forward: () => void;
        /**
         * Navigate to a specific position in the navigation stack
         *
         * @param index The index of the navigation position to navigate to
         * @returns void
         */
        to: (index: number) => void;
    }
    export const createNavigationHistory: () => NavigationHistory;
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
         * Note: do not use with using hash routing.
         * @default `/`
         */
        basePath: string;
        /**
         * Set an optional ID for where the templates will render by default.
         * This can be overriden by the .target modifier.
         * @default undefined
         */
        targetID?: string;
        /**
         * Set to false if you don't want to intercept links by default.
         * @default true
         */
        handleClicks: boolean;
        /**
         * Set to true to always send loading events,
         * even if the template is inline and there are no handlers.
         * @default false
         */
        alwaysLoad: boolean;
        /**
         * Handlers that will run on every route.
         * @default []
         */
        globalHandlers: Handler[];
    }
    export let settings: Settings;
    export const updateSettings: (newSettings: Partial<Settings>) => void;
}
declare module "src/utils" {
    export const modifierValue: (modifiers: string[], key: string, fallback?: string) => string | undefined;
    export const addBasePath: (path: string, basePath: string) => string;
    export const getTargetELement: (targetId?: string, globalTargetId?: string) => HTMLElement | undefined;
}
declare module "src/templates" {
    import { type ElementWithXAttributes, type Alpine } from 'alpinejs';
    import { type Context } from "src/context";
    export const fetchError: (error: string, url: string) => void;
    export const make: (Alpine: Alpine, template: ElementWithXAttributes<HTMLTemplateElement>, expression: string, // the expression on the x-template directive
    targetEl?: HTMLElement, urls?: string[]) => void;
    export const hide: (template: ElementWithXAttributes<HTMLTemplateElement>) => void;
    export const show: (Alpine: Alpine, template: ElementWithXAttributes<HTMLTemplateElement>, expression: string, urls?: Array<string>, targetEl?: HTMLElement) => void;
    export const interpolate: (urls: string[], params: Context["params"]) => string[];
    export const preload: (urls: string[]) => void;
    /**
     * Load templates from urls into an element
     * @param urls array of urls to load
     * @param el target element where to put the content of the urls
     * @returns Promise<string> the new innerHTML of the target element
     */
    export const load: (urls: string[], el: HTMLTemplateElement | HTMLElement) => Promise<void>;
}
declare module "src/router" {
    import { type Route, type RouteOptions } from "src/route";
    import { type NavigationHistory } from "src/history";
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
        settings: Settings;
        history: NavigationHistory;
        isLoading: () => boolean;
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
         *                               onpopstate event
         * @param {boolean} firstLoad INTERNAL Is set to true on browser page load.
         * @param {number} index INTERNAL the index of the navigation stack to go to
         * @returns {Promise<void>}
         */
        navigate: (path: string, fromPopState?: boolean, firstLoad?: boolean, index?: number) => Promise<void>;
    }
    export const loadingState: {
        loading: boolean;
        loadStart: Event;
        loadEnd: Event;
        startLoading: () => void;
        endLoading: () => void;
    };
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
    /**
     * Centralized error messages for Pinecone Router
     */
    import { ElementWithXAttributes } from 'alpinejs';
    import { RouteTemplate } from "src/directives/x-route";
    export const INVALID_EXPRESSION_TYPE: (value: unknown) => string, TARGET_ID_NOT_FOUND: (id: string) => string, ROUTE_EXISTS: (path: string) => string, MISSING_TEMPLATE_TARGET = "No target specified for template rendering", DIRECTIVE_REQUIRES_TEMPLATE = "Directives can only be used on template elements.", DIRECTIVE_REQUIRES_ROUTE: (directive: string) => string, TARGET_ID_NOT_SPECIFIED = "targetID must be specified for programmatically added templates.", ROUTE_NOT_FOUND: (path: string) => string, TEMPLATE_PARAM_NOT_FOUND: (param: string, url: string) => `The param ${string} in the template url ${string} does not exist.`;
    /**
     * Assert that the element is a template element with XAttributes
     * @param value HTMLElement
     */
    export function assertTemplate(value: ElementWithXAttributes<HTMLElement>): asserts value is ElementWithXAttributes<HTMLTemplateElement>;
    /**
     * Assert that the element is a template element with XAttributes and a route attribute
     * @param value {ElementWithXAttributes<HTMLElement>} The element to check
     */
    export function assertRouteTemplate(value: ElementWithXAttributes<HTMLElement>): asserts value is RouteTemplate;
    /**
     * Assert that the element is a template element with XAttributes and a route attribute
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
     * @description Add a handler to click events on valid links
     */
    export const handleClicks: (Router: PineconeRouter) => void;
}
declare module "src/index" {
    import { type PluginCallback, type Alpine } from 'alpinejs';
    import { type PineconeRouter } from "src/router";
    import { type NavigationHistory } from "src/history";
    import { type Context } from "src/context";
    global {
        interface Window {
            PineconeRouter: PineconeRouter;
            Alpine: Alpine;
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
        interface Alpine {
            $router: PineconeRouter;
            $history: NavigationHistory;
            $params: Context['params'];
        }
        interface Magics<T> {
            $router: PineconeRouter;
            $stack: NavigationHistory;
            $params: Context['params'];
        }
    }
    const PineconeRouterPlugin: PluginCallback;
    export default PineconeRouterPlugin;
}
declare module "src/route.test" { }
declare module "src/router.test" { }
declare module "src/templates.test" { }
//# sourceMappingURL=index.d.ts.map