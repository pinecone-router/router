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
 * Call a function on all middlewares loaded, if any.
 * @param {string} func middleware function to call.
 * @param {any} args arguments to pass to the function.
 * @returns {boolean} false if the middleware function return false, i.e. it want to stop execution of the function and return.
 */
export declare function middleware(func: string, ...args: any): string | undefined;
export declare function fetchError(error: string): void;
//# sourceMappingURL=utils.d.ts.map