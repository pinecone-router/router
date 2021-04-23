class Route {
	constructor(path, settings) {
		this.path = path;
		this.settings = settings;
	}

	setProps(newProps) {
		this.props = newProps;
	}

	handle(context) {
		if (typeof this.settings.handler == 'function') {
			return this.settings.handler(context);
		}
	}
}

export default Route;
