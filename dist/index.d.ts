declare module "templates" {
    import { type ElementWithXAttributes, type Alpine } from 'alpinejs';
    import { type PineconeRouter } from "router";
    import { Context } from "context";
    export const fetchError: (error: string, url: string) => void;
    export const make: (Alpine: Alpine, template: ElementWithXAttributes<HTMLTemplateElement>, expression: string, // the expression on the x-template directive
    targetEl?: HTMLElement, urls?: string[]) => void;
    export const hide: (template: ElementWithXAttributes<HTMLTemplateElement>) => void;
    export const show: (Alpine: Alpine, Router: PineconeRouter, template: ElementWithXAttributes<HTMLTemplateElement>, expression: string, urls?: Array<string>, targetEl?: HTMLElement) => void;
    export const interpolate: (urls: string[], params: Context["params"]) => string[];
    export const preload: (urls: string[]) => void;
    /**
     * Load templates from urls into an element
     * @param urls array of urls to load
     * @param el target element where to put the content of the urls
     * @returns Promise<string> the new innerHTML of the target element
     */
    export const load: (urls: string[], el: HTMLTemplateElement | HTMLElement) => Promise<string>;
}
declare module "errors" {
    /**
     * Centralized error messages for Pinecone Router
     */
    export const INVALID_TEMPLATE_TYPE: (type: string) => string, TARGET_ID_NOT_FOUND: (id: string) => string, ROUTE_EXISTS: (path: string) => string, MISSING_TEMPLATE_TARGET = "No target specified for template rendering", DIRECTIVE_REQUIRES_TEMPLATE_ELEMENT = "Directives can only be used on template elements.", DIRECTIVE_REQUIRES_ROUTE: (directive: string) => string, TEMPLATE_WITH_CHILD = "x-template cannot be used alongside an inline template (template element should not have a child).", TARGET_ID_NOT_SPECIFIED = "templateTargetId must be specified for programmatically added templates.", INVALID_HANDLER_TYPE: (type: string) => string, ROUTE_NOT_FOUND: (path: string) => string, TEMPLATE_PARAM_NOT_FOUND: (param: string, url: string) => `The param ${string} in the template url ${string} does not exist.`;
    export class PineconeRouterError extends Error {
        constructor(message: string);
    }
}
declare module "utils" {
    import { type Route } from "route";
    export const findRouteIndex: (path: string, routes: Route[]) => number;
    export const modifierValue: (modifiers: string[], key: string, fallback?: string) => string | undefined;
    export const addBasePath: (path: string, basePath: string) => string;
    export const getTargetELement: (targetId?: string, globalTargetId?: string) => HTMLElement | undefined;
    export const normalizeExpression: (expression: string) => string;
}
declare module "router" {
    import { type Route, type RouteOptions } from "route";
    import { HandlerResult, type Handler } from "handler";
    import { type Context } from "context";
    export type Settings = {
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
         * @default undefined
         * @summmary Set an optional ID for where the templates will render by default
         * This can be overriden by the .target modifier
         */
        templateTargetId?: string;
        /**
         * @default true
         * @summary Set to false if you don't want to intercept links by default.
         */
        interceptLinks: boolean;
        /**
         * @default false
         * @summary Set to true to always send loading events, even if the template is inline and there are no handlers.
         */
        alwaysSendLoadingEvents: boolean;
    };
    export interface PineconeRouter {
        version: string;
        name: string;
        notfound: Route;
        routes: Route[];
        globalHandlers: Handler[];
        cancelHandlers: boolean;
        handlersDone: boolean;
        context: Context;
        settings: Settings;
        loadStart: Event;
        loadEnd: Event;
        loading: boolean;
        /**
         * Dispatch the loadStart event
         */
        startLoading: () => void;
        /**
         * Dispatch the loadEnd event
         */
        endLoading: () => void;
        /**
         * Add a new route
         *
         * @param {string} path the path to match
         * @param {RouteOptions} options the options for the route
         * @returns {number} the index of the route in the routes array
         */
        add: (path: string, options: RouteOptions) => number;
        /**
         * Remove a route
         *
         * @param {string} path the route to remove
         */
        remove: (path: string) => void;
        /**
         * Redirect to a specified path
         * This prevent the execution of subsequent handlers if returned inside a handler.
         *
         * @param {string} path - The path to navigate to
         * @returns {HandlerResult.HALT} HandlerResult.HALT
         */
        redirect: (path: string) => HandlerResult.HALT;
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
         *  Navigate to the specified path
         *
         * @param {string} path the path with no hash even if using hash routing
         * @param {boolean} fromPopState this will be set to true if called from window.onpopstate event
         * @param {boolean} firstLoad this will be set to true if this is the first page loaded, also from page reload
         * @param {number} navigationIndex the index of the navigation stack to go to
         */
        navigate: (path: string, fromPopState?: boolean, firstLoad?: boolean, navigationIndex?: number) => Promise<void>;
    }
    export const createPineconeRouter: (version: string) => PineconeRouter;
}
declare module "handler" {
    import { type Context } from "context";
    import { type PineconeRouter } from "router";
    export type Handler = (context: Context) => HandlerResult | void;
    export enum HandlerResult {
        HALT = 0,
        CONTINUE = 1
    }
    /**
     * Execute route handlers sequentially, with cancellation support
     * @param {PineconeRouter} Router - Router instance
     * @param {Handler[]} handlers - Handlers to execute
     * @param {Context} context - Current routing context
     * @returns {Promise<HandlerResult>} - CONTINUE if all handlers completed, HALT otherwise
     */
    export function handle(Router: PineconeRouter, handlers: Handler[], context: Context): Promise<HandlerResult>;
}
declare module "route" {
    import { Context } from "context";
    import type { Handler } from "handler";
    export type Route = {
        match: (path: string) => MatchResult;
        programmaticTemplates: boolean;
        templateTargetId: string;
        handlers: Handler[];
        templates: string[];
        preload: boolean;
        pattern?: RegExp;
        path: string;
    };
    export type MatchResult = {
        match: boolean;
        params?: Context['params'];
    };
    export type RouteOptions = {
        templateTargetId?: string;
        handlers?: Handler[];
        templates?: string[];
        preload?: boolean;
    };
    /**
     * Creates a new Route object
     * @param {string} path - route path pattern
     * @param {RouteOptions} options - route configuration options
     * @returns {Route} - a route object
     */
    export default function createRoute(path: string, { templateTargetId, templates, handlers, preload, }?: RouteOptions): Route;
}
declare module "context" {
    import { type Route } from "route";
    export const buildContext: (path: string, { route, params, navigationIndex, navigationStack, }: {
        route: Route;
        params: Context["params"];
        navigationIndex: number;
        navigationStack: string[];
    }) => Context;
    export type Context = {
        path: string;
        route: Route;
        params: Record<string, string | undefined>;
        query: string;
        hash: string;
        navigationIndex: number;
        navigationStack: string[];
    };
}
declare module "directives/x-template" {
    import { type Alpine } from 'alpinejs';
    import { PineconeRouter } from "router";
    export const TemplateDirective: (Alpine: Alpine, Router: PineconeRouter) => void;
}
declare module "directives/x-handler" {
    import { type Alpine } from 'alpinejs';
    import { PineconeRouter } from "router";
    export const HandlerDirective: (Alpine: Alpine, Router: PineconeRouter) => void;
}
declare module "directives/x-route" {
    import { type Alpine } from 'alpinejs';
    import { PineconeRouter } from "router";
    export const RouteDirective: (Alpine: Alpine, Router: PineconeRouter) => void;
}
declare module "links" {
    import { type PineconeRouter } from "router";
    /**
     * @description Add a handler to click events on all valid links
     */
    export const interceptLinks: (Router: PineconeRouter) => void;
}
declare module "index" {
    import { type PluginCallback, type Alpine } from 'alpinejs';
    import { type PineconeRouter } from "router";
    import { type Context } from "context";
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
            $params: Context['params'];
        }
        interface Magics<T> {
            $router: PineconeRouter;
            $params: Context['params'];
        }
    }
    const PineconeRouterPlugin: PluginCallback;
    export default PineconeRouterPlugin;
}
declare module "route.test" { }
declare module "router.test" { }
declare module "templates.test" { }
//# sourceMappingURL=index.d.ts.map