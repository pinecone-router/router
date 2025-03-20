import { type Route } from './route'

export const buildContext = (
	route: Route,
	path: string,
	navigationStack: string[],
	navigationIndex: number,
): Context => ({
	route,
	path,
	params: route.params,
	query: window.location.search.substring(1), // query w/out leading '?'
	hash: window.location.hash.substring(1), // hash without leading '#'
	navigationStack,
	navigationIndex,
})

export declare type Context = {
	route?: Route
	path: string
	params: Record<string, string>
	query: string // query without leading '?'
	hash: string // hash without leading '#'
	navigationStack: string[]
	navigationIndex: number
}
