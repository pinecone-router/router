declare class Route {
    params: {};
    path: string;
    handlers: Array<Function>;
    constructor(path: string, handlers: Array<Function>);
}
export default Route;
