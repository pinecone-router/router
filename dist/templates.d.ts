import { type ElementWithXAttributes, type Alpine } from 'alpinejs';
import { type Context } from './context';
export declare const fetchError: (error: string, url: string) => void;
/**
 * Creates a unique instance of a template with the given expression and target element.
 * @param Alpine Alpine.js instance
 * @param template The template element to be processed.
 * @param expression The expression on the x-template directive.
 * @param targetEl The target element where the template will be rendered.
 * @param urls Template urls
 * @returns void
 */
export declare const make: (Alpine: Alpine, template: ElementWithXAttributes<HTMLTemplateElement>, expression: string, targetEl?: HTMLElement, urls?: string[]) => void;
export declare const hide: (template: ElementWithXAttributes<HTMLTemplateElement>) => void;
export declare const show: (Alpine: Alpine, template: ElementWithXAttributes<HTMLTemplateElement>, expression: string, urls?: Array<string>, targetEl?: HTMLElement) => Promise<void>;
/**
 * Interpolates params in URLs.
 * @param urls Array of template URLs.
 * @param params Object containing params to inject into URLs.
 * @returns Array of interpolated URLs.
 */
export declare const interpolate: (urls: string[], params: Context['params']) => string[];
/**
 * Load a template from a url and cache its content.
 * @param url Template URL.
 * @param priority Request priority ('high' | 'low'), default: 'high'.
 * @returns {Promise<string>} A promise that resolves to the content of
 * the template as a string.
 */
export declare const loadUrl: (url: string, priority?: RequestPriority) => Promise<string>;
/**
 * Add urls to the preload queue
 * @param urls Array of template URLs to preload
 * @param el Optional target element where to put the content of the urls
 * @returns void
 */
export declare const preload: (urls: string[], el?: HTMLElement) => void;
/**
 * Load all preloaded templates and removes them from the queue.
 * It is called when the router is initialized and the first page
 * finishes loading.
 * @returns void
 */
export declare const runPreloads: () => void;
/**
 * Load templates from urls and puts the content the el.innerHTML.
 * @param urls array of urls to load.
 * @param el target element where to put the content of the urls.
 * @param priority Request priority ('high' | 'low'), default: 'high'.
 * @returns {Promise<void>}
 */
export declare const load: (urls: string[], el: HTMLTemplateElement | HTMLElement, priority?: RequestPriority) => Promise<void>;
//# sourceMappingURL=templates.d.ts.map