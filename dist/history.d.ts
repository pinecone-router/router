import { type PineconeRouter } from './router';
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
export declare const createNavigationHistory: () => NavigationHistory;
//# sourceMappingURL=history.d.ts.map