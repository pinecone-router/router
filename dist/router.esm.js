var Z1=(j)=>`Invalid expression type. Expression: ${j}`,v=(j)=>`Can't find an element with target ID: ${j}`,x=(j)=>`Route already exists: ${j}`;var $1=(j)=>`x-${j} must be used on the same template as x-route`,g="targetID must be specified for programmatically added templates",c=(j)=>`Path: ${j} was not found`;function S(j){if(j.tagName.toLowerCase()!=="template")throw new TypeError("Directives can only be used on template elements.")}function y(j){if(S(j),j._x_PineconeRouter_route===void 0)throw new TypeError($1("template"))}function N(j){if(typeof j!="object"||!Array.isArray(j))throw new TypeError(Z1(j))}var d=(j,b,J)=>{if(j.indexOf(b)===-1)return J;let z=j[j.indexOf(b)+1];if(!z)return J;if(b==="target"){let Z=z.match(/([a-z0-9_-]+)/);if(Z)return Z[1]}return z},B=(j,b)=>{if(j=="notfound")return j;if(!j.startsWith(b))j=b+j;return j},O=(j)=>{return/^\[.*\]$|^Array\(.*\)$/.test(j.trim())},m=(j,b)=>{let J=j??b??"",z=document.getElementById(J);if(J&&!z)throw new ReferenceError(v(J));return z??void 0};var $={hash:!1,basePath:"",globalHandlers:[],handleClicks:!0,targetID:void 0,preload:!1},u=(j)=>{return $={...$,...j},$};var _=new Set,T=new Map,w=new Map,f=new Set,h=(j,b)=>{document.dispatchEvent(new CustomEvent("pinecone:fetch-error",{detail:{error:j,url:b}}))},p=(j,b,J,z,Z)=>{let H=b.id+J;if(_.has(H))return;_.add(H);let Q=b.content,Y=Array(Q.childElementCount);Q.querySelectorAll("script").forEach((K)=>{let G=document.createElement("script");Array.from(K.attributes).forEach((X)=>G.setAttribute(X.name,X.value)),G.textContent=K.textContent,K.parentNode?.replaceChild(G,K)});let M=Array.from(Q.children);for(let K=0;K<M.length;K++)Y[K]=M[K].cloneNode(!0),j.addScopeToNode(Y[K],{},b);j.mutateDom(()=>{if(z)z.replaceChildren(...Y);else b.after(...Y);Y.forEach((K)=>{j.initTree(K)})}),b._x_PineconeRouter_template=Y,b._x_PineconeRouter_templateUrls=Z,b._x_PineconeRouter_undoTemplate=()=>{j.mutateDom(()=>{Y.forEach((K)=>{j.destroyTree(K),K.remove()})}),delete b._x_PineconeRouter_template,delete b._x_PineconeRouter_templateUrls},j.nextTick(()=>_.delete(H))},P=(j)=>{if(j._x_PineconeRouter_undoTemplate)j._x_PineconeRouter_undoTemplate(),delete j._x_PineconeRouter_undoTemplate},n=async(j,b,J,z,Z)=>{if(b._x_PineconeRouter_templateUrls!=null&&b._x_PineconeRouter_templateUrls!=z)P(b),b.innerHTML="";if(b._x_PineconeRouter_template)return;if(b.content.childElementCount){p(j,b,J,Z,z);return}if(z)return I(z,b).then(()=>p(j,b,J,Z,z))},D=(j,b)=>{return j.map((J)=>J.replace(/:([^/.]+)/g,(z,Z)=>b[Z]||Z))},i=async(j,b="high")=>{if(j=B(j,$.basePath),T.has(j))return T.get(j);if(w.has(j))return w.get(j);let J=fetch(j,{priority:b}).then((z)=>{if(!z.ok)return h(z.statusText,j),"";return z.text()}).then((z)=>{if(z)T.set(j,z);return w.delete(j),z||""}).catch((z)=>{if(z instanceof TypeError)h(z.message,j);return""});return w.set(j,J),J},k=(j,b)=>{f.add({urls:j,el:b})},o=()=>{for(let j of f){if(j.el)I(j.urls,j.el,"low");else j.urls.map((b)=>i(b,"low"));f.delete(j)}},I=(j,b,J="high")=>Promise.all(j.map((z)=>i(z,J))).then((z)=>{b.innerHTML=z.join("")});var Q1=(j,b)=>{j.directive("template",(J,{expression:z,modifiers:Z},{evaluate:H,cleanup:Q,Alpine:Y,effect:M})=>{y(J);let K=m(d(Z,"target"),$.targetID),G=J._x_PineconeRouter_route,X,q=Z.includes("interpolate");if(z!=""){if(!O(z))z=`['${z}']`;let F=H(z);if(N(F),X=F,!q&&($.preload||Z.includes("preload")))k(X,J);let L=b.routes.get(G);L.templates=X}let W=(F)=>{if(b.context.route?.path===G){if(F&&q)F=D(F,b.context.params);n(Y,J,z,F,K).then(()=>{b.loading=!1})}else P(J)},C=M(()=>W(X));Q(()=>{J._x_PineconeRouter_undoTemplate&&J._x_PineconeRouter_undoTemplate(),Y.release(C)})})},s=Q1;var Y1=(j,b)=>{j.directive("handler",(J,{expression:z,modifiers:Z},{evaluate:H,cleanup:Q})=>{if(!O(z))z=`[${z}]`;let Y=H(z);N(Y);let M=Y;for(let G=0;G<M.length;G++)M[G]=M[G].bind(j.$data(J));let K;if(Z.includes("global"))$.globalHandlers=M;else{y(J);let G=J._x_PineconeRouter_route;K=b.routes.get(G),K.handlers=M}Q(()=>{if(Z.includes("global"))$.globalHandlers=[];else K.handlers=[]})}).before("template")},l=Y1;var G1=(j,b)=>{j.directive("route",(J,{expression:z,value:Z},{cleanup:H})=>{let Q=B(z,$.basePath);if(S(J),Q!="notfound")b.add(Q,{name:Z});J._x_PineconeRouter_route=Q,H(()=>{b.routes.delete(Q),delete J._x_PineconeRouter_route})}).before("handler")},a=G1;var r=()=>{return{entries:[],index:0,canGoBack:function(){return this.index>0},back:function(){this.to(this.index-1)},canGoForward:function(){return this.index<this.entries.length-1},forward:function(){this.to(this.index+1)},to:function(j){if(j in this.entries)this.router?.navigate(this.entries[j],!1,!1,j)},push:function(j,b,J){if(this.index<this.entries.length-1)this.entries=this.entries.slice(0,this.index+1);if(this.entries.push(j),this.index=this.entries.length-1,b)this.pushState(j,J)},pushState:function(j,b){let J=b&&!j.startsWith("#")?"#"+j:j;history.pushState({path:J},"",J)},setRouter(j){this.router=j}}};var H1=(j,{targetID:b,templates:J=[],handlers:z=[],interpolate:Z=!1,name:H}={})=>({programmaticTemplates:J.length>0,pattern:M1(j),interpolate:Z,templates:J,targetID:b,handlers:z,name:H||j,path:j,match(Q){let Y=this.pattern.exec(Q);if(Y)return{...Y.groups}}});function M1(j){let J=j.split("/").filter(Boolean).map((z)=>{if(!z.startsWith(":"))return"/"+z;let[,Z,H,Q]=z.match(/^:(\w+)([?+*]?)(?:\.(.+))?$/)||[],Y=H==="*"||H==="+",M=H==="?"||H==="*",G=`(?<${Z}>${Y?M?".*?":".+":"[^/]+?"})`,X=Q?`\\.${Q}`:"",q=G+X;if(M)return`(?:/${q})?`;return`/${q}`}).join("");return new RegExp(`^${J}/?$`,"i")}var E=H1;var R=(j,b,J)=>{return{path:j,params:b,route:J}};async function t(j,b,J){let z;return new Promise(async(Z,H)=>{J.signal.addEventListener("abort",()=>H());for(let Q of j){if(J.signal.aborted)return;let Y={...b,data:z};try{z=await Q(Y,J)}catch(M){H(M)}}Z()})}var e=(j,b,J)=>{let z=E("notfound",{handlers:[(K)=>console.error(new ReferenceError(c(K.path)))],name:"notfound"}),Z=new Map([["notfound",z]]),H=R(J,{}),Q=null,Y=!1,M={name:j,version:b,history:r(),routes:Z,context:H,get loading(){return Y},set loading(K){if(Y==K)return;Y=K,document.dispatchEvent(new Event(K?"pinecone:start":"pinecone:end"))},settings:(K)=>u(K),add:function(K,G){if(K!="notfound"){if(K=B(K,$.basePath),this.routes.has(K))throw new Error(x(K))}if(G.templates&&($.preload||G.preload))k(G.templates);this.routes.set(K,E(K,G))},remove:function(K){this.routes.delete(K)},navigate:async function(K,G,X,q){if(Q)Q.abort();Q=new AbortController,this.loading=!0,K=B(K||"/",$.basePath);let W=this.routes.get("notfound"),C={};for(let[V,U]of this.routes){let A=U.match(K);if(A){C=A,W=U;break}}let F=R(K,C,W),L=$.globalHandlers.concat(W.handlers);if(L.length){try{await t(L,F,Q)}catch(V){this.loading=!1;return}if(!W.templates)this.loading=!1}if(q!=null)this.history.index=q,this.history.pushState(K,$.hash);else if(K!=this.context.path)this.history.push(K,!G&&!X,$.hash);if(this.context=F,W.programmaticTemplates){let V=document.getElementById(W.targetID??$.targetID??"");if(!V)throw new Error(g);let U=W.interpolate?D(W.templates,C):W.templates;I(U,V).finally(()=>this.loading=!1)}if(!W.templates)this.loading=!1}};return M.history.setRouter(M),M};var j1=(j)=>{window.document.body.addEventListener("click",(b)=>{if(b.ctrlKey||b.metaKey||b.altKey||b.shiftKey||b.button||b.defaultPrevented)return;let J=b.target.closest("a");if(!J)return;if($.handleClicks===!1&&!J.hasAttribute("x-link")||J.hasAttribute("data-native")||J.hasAttribute("native"))return;let z=J.getAttribute("href"),Z=J.getAttribute("target");if(z&&(!Z||/^_?self$/i.test(Z)))j.navigate(z),b.preventDefault()})};var J1="pinecone-router",z1="7.0.0";var W1=function(j){let b=$.hash?location.hash.substring(1):location.pathname,J=j.reactive(e(J1,z1,b));window.PineconeRouter=J,document.addEventListener("alpine:initialized",()=>{J.navigate(b,!1,!0)}),window.addEventListener("popstate",()=>{if($.hash){if(window.location.hash!="")J.navigate(window.location.hash.substring(1),!0)}else J.navigate(window.location.pathname,!0)}),j1(J),document.addEventListener("pinecone:end",()=>j.nextTick(o),{once:!0}),s(j,J),l(j,J),a(j,J),j.$router=J,j.magic("router",()=>J),j.magic("history",()=>J.history),j.magic("params",()=>J.context.params)},K1=W1;var $3=K1;export{$3 as default};

//# debugId=243AE26FE7ABFBF264756E2164756E21
//# sourceMappingURL=router.esm.js.map
