import { buildContext } from './utils.js';

class Route {
	constructor(path, settings) {
		this.path = path;
		this.settings = settings;
	}

	setProps(newProps) {
		this.props = newProps;
	}

	handle(path) {
		if (typeof this.settings.handler == 'function') {
			return this.settings.handler(
				buildContext(this.route, path, this.props)
			);
		}
	}
}

export default Route;
