import { type NavigationHistory } from './history';
import { type Route, type RouteOptions } from './route';
import { type Settings } from './settings';
import { type Context } from './context';
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
export declare const createPineconeRouter: (name: string, version: string) => PineconeRouter;
//# sourceMappingURL=router.d.ts.map