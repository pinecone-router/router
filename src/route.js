import utils from './utils.js';

class Route {
	constructor(path, handler, view) {
		this.path = path;
		this.handler = handler;
		this.view = view;
	}

	setProps(newProps) {
		this.props = newProps;
	}

	handle(path) {
		if (typeof this.handler == 'function') {
			return this.handler(
				utils.buildContext(this.route, path, this.props)
			);
		}
	}
}

export default Route;
