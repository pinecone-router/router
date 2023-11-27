import type { Handler } from './types'

class Route {
	params: { [key: string]: any } = {}
	path: string
	handlers: Handler[] = []
	constructor(path: string, options = {}) {
		this.path = path
		Object.keys(options).forEach((opt) => {
			this[opt] = options[opt]
		})
	}
	template: ''
	handlersDone: boolean = false
	cancelHandlers: boolean
}

export default Route
