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
}
export declare const createNavigationHistory: () => NavigationHistory;
//# sourceMappingURL=history.d.ts.map