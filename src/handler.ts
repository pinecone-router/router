import { Context } from './context'
import { Route } from './route'
/**
 * Handler type takes the In and Out parameter.
 *
 * In is the value of the previous handler, which will be inside
 * `HandlerContext.data`.
 *
 * Out is the return value of the handler.
 */
export type Handler<In, Out> = (
	context: HandlerContext<In>,
	controller: AbortController
) => Out | Promise<Out>

/**
 * HandlerContext is the context passed to the handler.
 * It contains the current route and the data from the previous handler.
 */
export interface HandlerContext<T = unknown> extends Context {
	readonly data: T
}

/**
 * Execute route handlers sequentially, with cancellation support
 * @param handlers handlers to execute
 * @param context current context
 * @param controller abort controller
 * @returns {Promise<void>}
 */
export async function handle(
	handlers: Route['handlers'],
	context: Context,
	controller: AbortController
): Promise<void> {
	let data: unknown
	// Return a promise that rejects when aborted
	return new Promise<void>(async (resolve, reject) => {
		controller.signal.addEventListener('abort', () => reject())
		for (const handler of handlers) {
			// Check if aborted before running each handler
			if (controller.signal.aborted) return
			const ctx = { ...context, data } as HandlerContext<
				Parameters<typeof handler>[0]
			>
			try {
				data = await handler(ctx, controller)
			} catch (e) {
				reject(e)
			}
		}
		resolve()
	})
}
