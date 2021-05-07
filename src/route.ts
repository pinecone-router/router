class Route {
	params = {};
	path: string;
	handlers: Array<Function>;
	constructor(path: string, handlers: Array<Function>) {
		this.path = path;
		this.handlers = handlers;
	}
}

export default Route;
