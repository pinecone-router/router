import type { Handler } from './handler';
export interface Settings {
    /**
     * enable hash routing
     * @default false: boolean
     */
    hash: boolean;
    /**
     * The base path of the site, for example /blog.
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
    /**
     * The options object to be passed to fetch requests (second argument)
     * excluding `priority` which is set by the router.
     */
    fetchOptions: RequestInit;
    /**
     * Set to false to disable calling history.pushState().
     * This means that the url wont change when navigating.
     * @default true
     */
    pushState: boolean;
}
export declare let settings: Settings;
export declare const updateSettings: (value?: Partial<Settings>) => Settings;
//# sourceMappingURL=settings.d.ts.map