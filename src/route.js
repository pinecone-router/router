class Route {
	constructor(path, handler, router) {
		this.path = path;
		this.handler = handler;
		this.router = router;
	}

	setProps(newProps) {
		this.props = newProps;
	}

	handle() {
		return this.handler(this.props);
	}
}

export default Route;