class Route {
	constructor(path, handler) {
		this.path = path;
		this.handler = handler;
	}

	setProps(newProps) {
		this.props = newProps;
	}

	handle(path) {
		if (typeof this.handler == 'function') {
			return this.handler({
				props: this.props,
				route: this.path,
				path: path,
				query: window.location.search.substring(1),
				hash: window.location.hash.substring(1),
			});
		}
	}
}

export default Route;
