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
	 * Set to false if you don't want to intercept link clicks by default.
	 * @default true
	 */
	handleClicks: boolean

	/**
	 * Handlers that will run on every route.
	 * @default []
	 */
	globalHandlers: Handler<unknown, unknown>[]

	/**
	 * Set to true to preload all templates.
	 * @default false
	 * */
	preload: boolean
}

export let settings: Settings = {
	hash: false,
	basePath: '',
	globalHandlers: [],
	handleClicks: true,
	targetID: undefined,
	preload: false,
}

export const updateSettings = (value?: Partial<Settings>): Settings => {
	settings = { ...settings, ...value }
	return settings
}
