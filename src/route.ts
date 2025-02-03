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
		if (options.templates) {
			this.programmaticTemplates = true
		}
	}
	templates: string[] = []
	templateTargetId: string = ''
	programmaticTemplates: boolean = false
	handlersDone: boolean = false
	preload: boolean = false
	cancelHandlers: boolean
}

export default Route
