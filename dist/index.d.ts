import Route from './route';
import type { Settings, Context, Middleware } from './types';
declare const PineconeRouter: {
    version: string;
    name: string;
    viewCache: {};
    settings: Settings;
    /**
     * @description The handler for 404 pages, can be overwritten by a notfound route
     */
    notfound: Route;
    /**
     * @type Route[]
     * @summary array of routes instantiated from the Route class.
     */
    routes: Route[];
    /**
     * @type {Context}
     * @summary The context object for current path.
     */
    currentContext: Context;
    /**
     * Add a new route
     */
    add(path: string, options?: {}): void;
    /**
     * Remove a route
     */
    remove(path: string): void;
    /**
     * @event pinecone-start
     * @summary be dispatched to the window after before page start loading.
     */
    loadStart: Event;
    /**
     * @event pinecone-end
     * @summary will be dispatched to the window after the views are fetched
     */
    loadEnd: Event;
};
declare global {
    interface Window {
        PineconeRouter: typeof PineconeRouter;
        PineconeRouterMiddlewares: Array<Middleware>;
    }
}
export default function (Alpine: any): void;
/**
 * Create the context object
 */
export declare function buildContext(route: string, path: string, params: {}): Context;
export {};
//# sourceMappingURL=index.d.ts.map