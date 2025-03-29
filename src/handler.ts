import { type Context } from './context'

export type Handler = (
	context: Context,
	result: typeof HandlerResult
) => HandlerResult | void | Promise<HandlerResult | void>

export enum HandlerResult {
	HALT,
	CONTINUE,
}

export const handlerState = {
	cancel: false,
	done: false,
}

export const abortController = new AbortController()

/**
 * Execute route handlers sequentially, with cancellation support
 * @param {Handler[]} handlers handlers to execute
 * @param {Context} context current context
 * @returns {Promise<HandlerResult>} CONTINUE if all handlers completed,
 *                                   HALT otherwise.
 */
export async function handle(
	handlers: Handler[],
	context: Context
): Promise<HandlerResult> {
	handlerState.done = false
	handlerState.cancel = false

	for (const handler of handlers) {
		if (handlerState.cancel) {
			handlerState.cancel = false
			return HandlerResult.HALT
		}

		// Execute handler (with await if async)
		const result =
			handler.constructor.name === 'AsyncFunction'
				? await handler(context, HandlerResult)
				: handler(context, HandlerResult)

		// Stop execution if handler returned HALT
		if (result === HandlerResult.HALT) {
			return result
		}
	}

	if (!handlerState.cancel) {
		handlerState.done = true
		return HandlerResult.CONTINUE
	}

	return HandlerResult.HALT
}
