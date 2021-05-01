class Route {
	props = {};
	constructor(path, handlers) {
		this.path = path;
		this.handlers = handlers;
	}

	setProps(newProps) {
		this.props = newProps;
	}
}

export default Route;
