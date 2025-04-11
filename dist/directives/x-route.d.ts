import { type ElementWithXAttributes, type Alpine } from 'alpinejs';
import { PineconeRouter } from '../router';
export interface RouteTemplate extends ElementWithXAttributes<HTMLTemplateElement> {
    _x_PineconeRouter_route: string;
}
declare const RouteDirective: (Alpine: Alpine, Router: PineconeRouter) => void;
export default RouteDirective;
//# sourceMappingURL=x-route.d.ts.map