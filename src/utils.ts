import { Alpine, ElementWithXAttributes } from 'alpinejs'
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
	if (path == 'notfound' || settings.hash) return path

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

const runOnceRegistry = new Set<string>()

/**
 * Clone a script to make it run after checking for x-run modifiers
 * @param script The script element to clone
 * @param index The index of the script in the template
 * @param routePath The route path associated with the template
 * @param Alpine The Alpine.js instance
 * @returns A cloned script element or undefined if it shouldn't run
 */
export const reloadScript = (
	script: ElementWithXAttributes<HTMLScriptElement>,
	index: number,
	routePath: string,
	Alpine: Alpine
): ElementWithXAttributes<HTMLScriptElement> | undefined => {
	// x-run:on modifier
	// by making this check first, we would avoid adding it to the runOnceRegistry
	// when it it didn't run due to the condition.
	const runOn =
		script.getAttribute('x-run:on') || script.getAttribute('x-run.once:on')
	if (runOn && !Alpine.evaluate(script, runOn)) return

	// x-run.once modifier
	const key = script.id || routePath + index
	const runOnce =
		script.hasAttribute('x-run.once') || script.hasAttribute('x-run.once:on')
	if (runOnce) {
		if (runOnceRegistry.has(key)) return
		runOnceRegistry.add(key)
	}

	const newScript = document.createElement('script')
	Array.from(script.attributes).forEach((attr) =>
		newScript.setAttribute(attr.name, attr.value)
	)
	newScript.textContent = script.textContent
	return newScript
}
