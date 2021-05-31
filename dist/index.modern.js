function t(){return(t=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o])}return t}).apply(this,arguments)}class e{constructor(t,e=[]){this.params={},this.path=t,this.handlers=e}}var n=window.location;function o(t,e,n){return{route:t,path:e,params:n,query:window.location.search.substring(1),hash:window.location.hash.substring(1),redirect:t=>(window.PineconeRouter.navigate(t),"stop")}}function i(t){return t.replace(/(^\/+|\/+$)/g,"").split("/")}function r(t,...e){if(window.PineconeRouterMiddlewares)for(const n in window.PineconeRouterMiddlewares){let o=window.PineconeRouterMiddlewares[n];if(null==o[t])return;if("stop"==o[t](...e))return"stop"}}const a={name:"pinecone-router",version:"1.0.3",routes:[],settings:{hash:!1,basePath:"/",allowNoHandler:!1,middlewares:{}},currentContext:{},notfound:new e("notfound"),start(){if(!window.Alpine)throw new Error(`Alpine is required for ${this.name} to work.`);let e=0;window.Alpine.onComponentInitialized(n=>{if(n.$el.hasAttribute("x-router")){var o;if(e>1)throw new Error(`${this.name}: Only one router can be in a page.`);if(this.settings=t({},this.settings,null!=(o=n.getUnobservedData().settings)?o:{}),r("init",n,this.settings),Array.from(n.$el.children).filter(t=>"template"==t.tagName.toLowerCase()).forEach(t=>this.processRoute(t,n)),e++,!this.settings.hash)return this.navigate(window.location.pathname,!1,!0);this.navigate(window.location.hash.substring(1),!0,!0)}}),this.interceptLinks(this),window.addEventListener("popstate",()=>{this.settings.hash?""!=window.location.hash&&this.navigate(window.location.hash.substring(1),!0):this.navigate(window.location.pathname,!0)}),window.Alpine.addMagicProperty("router",()=>window.PineconeRouter.currentContext)},processRoute(t,e){var n;let o=null!=(n=t.getAttribute("x-route"))?n:"/";if(o.indexOf("#")>-1)throw new Error(`${this.name}: A route's path may not have a hash character.`);r("onBeforeRouteProcessed",t,e,o);let i=[];if(!t.hasAttribute("x-handler")&&!this.settings.allowNoHandler)throw new Error(`${this.name}: Routes must have a handler.`);if(t.hasAttribute("x-handler")){let n=function(t,e,n={}){return new Function(["$data",...Object.keys(n)],`var __alpine_result; with($data) { __alpine_result = ${t} }; return __alpine_result`)(e,...Object.values(n))}(t.getAttribute("x-handler"),e.$data);if("function"==typeof n)i=[n];else{if("object"!=typeof n)throw new Error(`${this.name}: Invalid handler type: ${typeof n}.`);i=n}"notfound"==o&&(this.notfound.handlers=i)}"notfound"!=o&&("/"!=this.settings.basePath&&(o=this.settings.basePath+o),this.add(o,i))},validLink(t,e){var o;let i={valid:!1,link:""};for(;t&&"A"!==t.nodeName.toUpperCase();)t=t.parentNode;if(!t||"A"!==t.nodeName.toUpperCase())return i;var r="object"==typeof t.href&&"SVGAnimatedString"===t.href.constructor.name;return t.hasAttribute("download")||"external"===t.getAttribute("rel")?i:(i.link=null!=(o=t.getAttribute("href"))?o:"",e||!function(t){if(!n)return!1;var e=window.location;return t.pathname===e.pathname&&t.search===e.search}(t)||!t.hash&&"#"!==i.link?i.link&&i.link.indexOf("mailto:")>-1||(r?t.target.baseVal:t.target)?i:r||function(t){if(!t||!n)return!1;var e=function(t){if("function"==typeof URL&&n)return new URL(t,window.location.toString());var e=window.document.createElement("a");return e.href=t,e}(t),o=window.location;return o.protocol===e.protocol&&o.hostname===e.hostname&&(o.port===e.port||""===o.port&&("80"==e.port||"443"==e.port))}(t.href)?(i.valid=!0,i):i:i)},interceptLinks(t){window.document.body.addEventListener(document.ontouchstart?"touchstart":"click",function(e){if(e.metaKey||e.ctrlKey||e.shiftKey||1!=e.detail||e.defaultPrevented)return;let n=e.target,o=e.path||(e.composedPath?e.composedPath():null);if(o)for(let t=0;t<o.length;t++)if(o[t].nodeName&&"A"===o[t].nodeName.toUpperCase()&&o[t].href){n=o[t];break}if(n.hasAttribute("native"))return;let i=t.validLink(n,t.settings.hash);i.valid&&(t.navigate(i.link),e.preventDefault())})},navigate(t,e=!1,n=!1){var a;null!=t||(t="/"),"/"==this.settings.basePath||t.startsWith(this.settings.basePath)||(t=this.settings.basePath+t),t!=this.settings.basePath||t.endsWith("/")||(t+="/");const s=this.routes.find(e=>{let n=function(t,e){let n,o=/(?:\?([^#]*))?(#.*)?$/,r=t.match(o),a={};if(r&&r[1]){let t=r[1].split("&");for(let e=0;e<t.length;e++){let n=t[e].split("=");a[decodeURIComponent(n[0])]=decodeURIComponent(n.slice(1).join("="))}}let s=i(t.replace(o,"")),h=i(e||""),l=Math.max(s.length,h.length);for(let t=0;t<l;t++)if(h[t]&&":"===h[t].charAt(0)){let e=h[t].replace(/(^:|[+*?]+$)/g,""),o=(h[t].match(/[+*?]+$/)||{}).toString()[0],i=~o.indexOf("+"),r=~o.indexOf("*"),l=s[t]||"";if(!l&&!r&&(o.indexOf("?")<0||i)){n=!1;break}if(a[e]=decodeURIComponent(l),i||r){a[e]=s.slice(t).map(decodeURIComponent).join("/");break}}else if(h[t]!==s[t]){n=!1;break}return!1!==n&&a}(t,e.path);return e.params=0!=n?n:{},n});let h=void 0===s?o("notfound",t,[]):o(s.path,t,s.params);if(this.currentContext=h,"stop"!=r("onBeforeHandlersExecuted",s,t,n)){if(!e){let e="";this.settings.hash?(e="#","/"!=window.location.pathname&&(e+=window.location.pathname),e+=window.location.search+t):e=t+window.location.search+window.location.hash,history.pushState({path:e},"",e)}(function(t,e){for(let n=0;n<t.length;n++)if("function"==typeof t[n]&&"stop"==t[n](e))return!1;return!0})(null!=(a=null==s?void 0:s.handlers)?a:this.notfound.handlers,h)&&r("onHandlersExecuted",s,t,n)}},add(t,n){if(null!=this.routes.find(e=>e.path==t))throw new Error("Pinecone Router: route already exist");this.routes.push(new e(t,n))},remove(t){this.routes=this.routes.filter(e=>e.path!=t)}},s=window.deferLoadingAlpine||(t=>t());window.PineconeRouter=a,window.deferLoadingAlpine=function(t){window.PineconeRouter.start(),s(t)};export default a;
//# sourceMappingURL=index.modern.js.map
