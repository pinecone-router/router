function N(b,{targetID:j,templates:y=[],handlers:J=[]}={}){return{programmaticTemplates:y.length>0,targetID:j,templates:y,handlers:J,path:b}}function E(b,j){let y={},J=/\/(:)?([\w-]+)([*?+])?(?:<([^>]+)>)?/g,K=/\/([^/]+)/g,Y=J.exec(b),z=K.exec(j);while(Y!==null){let[$,W,G,Z,B]=Y;if(z===null)return Z==="?"||Z==="*"?y:void 0;if(Z==="+"||Z==="*"){let X=f(j.slice(z.index+1));if(B&&!new RegExp(`^${B}$`).test(X))return;return y[G]=X,y}let[F,Q]=z;if(!W&&$!==F)return;if(W){if(B&&!new RegExp(`^${B}$`).test(Q))return;y[G]=f(Q)}Y=J.exec(b),z=K.exec(j)}return z===null?y:void 0}function f(b){try{return decodeURIComponent(b)}catch{return b}}var S=()=>{return{entries:[],index:0,canGoBack:function(){return this.index>0},back:function(){this.to(this.index-1)},canGoForward:function(){return this.index<this.entries.length-1},forward:function(){this.to(this.index+1)},to:function(b){if(b in this.entries)this.router?.navigate(this.entries[b],!1,!1,b)},push:function(b,j,y){if(this.index<this.entries.length-1)this.entries=this.entries.slice(0,this.index+1);if(this.entries.push(b),this.index=this.entries.length-1,j){let J=y?"#"+b:b;history.pushState({path:J},"",J)}},setRouter(b){this.router=b}}};var q={hash:!1,basePath:"/",globalHandlers:[],alwaysLoad:!1,handleClicks:!0,targetID:void 0},v=(b)=>{q={...q,...b}};var U;((y)=>{y[y.HALT=0]="HALT";y[y.CONTINUE=1]="CONTINUE"})(U||={});var C={cancel:!1,done:!1},q2=new AbortController;async function A(b,j){C.done=!1,C.cancel=!1;for(let y of b){if(C.cancel)return C.cancel=!1,0;let J=y.constructor.name==="AsyncFunction"?await y(j,U):y(j,U);if(J===0)return J}if(!C.cancel)return C.done=!0,1;return 0}var k=(b,{route:j,params:y})=>({path:b,route:j,params:y});var j2=(b)=>`Invalid expression type. Expression: ${b}.`,g=(b)=>`Can't find an element with the supplied target ID: ${b}`,R=(b)=>`Route already exists: ${b}`;var y2="Directives can only be used on template elements.",J2=(b)=>`x-${b} must be used on the same template as x-route.`,c="targetID must be specified for programmatically added templates.",x=(b)=>`Path: ${b} was not found.`;function w(b){if(b.tagName.toLowerCase()!=="template")throw new TypeError(y2)}function H(b){if(w(b),b._x_PineconeRouter_route===void 0)throw new TypeError(J2("template"))}function M(b){if(typeof b!="object"||!Array.isArray(b))throw new TypeError(j2(b))}var m=(b,j,y)=>{if(b.indexOf(j)===-1)return y;let J=b[b.indexOf(j)+1];if(!J)return y;if(j==="target"){let K=J.match(/([a-z0-9_-]+)/);if(K)return K[1]}return J},O=(b,j)=>{if(b=="notfound")return b;if(j!="/"&&!b.startsWith(j))b=j+b;if(b==j&&!b.endsWith("/"))b+="/";return b},d=(b,j)=>{let y=b??j??"",J=document.getElementById(y);if(y.length&&!J)throw new ReferenceError(g(y));return J??void 0};var _=new Map,D=new Map,I=new Set,z2=(b,j)=>{document.dispatchEvent(new CustomEvent("pinecone:fetch-error",{detail:{error:b,url:j}}))},u=(b,j,y,J,K)=>{let Y=j.id+y;if(I.has(Y))return;I.add(Y);let z=j.content,$=Array(z.childElementCount);z.querySelectorAll("script").forEach((W)=>{let G=document.createElement("script");Array.from(W.attributes).forEach((Z)=>G.setAttribute(Z.name,Z.value)),G.textContent=W.textContent,W.parentNode?.replaceChild(G,W)}),Array.from(z.children).forEach((W,G)=>{let Z=W.cloneNode(!0);$[G]=Z,b.addScopeToNode(Z,{},j)}),b.mutateDom(()=>{if(J)J.replaceChildren(...$);else j.after(...$);$.forEach((W)=>{b.initTree(W)})}),j._x_PineconeRouter_template=$,j._x_PineconeRouter_templateUrls=K,j._x_PineconeRouter_undoTemplate=()=>{b.mutateDom(()=>{$.forEach((W)=>{b.destroyTree(W),W.remove()})}),delete j._x_PineconeRouter_template,delete j._x_PineconeRouter_templateUrls},b.nextTick(()=>I.delete(Y))},T=(b)=>{if(b._x_PineconeRouter_undoTemplate)b._x_PineconeRouter_undoTemplate(),delete b._x_PineconeRouter_undoTemplate},h=(b,j,y,J,K)=>{if(j._x_PineconeRouter_templateUrls!=null&&j._x_PineconeRouter_templateUrls!=J)T(j),j.innerHTML="";if(j._x_PineconeRouter_template){V.endLoading();return}if(j.content.childElementCount){u(b,j,y,K,J),V.endLoading();return}if(J)L(J,j).then(()=>u(b,j,y,K,J)).finally(()=>V.endLoading())},i=(b,j)=>{return b.map((y)=>{return y.replace(/:([^/.]+)/g,(J,K)=>{return j[K]||K})})},o=async(b)=>{if(b=O(b,q.basePath),_.has(b))return _.get(b);if(D.has(b))return D.get(b);let j=fetch(b).then((y)=>{if(!y.ok)return z2(y.statusText,b),"";return y.text()}).then((y)=>{if(y)_.set(b,y);return D.delete(b),y||""});return D.set(b,j),j},p=(b)=>{b.forEach(o)},L=(b,j)=>Promise.all(b.map(o)).then((y)=>{j.innerHTML=y.join("")});var V={loading:!1,loadStart:new Event("pinecone:start"),loadEnd:new Event("pinecone:end"),startLoading:function(){if(!this.loading)document.dispatchEvent(this.loadStart),this.loading=!0},endLoading:function(){if(this.loading)document.dispatchEvent(this.loadEnd),this.loading=!1}},n=(b,j)=>{let y=N("notfound",{handlers:[(z)=>console.error(new ReferenceError(x(z.path)))]}),J=new Map([["notfound",y]]),K=k("",{route:y,params:{}}),Y={name:b,version:j,history:S(),routes:J,context:K,isLoading:()=>V.loading,get settings(){return q},set settings(z){v(z)},add:function(z,$){if(z!="notfound"&&this.routes.has(z))throw new Error(R(z));if($.templates&&$.preload)p($.templates);this.routes.set(z,N(z,$))},remove:function(z){this.routes.delete(z)},navigate:async function(z,$,W,G){if(!C.done)C.cancel=!0;if(z=O(z||"/",q.basePath),W&&q.hash&&z==="/")return this.navigate("/",!1,!1);let Z=this.routes.get("notfound"),B={};this.routes.forEach((X)=>{let P=E(O(X.path,q.basePath),z);if(P){B=P,Z=X;return}});let F=k(z,{...this.context,route:Z,params:B}),Q=q.globalHandlers.concat(F.route.handlers);if(q.alwaysLoad||(Q.length||F.route.templates.length)&&this.context.path!=z)V.startLoading();if(Q.length){if(await A(Q,F)==0){V.endLoading();return}if(!F.route.templates)V.endLoading()}else C.done=!0;if(G!=null)this.history.index=G;else if(z!=this.context.path)this.history.push(z,!$&&!W,q.hash);if(this.context=F,F.route.programmaticTemplates){let X=document.getElementById(F.route.targetID??q.targetID??"");if(!X)throw new Error(c);L(F.route.templates,X).finally(()=>V.endLoading())}if(q.alwaysLoad)V.endLoading()}};return Y.history.setRouter(Y),Y};var K2=(b,j)=>{b.directive("template",(y,{expression:J,modifiers:K},{evaluate:Y,cleanup:z,Alpine:$,effect:W})=>{H(y);let G=d(m(K,"target"),j.settings.targetID),Z=y._x_PineconeRouter_route,B;if(J!=""){if(J=J.trim(),!(J.startsWith("[")&&J.endsWith("]"))&&!(J.startsWith("Array")&&J.endsWith(")")))J=`['${J}']`;let Q=Y(J);if(M(Q),B=Q,K.includes("preload"))L(B,y);let X=j.routes.get(Z);X.templates=B}let F=(Q)=>{if(j.context.route.path==Z){if(Q&&K.includes("interpolate"))Q=i(Q,j.context.params);h($,y,J,Q,G)}else T(y)};$.nextTick(()=>W(()=>F(B))),z(()=>{y._x_PineconeRouter_undoTemplate&&y._x_PineconeRouter_undoTemplate()})})},s=K2;var W2=(b,j)=>{b.directive("handler",(y,{expression:J,modifiers:K},{evaluate:Y,cleanup:z})=>{if(J=J.trim(),!(J.startsWith("[")&&J.endsWith("]"))&&!(J.startsWith("Array")&&J.endsWith(")")))J=`[${J}]`;let $=Y(J);M($);let W=$;for(let Z=0;Z<W.length;Z++)W[Z]=W[Z].bind(b.$data(y));let G;if(K.includes("global"))j.settings.globalHandlers=W;else{H(y);let Z=y._x_PineconeRouter_route;G=j.routes.get(Z),G.handlers=W}z(()=>{if(K.includes("global"))j.settings.globalHandlers=[];else G.handlers=[]})}).before("template")},l=W2;var Z2=(b,j)=>{b.directive("route",(y,{expression:J},{cleanup:K})=>{let Y=J;if(w(y),Y!="notfound")j.add(Y,{});y._x_PineconeRouter_route=Y,K(()=>{j.routes.delete(Y),delete y._x_PineconeRouter_route})}).before("handler")},r=Z2;var a=(b)=>{window.document.body.addEventListener("click",(j)=>{if(j.ctrlKey||j.metaKey||j.altKey||j.shiftKey||j.button||j.defaultPrevented)return;let y=j.target.closest("a");if(!y)return;if(b.settings.handleClicks===!1&&!y.hasAttribute("x-link")||y.hasAttribute("data-native")||y.hasAttribute("native"))return;let J=y.getAttribute("href"),K=y.getAttribute("target");if(J&&J.startsWith(b.settings.basePath)&&(!K||/^_?self$/i.test(K)))b.navigate(J),j.preventDefault()})};var e="pinecone-router";var b2="7.0.0";var $2=function(b){let j=b.reactive(n(e,b2));window.PineconeRouter=j,document.addEventListener("alpine:initialized",()=>{if(j.settings.hash==!1)j.navigate(location.pathname+location.search,!1,!0);else j.navigate(location.hash.substring(1),!1,!0)}),window.addEventListener("popstate",()=>{if(j.settings.hash){if(window.location.hash!="")j.navigate(window.location.hash.substring(1),!0)}else j.navigate(window.location.pathname,!0)}),a(j),s(b,j),l(b,j),r(b,j),b.$router=j,b.$history=j.history,b.$params=j.context.params,b.magic("router",()=>j),b.magic("history",()=>j.history),b.magic("params",()=>j.context.params)},s2=$2;export{s2 as default};

//# debugId=46E5545C29D28FE964756E2164756E21
//# sourceMappingURL=router.esm.js.map
