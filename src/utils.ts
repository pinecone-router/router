import { TARGET_ID_NOT_FOUND } from './errors'
import { settings } from './settings'

export const modifierValue = (
	modifiers: string[],
	key: string,
	fallback?: string
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

/**
 *
 * @param path
 */
export const addBasePath = (path: string): string => {
	if (path == 'notfound') return path

	if (!path.startsWith(settings.basePath)) {
		path = settings.basePath + path
	}

	return path
}

export const isArrayExpression = (expression: string): boolean => {
	// Ensure the expression is a valid string and check for array-like patterns
	return /^\[.*\]$|^Array\(.*\)$/.test(expression.trim())
}

export const getTargetELement = (
	targetId?: string,
	globalTargetId?: string
): HTMLElement | undefined => {
	let target = targetId ?? globalTargetId ?? ''
	let targetEl = document.getElementById(target)

	if (target && !targetEl) throw new ReferenceError(TARGET_ID_NOT_FOUND(target))

	return targetEl ?? undefined
}
