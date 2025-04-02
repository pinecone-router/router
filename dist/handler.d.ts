import { Context } from './context';
import { Route } from './route';
/**
 * Handler type takes the In and Out parameters.
 *
 * @param In  is the value of the previous handler, which will be inside
 * `HandlerContext.data`.
 * @param Out is the return value of the handler.
 */
export type Handler<In, Out> = (context: HandlerContext<In>, controller: AbortController) => Out | Promise<Out>;
/**
 * HandlerContext is the context passed to the handler.
 * It contains the current route and the data from the previous handler.
 */
export interface HandlerContext<T = unknown> extends Context {
    readonly data: T;
}
/**
 * Execute route handlers sequentially, with cancellation support
 * @param handlers handlers to execute
 * @param context current context
 * @param controller abort controller
 * @returns {Promise<void>}
 */
export declare function handle(handlers: Route['handlers'], context: Context, controller: AbortController): Promise<void>;
//# sourceMappingURL=handler.d.ts.map