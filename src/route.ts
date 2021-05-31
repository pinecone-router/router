import type { Handler } from '.';

class Route {
	params = {};
	path: string;
	handlers: Handler;
	constructor(path: string, handlers: Handler = []) {
		this.path = path;
		this.handlers = handlers;
	}
	prototype: any;
}

export default Route;
