declare class Route {
    params: {};
    path: string;
    handlers: Array<Function>;
    constructor(path: string, handlers?: Array<Function>);
    prototype: any;
}
export default Route;
