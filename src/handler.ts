import { type Context } from './context'
import { type Route } from './route'

export type Handler = (context: Context) => HandlerResult.HALT | void

export enum HandlerResult {
	HALT,
	CONTINUE,
}

/**
 * execute the handlers of routes that are given passing them the context.
 * @param {Handler[]} handlers the handlers to execute
 * @param {Context} context the context object
 * @param {Route} route the route object
 * @returns {boolean} true if the handlers were executed successfully, false if one if them halted execution.
 */
export async function handle(
	handlers: Handler[],
	context: Context,
	route: Route,
): Promise<HandlerResult> {
	for (let i = 0; i < handlers.length; i++) {
		if (typeof handlers[i] == 'function') {
			// stop if the handlers were canceled for example the user clicked a link

			if (route.cancelHandlers) {
				route.cancelHandlers = false
				return HandlerResult.HALT
			}
			let result
			if (handlers[i].constructor.name === 'AsyncFunction')
				result = await handlers[i](context)
			else result = handlers[i](context)
			// if the handler halted execution, return
			if (result == HandlerResult.HALT) return HandlerResult.HALT
		}
	}
	return HandlerResult.CONTINUE
}
