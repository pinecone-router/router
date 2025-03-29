import { type Route } from './route'

export const buildContext = (
	path: string,
	{
		route,
		params,
	}: {
		route: Route
		params: Context['params']
	}
): Context => ({
	path,
	route,
	params,
})

export interface Context {
	readonly path: string
	readonly route: Route
	readonly params: Record<string, string | undefined>
}
