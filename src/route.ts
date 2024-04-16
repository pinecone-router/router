import type { Handler } from './types'

class Route {
	params: { [key: string]: any } = {}
	path: string
	handlers: Handler[] = []
	constructor(path: string, options: { [key: string]: any } = {}) {
		this.path = path
		Object.keys(options).forEach((opt) => {
			this[opt] = options[opt]
		})
		if (options.template) {
			this.programmaticTemplate = true
		}
	}
	template: string = ''
	templateTargetId: string = ''
	programmaticTemplate: boolean = false
	handlersDone: boolean = false
	cancelHandlers: boolean
}

export default Route
