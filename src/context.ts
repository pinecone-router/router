import { Route } from './route'

export const buildContext: contextBuilder = (path, params, route) => {
	return {
		path,
		params,
		route,
	}
}

type contextBuilder = (
	path: string,
	params: Context['params'],
	route?: Route
) => Context

/**
 * This is the global Context object
 * Which can be accessed from `PineconeRouter.context`
 */
export interface Context {
	readonly path: string
	readonly route?: Route
	readonly params: Record<string, string | undefined>
}
