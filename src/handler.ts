import { type Context } from './context'
import { type PineconeRouter } from './router'

export type Handler = (context: Context) => HandlerResult | void

export enum HandlerResult {
	HALT,
	CONTINUE,
}

/**
 * Execute route handlers sequentially, with cancellation support
 * @param {PineconeRouter} Router - Router instance
 * @param {Handler[]} handlers - Handlers to execute
 * @param {Context} context - Current routing context
 * @returns {Promise<HandlerResult>} - CONTINUE if all handlers completed, HALT otherwise
 */
export async function handle(
	Router: PineconeRouter,
	handlers: Handler[],
	context: Context,
): Promise<HandlerResult> {
	Router.handlersDone = false
	Router.cancelHandlers = false

	for (const handler of handlers) {
		if (Router.cancelHandlers) {
			Router.cancelHandlers = false
			return HandlerResult.HALT
		}

		// Execute handler (with await if async)
		const result =
			handler.constructor.name === 'AsyncFunction'
				? await handler(context)
				: handler(context)

		// Stop execution if handler returned HALT
		if (result === HandlerResult.HALT) {
			return HandlerResult.HALT
		}
	}

	if (!Router.cancelHandlers) {
		Router.handlersDone = true
		return HandlerResult.CONTINUE
	}

	return HandlerResult.HALT
}
