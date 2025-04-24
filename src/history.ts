import { type PineconeRouter } from './router'
import { settings } from './settings'

export interface NavigationHistory {
	/**
	 * The current history index
	 */
	index: number

	/**
	 * The list of history entries
	 */
	entries: string[]

	/**
	 * Check if the router can navigate backward
	 * @returns {boolean} true if the router can go back
	 */
	canGoBack: () => boolean

	/**
	 * Go back to the previous route in the navigation history
	 */
	back: () => void

	/**
	 * Check if the router can navigate forward
	 *
	 * @returns {boolean} true if the router can go forward
	 */
	canGoForward: () => boolean

	/**
	 * Go to the next route in the navigation history
	 */
	forward: () => void

	/**
	 * Navigate to a specific position in the navigation history
	 *
	 * @param index The index of the navigation position to navigate to
	 * @returns void
	 */
	to: (index: number) => void

	/**
	 * Push a new path to the history at the current index.
	 * @internal
	 * @param {string} path The path to add to the history
	 * @param {boolean} pushState Whether or not to call History.pushState.
	 *        Will be set to false if it's the first load or if it's called from
	 *        a popstate event.
	 * @returns void
	 */
	push: (path: string, pushState: boolean) => void

	/**
	 * Call History.pushState or History.replaceState.
	 * @internal
	 * @param path The path to add to the history
	 * @returns void
	 */
	pushState: (path: string) => void

	/**
	 * The router instance
	 * @internal
	 */
	router?: PineconeRouter

	/**
	 * Set the router instance
	 * @internal
	 * @param router The router instance to set
	 */
	setRouter: (router: PineconeRouter) => void
}

export const createNavigationHistory = (): NavigationHistory => {
	return {
		entries: [],
		index: 0,
		canGoBack: function (): boolean {
			return this.index > 0
		},

		back: function (): void {
			this.to(this.index - 1)
		},

		canGoForward: function (): boolean {
			return this.index < this.entries.length - 1
		},

		forward: function (): void {
			this.to(this.index + 1)
		},

		to: function (index: number): void {
			if (index in this.entries) {
				this.router?.navigate(this.entries[index], false, false, index)
			}
		},

		push: function (path: string, pushState: boolean): void {
			// only update history if navigating to a different path
			if (this.index < this.entries.length - 1) {
				// trim navigation history if we're not at the end
				this.entries = this.entries.slice(0, this.index + 1)
			}
			// add current path and update index
			this.entries.push(path)
			this.index = this.entries.length - 1

			if (pushState) this.pushState(path)
		},

		pushState: function (path: string): void {
			const fullPath =
				settings.hash && !path.startsWith('#') ? '#' + path : path
			const state = { path: fullPath }
			history.pushState(state, '', fullPath)
		},

		setRouter(router: PineconeRouter): void {
			this.router = router
		},
	}
}
