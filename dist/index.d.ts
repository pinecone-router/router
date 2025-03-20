declare module "handler" {
    import { type Context } from "context";
    import Route from "route";
    export type Handler = (context: Context) => HandlerResult.HALT | void;
    export enum HandlerResult {
        HALT = 0,
        CONTINUE = 1
    }
    /**
     * execute the handlers of routes that are given passing them the context.
     * @param {Handler[]} handlers the handlers to execute
     * @param {Context} context the context object
     * @param {Route} route the route object
     * @returns {boolean} true if the handlers were executed successfully, false if one if them halted execution.
     */
    export function handle(handlers: Handler[], context: Context, route: Route): Promise<HandlerResult>;
}
declare module "route" {
    import type { Handler } from "handler";
    export default class Route {
        params: {
            [key: string]: string;
        };
        path: string;
        handlers: Handler[];
        templates: string[];
        templateTargetId: string;
        programmaticTemplates: boolean;
        handlersDone: boolean;
        cancelHandlers: boolean;
        preload: boolean;
        pattern: RegExp | string;
        constructor(path: string, { handlers, templates, templateTargetId, preload, }: {
            handlers?: Handler[];
            templates?: string[];
            templateTargetId?: string;
            preload?: boolean;
        });
        match(path: string): boolean;
    }
}
declare module "context" {
    import Route from "route";
    export const buildContext: (route: Route, path: string, params: {
        [key: string]: string;
    }, current_context: Context) => Context;
    export type Context = {
        route?: Route;
        path: string;
        params: {
            [key: string]: string;
        };
        query: string;
        hash: string;
        navigationStack: string[];
        navigationIndex: number;
    };
}
declare module "errors" {
    /**
     * Centralized error messages for Pinecone Router
     */
    export const INVALID_TEMPLATE_TYPE: (type: string) => string, TARGET_ID_NOT_FOUND: (id: string) => string, PRELOAD_WITH_INTERPOLATE = "Pinecone Router: Can't use preload and interpolate modifiers together", ROUTE_EXISTS: (path: string) => string, MISSING_TEMPLATE_TARGET = "Pinecone Router: No target specified for template rendering", FETCH_FAILED: (url: string, status: number) => string, DIRECTIVE_REQUIRES_TEMPLATE_ELEMENT = "Pinecone Router: Directives can only be used on template elements.", TEMPLATE_REQUIRES_ROUTE = "Pinecone Router: x-template must be used on the same element as x-route.", TEMPLATE_WITH_CHILD = "Pinecone Router: x-template cannot be used alongside an inline template (template element should not have a child).", HANDLER_REQUIRES_ROUTE = "Pinecone Router: x-handler must be set on the same element as x-route, or on any element with the modifier .global.", ROUTE_WITH_HASH = "Pinecone Router: A route's path may not have a hash character.", INVALID_HANDLER_TYPE: (type: string) => `Pinecone Router: Invalid handler type: ${string}.`;
    export class PineconeRouterError extends Error {
        constructor(message: string);
    }
}
declare module "middleware" {
    import Route from "route";
    import { type Settings } from "router";
    export interface Middleware {
        name: string;
        version?: string;
        settings?: {
            [key: string]: any;
        };
        /**
         * This will be called at router initialization.
         * used for detecting router settings.
         */
        init?: (settings: Settings) => void;
        /**
         * Called for each route during initialization,
         * before the route is processed & added.
         * @param {HTMLTemplateElement} el the route's <template> element
         * @param {ComponentController} component the router's alpine component
         * @param {string} path the route's path
         */
        onBeforeRouteProcessed?: (el: HTMLTemplateElement, path: string) => void;
        /**
         * Called for each route on initialization,
         * after the route is processed & added.
         * @param {HTMLTemplateElement} el the route's <template> element
         * @param {ComponentController} component the router's alpine component
         * @param {string} path the route's path
         */
        onAfterRouteProcessed?: (el: HTMLTemplateElement, path: string) => void;
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
    /**
     * Call a function on all middlewares loaded, if any.
     * @param {string} func middleware function to call.
     * @param {any} args arguments to pass to the function.
     * @returns {boolean} false if the middleware function return false, i.e. it want to stop execution of the function and return.
     */
    export function middleware(func: string, ...args: any): string | undefined;
}
declare module "templates" {
    import { type ElementWithXAttributes, type Alpine } from 'alpinejs';
    import { PineconeRouter } from "router";
    export const fetchError: (error: string) => void;
    export const make: (Alpine: Alpine, el: ElementWithXAttributes<HTMLTemplateElement>, expression: string, templateUrls?: string[], targetEl?: HTMLElement) => void;
    export const hide: (el: ElementWithXAttributes<HTMLTemplateElement>) => void;
    export const show: (Alpine: Alpine, Router: PineconeRouter, el: ElementWithXAttributes<HTMLTemplateElement>, expression: string, urls?: Array<string>, targetEl?: HTMLElement, interpolate?: boolean) => Element | undefined;
    export const load: (urls: string[], programmaticTemplates: boolean, el?: HTMLTemplateElement | HTMLElement) => Promise<string>;
}
declare module "utils" {
    import Route from "route";
    export const findRouteIndex: (path: string, routes: Route[]) => number;
    export const modifierValue: (modifiers: string[], key: string, fallback?: string) => string | undefined;
    export const addBasePath: (path: string, basePath: string) => string;
    export const getTargetELement: (targetId?: string, globalTargetId?: string) => HTMLElement | undefined;
}
declare module "router" {
    import { type Context } from "context";
    import { HandlerResult, type Handler } from "handler";
    import Route from "route";
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
    export type PineconeRouter = {
        version: string;
        name: string;
        notfound: Route;
        routes: Route[];
        globalHandlers: Handler[];
        context: Context;
        settings: Settings;
        loadStart: Event;
        loadEnd: Event;
        endEventDispatched: boolean;
        startEventDispatched: boolean;
        startLoading: () => void;
        endLoading: () => void;
        add: (path: string, options: {
            handlers?: Handler[];
            templates?: string[];
            templateTargetId?: string;
            preload?: boolean;
        }) => number;
        remove: (path: string) => void;
        redirect: (path: string) => HandlerResult.HALT;
        canGoBack: () => boolean;
        back: () => void;
        canGoForward: () => boolean;
        forward: () => void;
        navigate: (path: string, fromPopState?: boolean, firstLoad?: boolean, navigationIndex?: number) => Promise<void>;
    };
    export const createPineconeRouter: (version: string) => PineconeRouter;
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
    import { PineconeRouter } from "router";
    /**
     * @description Add a handler to click events on all valid links
     */
    export const interceptLinks: (Router: PineconeRouter) => void;
}
declare module "index" {
    import { type PluginCallback } from 'alpinejs';
    import { PineconeRouter } from "router";
    import { type Context } from "context";
    import { type Middleware } from "middleware";
    global {
        interface Window {
            PineconeRouterMiddlewares: Array<Middleware>;
            PineconeRouter: PineconeRouter;
        }
    }
    module 'alpinejs' {
        interface XAttributes {
            _x_PineconeRouter_CurrentTemplateUrls: string[];
            _x_PineconeRouter_CurrentTemplate: Element;
            _x_PineconeRouter_undoTemplate: () => void;
            _x_PineconeRouter_route: string;
        }
        interface Alpine {
            $router: PineconeRouter;
        }
        interface Magics<T> {
            $router: Context;
        }
    }
    const PineconeRouterPlugin: PluginCallback;
    export default PineconeRouterPlugin;
}
//# sourceMappingURL=index.d.ts.map