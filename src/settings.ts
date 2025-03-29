import type { Handler } from './handler'

export interface Settings {
	/**
	 * enable hash routing
	 * @default false: boolean
	 */
	hash: boolean

	/**
	 * The base path of the site, for example /blog.
	 * Note: do not use with using hash routing.
	 * @default `/`
	 */
	basePath: string

	/**
	 * Set an optional ID for where the templates will render by default.
	 * This can be overriden by the .target modifier.
	 * @default undefined
	 */
	targetID?: string

	/**
	 * Set to false if you don't want to intercept links by default.
	 * @default true
	 */
	handleClicks: boolean

	/**
	 * Set to true to always send loading events,
	 * even if the template is inline and there are no handlers.
	 * @default false
	 */
	alwaysLoad: boolean

	/**
	 * Handlers that will run on every route.
	 * @default []
	 */
	globalHandlers: Handler[]
}

export let settings: Settings = {
	hash: false,
	basePath: '/',
	globalHandlers: [],
	alwaysLoad: false,
	handleClicks: true,
	targetID: undefined,
}

export const updateSettings = (newSettings: Partial<Settings>): void => {
	settings = { ...settings, ...newSettings }
}
