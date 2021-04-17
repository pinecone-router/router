class t{constructor(t,e,r){this.path=t,this.handler=e,this.router=r}setProps(t){this.props=t}handle(){return this.handler({props:this.props,path:this.path})}}class e{constructor(t,e){this.name=t,this.settings=e}}const r={isLocation:!(!window.history.location&&!window.location),validLink(t){for(;t&&"A"!==t.nodeName.toUpperCase();)t=t.parentNode;if(!t||"A"!==t.nodeName.toUpperCase())return!1;var e="object"==typeof t.href&&"SVGAnimatedString"===t.href.constructor.name;if(t.hasAttribute("download")||"external"===t.getAttribute("rel"))return!1;var r=t.getAttribute("href");return!(r&&r.indexOf("mailto:")>-1||(e?t.target.baseVal:t.target)||!e&&!this.sameOrigin(t.href))},match(t,e){let r=[],o=t.path.replace(/([:*])(\w+)/g,(t,e,o)=>(r.push(o),"([^/]+)"))+"(?:/|$)",n={},a=e.match(new RegExp(o));return null!==a&&(n=a.slice(1).reduce((t,e,o)=>(null===t&&(t={}),t[r[o]]=e,t),null)),t.setProps(n),a},toURL(t){if("function"==typeof URL&&this.isLocation)return new URL(t,window.location.toString());var e=window.document.createElement("a");return e.href=t,e},sameOrigin(t){if(!t||!this.isLocation)return!1;var e=this.toURL(t),r=window.location;return r.protocol===e.protocol&&r.hostname===e.hostname&&(r.port===e.port||""===r.port&&(80==e.port||443==e.port))},samePath(t){if(!this.isLocation)return!1;var e=window.location;return t.pathname===e.pathname&&t.search===e.search}},o={routes:[],routers:[],settings:{interceptLinks:!0,hashbang:!1},loaded:!1,notfound:function(t){console.error(`Alpine Router: requested path ${t} was not found`)},start(){if(!window.Alpine)throw new Error("Alpine is require for `Alpine Router` to work.");this.routerloaded=new Event("routerloaded"),this.loadstart=new Event("loadstart"),this.loadend=new Event("loadend");let t=document.querySelectorAll("[x-data][x-router]").length,o=0;Alpine.onComponentInitialized(r=>{if(r.$el.hasAttribute("x-router")){let n=r.$el.getAttribute("x-router");if("string"!=typeof n&&(console.warn("Alpine Router: x-router attribute should be a string of the router name or empty for default"),n="default"),""==n&&(n="default",r.$el.setAttribute("x-router",n)),this.routers.findIndex(t=>t.name==n)>-1)throw new Error(`Alpine Router: A router with the name ${n} already exist. Use a different name by setting the attribute x-router to another value`);let a={};r.$el.hasAttribute("x-base")&&(a.base=r.$el.getAttribute("x-base")),"string"!=typeof n&&(console.warn("Alpine Router: x-router attribute should be a string of the router name or empty for default"),n="default"),Array.from(r.$el.children).forEach(t=>{t.hasAttribute("x-route")&&this.processRoute(t,r,n,a)}),this.routers.push(new e(n,a)),o++,o==t&&(this.navigate(location.pathname+location.hash),this.loaded=!0,window.dispatchEvent(this.routerloaded))}}),this.settings.interceptLinks?document.querySelectorAll("a").forEach(t=>{0!=r.validLink(t)&&t.addEventListener("click",t=>{t.preventDefault(),this.navigate(t.target.getAttribute("href"))},!1)}):document.querySelectorAll("a[x-link]").forEach(t=>{t.addEventListener("click",t=>{t.preventDefault(),this.navigate(t.target.getAttribute("x-link"))},!1)}),window.addEventListener("popstate",t=>{this.navigate(null!=t.state?t.state.path:location.pathname+location.hash)})},processRoute(e,o,n,a){if("template"!==e.tagName.toLowerCase())throw new Error("Alpine Router: x-route must be used on a template tag.");if(0==e.hasAttribute("x-handler"))throw new Error('Alpine Router: x-route must have a handler (x-handler="handler")');let i=e.getAttribute("x-route");if("string"!=typeof i)throw new Error(`Alpine Router: x-route must be a string, ${typeof i} given.`);let s,l=e.getAttribute("x-handler");try{s=o.getUnobservedData()[l]}catch(t){throw new Error("Alpine Router: "+t)}if("function"!=typeof s)throw new Error(`Alpine Router: handler must be a callback function, ${typeof s} given.`);if("notfound"==i)this.notfound=s;else{if(null!=a.base&&(i=a.base+i),1==this.routes.filter(t=>r.match(t,i)).forEach(t=>{if(t.router==n)return!0}))throw new Error("Alpine Router: Route `${path}` is already registered on router `${routerName}`.");this.routes.push(new t(i,s,n))}},navigate(t){window.dispatchEvent(this.loadstart);const e=this.routes.filter(e=>r.match(e,t));0==e.length?this.notfound(t):(history.pushState({path:t},"",t),e.forEach(t=>{let e=document.querySelector(`[x-router="${t.router}"]`);e.dispatchEvent(this.loadstart),t.handle(),e.dispatchEvent(this.loadend)})),window.dispatchEvent(this.loadend)}},n=window.deferLoadingAlpine||(t=>t());window.AlpineRouter=o,window.deferLoadingAlpine=function(t){window.AlpineRouter.start(),n(t)};export default o;
//# sourceMappingURL=alpine-router.module.js.map
