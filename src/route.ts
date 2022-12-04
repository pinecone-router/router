import type { Handler } from './types'

class Route {
	params = {}
	path: string
	handlers: Handler[]
	constructor(path: string, options = {}) {
		this.path = path
		Object.keys(options).forEach((opt) => {
			this[opt] = options[opt]
		})
	}
	prototype: any
}

export default Route
