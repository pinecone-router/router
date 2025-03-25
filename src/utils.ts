import { TARGET_ID_NOT_FOUND, PineconeRouterError } from './errors'
import { type Route } from './route'

export const findRouteIndex = (path: string, routes: Route[]) =>
	routes.findIndex((r) => r.path == path)

export const modifierValue = (
	modifiers: string[],
	key: string,
	fallback?: string,
): string | undefined => {
	// If the modifier isn't present, use the default.
	if (modifiers.indexOf(key) === -1) return fallback

	// If it IS present, grab the value after it
	const rawValue = modifiers[modifiers.indexOf(key) + 1]

	if (!rawValue) return fallback

	if (key === 'target') {
		let match = rawValue.match(/([a-z0-9_-]+)/)
		if (match) return match[1]
	}
	return rawValue
}

export const addBasePath = (path: string, basePath: string) => {
	if (basePath != '/' && !path.startsWith(basePath)) {
		path = basePath + path
	}
	if (path == basePath && !path.endsWith('/')) {
		path += '/'
	}
	return path
}

export const getTargetELement = (
	targetId?: string,
	globalTargetId?: string,
): HTMLElement | undefined => {
	let target = targetId ?? globalTargetId ?? ''
	let targetEl = document.getElementById(target)

	if (!targetEl)
		throw new PineconeRouterError(TARGET_ID_NOT_FOUND(target))

	return targetEl
}
