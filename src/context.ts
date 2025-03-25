import { type Route } from './route'

export const buildContext = (
	path: string,
	{
		route,
		params,
		navigationIndex,
		navigationStack,
	}: {
		route: Route
		params: Context['params']
		navigationIndex: number
		navigationStack: string[]
	},
): Context => ({
	path,
	route: route,
	params: params,
	navigationIndex: navigationIndex,
	navigationStack: navigationStack,
	query: window.location.search.substring(1), // query w/out leading '?'
	hash: window.location.hash.substring(1), // hash without leading '#'
})

export declare type Context = {
	path: string
	route: Route
	params: Record<string, string | undefined>
	query: string // query without leading '?'
	hash: string // hash without leading '#'
	navigationIndex: number
	navigationStack: string[]
}
