/**
 * check if a path match with this route
 * taken from preact-router
 * https://github.com/preactjs/preact-router
 * @param path {string}
 * @param routePath {string}
 * @returns {false|object}
 */
export declare function match(url: string, routePath: string): false | object;
/**
 * Check if `href` is the same origin.
 * https://github.com/visionmedia/page.js/blob/4f9991658f9b9e3de9b6059bade93693af24d6bd/page.js#L888
 */
export declare function sameOrigin(href: string): boolean;
export declare function samePath(url: any): boolean;
/**
 * Check if the anchor element point to a navigation route.
 * @param {any} el The anchor element or Event target
 * @param {boolean} hash Set to true when using hash routing
 * @returns {object} {valid: boolean, link: string}
 */
export declare function validLink(el: any, hash: boolean): {
    valid: boolean;
    link: string;
};
/**
 * execute the handlers of routes that are given passing them the context.
 */
export declare function handle(handlers: any, context: any): boolean;
/**
 * Call a function on all middlewares loaded, if any.
 * @param {string} func middleware function to call.
 * @param {any} args arguments to pass to the function.
 * @returns {boolean} false if the middleware function return false, i.e. it want to stop execution of the function and return.
 */
export declare function middleware(func: string, ...args: any): string | undefined;
/**
 * This will replace the content fetched from `path` into `selector`.
 * The content is assumed to not be an entire html page but a chunk of it.
 */
export declare function renderContent(content: string, selector?: string): void;
//# sourceMappingURL=utils.d.ts.map