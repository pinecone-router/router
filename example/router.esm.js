var A=()=>{return{entries:[],index:0,canGoBack:function(){return this.index>0},back:function(){this.to(this.index-1)},canGoForward:function(){return this.index<this.entries.length-1},forward:function(){this.to(this.index+1)},to:function(j){if(j in this.entries)this.router?.navigate(this.entries[j],!1,!1,j)},push:function(j,J,b){if(this.index<this.entries.length-1)this.entries=this.entries.slice(0,this.index+1);if(this.entries.push(j),this.index=this.entries.length-1,J)this.pushState(j,b)},pushState:function(j,J){let b=J&&!j.startsWith("#")?"#"+j:j;history.pushState({path:b},"",b)},setRouter(j){this.router=j}}};var bj=(j,{targetID:J,templates:b=[],handlers:z=[],interpolate:Z=!1}={})=>({programmaticTemplates:b.length>0,pattern:zj(j),interpolate:Z,templates:b,targetID:J,handlers:z,path:j,match(Q){let H=this.pattern.exec(Q);if(H)return{...H.groups}}});function zj(j){let b=j.split("/").filter(Boolean).map((z)=>{if(!z.startsWith(":"))return"/"+z;let[,Z,Q,H]=z.match(/^:(\w+)([?+*]?)(?:\.(.+))?$/)||[],G=Q==="*"||Q==="+",K=Q==="?"||Q==="*",W=`(?<${Z}>${G?K?".*?":".+":"[^/]+?"})`,F=H?`\\.${H}`:"",X=W+F;if(K)return`(?:/${X})?`;return`/${X}`}).join("");return new RegExp(`^${b}/?$`,"i")}var I=bj;var Y={hash:!1,basePath:"",globalHandlers:[],handleClicks:!0,targetID:void 0,preload:!1},v=(j)=>{return Y={...Y,...j},Y};var Kj=(j)=>`Invalid expression type. Expression: ${j}`,x=(j)=>`Can't find an element with target ID: ${j}`,g=(j)=>`Route already exists: ${j}`;var Zj=(j)=>`x-${j} must be used on the same template as x-route`,c="targetID must be specified for programmatically added templates",d=(j)=>`Path: ${j} was not found`;function k(j){if(j.tagName.toLowerCase()!=="template")throw new TypeError("Directives can only be used on template elements.")}function U(j){if(k(j),j._x_PineconeRouter_route===void 0)throw new TypeError(Zj("template"))}function y(j){if(typeof j!="object"||!Array.isArray(j))throw new TypeError(Kj(j))}var m=(j,J,b)=>{if(j.indexOf(J)===-1)return b;let z=j[j.indexOf(J)+1];if(!z)return b;if(J==="target"){let Z=z.match(/([a-z0-9_-]+)/);if(Z)return Z[1]}return z},q=(j,J)=>{if(j=="notfound")return j;if(!j.startsWith(J))j=J+j;return j},O=(j)=>{return/^\[.*\]$|^Array\(.*\)$/.test(j.trim())},u=(j,J)=>{let b=j??J??"",z=document.getElementById(b);if(b&&!z)throw new ReferenceError(x(b));return z??void 0};var S=new Set,T=new Map,N=new Map,P=new Set,$j=(j,J)=>{document.dispatchEvent(new CustomEvent("pinecone:fetch-error",{detail:{error:j,url:J}}))},h=(j,J,b,z,Z)=>{let Q=J.id+b;if(S.has(Q))return;S.add(Q);let H=J.content,G=Array(H.childElementCount);H.querySelectorAll("script").forEach(($)=>{let W=document.createElement("script");Array.from($.attributes).forEach((F)=>W.setAttribute(F.name,F.value)),W.textContent=$.textContent,$.parentNode?.replaceChild(W,$)});let K=Array.from(H.children);for(let $=0;$<K.length;$++)G[$]=K[$].cloneNode(!0),j.addScopeToNode(G[$],{},J);j.mutateDom(()=>{if(z)z.replaceChildren(...G);else J.after(...G);G.forEach(($)=>{j.initTree($)})}),J._x_PineconeRouter_template=G,J._x_PineconeRouter_templateUrls=Z,J._x_PineconeRouter_undoTemplate=()=>{j.mutateDom(()=>{G.forEach(($)=>{j.destroyTree($),$.remove()})}),delete J._x_PineconeRouter_template,delete J._x_PineconeRouter_templateUrls},j.nextTick(()=>S.delete(Q))},E=(j)=>{if(j._x_PineconeRouter_undoTemplate)j._x_PineconeRouter_undoTemplate(),delete j._x_PineconeRouter_undoTemplate},n=async(j,J,b,z,Z)=>{if(J._x_PineconeRouter_templateUrls!=null&&J._x_PineconeRouter_templateUrls!=z)E(J),J.innerHTML="";if(J._x_PineconeRouter_template)return;if(J.content.childElementCount){h(j,J,b,Z,z);return}if(z)return _(z,J).then(()=>h(j,J,b,Z,z))},w=(j,J)=>{return j.map((b)=>b.replace(/:([^/.]+)/g,(z,Z)=>J[Z]||Z))},p=async(j,J="high")=>{if(j=q(j,Y.basePath),T.has(j))return T.get(j);if(N.has(j))return N.get(j);let b=fetch(j,{priority:J}).then((z)=>{if(!z.ok)return $j(z.statusText,j),"";return z.text()}).then((z)=>{if(z)T.set(j,z);return N.delete(j),z||""});return N.set(j,b),b},D=(j,J)=>{P.add({urls:j,el:J})},i=()=>{for(let j of P){if(j.el)_(j.urls,j.el,"low");else j.urls.map((J)=>p(J,"low"));P.delete(j)}},_=(j,J,b="high")=>Promise.all(j.map((z)=>p(z,b))).then((z)=>{J.innerHTML=z.join("")});var f=(j,J,b)=>{return{path:j,route:b,params:J}};async function o(j,J,b){let z;return new Promise(async(Z,Q)=>{b.signal.addEventListener("abort",()=>Q());for(let H of j){if(b.signal.aborted)return;let G={...J,data:z};try{z=await H(G,b)}catch(K){Q(K)}}Z()})}var s=(j,J)=>{let b=I("notfound",{handlers:[(K)=>console.error(new ReferenceError(d(K.path)))]}),z=new Map([["notfound",b]]),Z=f("",{},""),Q=null,H=!1,G={name:j,version:J,history:A(),routes:z,context:Z,get loading(){return H},set loading(K){if(H==K)return;H=K,document.dispatchEvent(new Event(K?"pinecone:start":"pinecone:end"))},settings:(K)=>v(K),add:function(K,$){if(K!="notfound"){if(K=q(K,Y.basePath),this.routes.has(K))throw new Error(g(K))}if($.templates&&(Y.preload||$.preload))D($.templates);this.routes.set(K,I(K,$))},remove:function(K){this.routes.delete(K)},navigate:async function(K,$,W,F){if(Q)Q.abort();Q=new AbortController,this.loading=!0,K=q(K||"/",Y.basePath);let X=this.routes.get("notfound"),B={};for(let[L,V]of this.routes){let R=V.match(K);if(R){B=R,X=V;break}}let M=f(K,B,X.path),C=Y.globalHandlers.concat(X.handlers);if(C.length){try{await o(C,M,Q)}catch(L){this.loading=!1;return}if(!X.templates)this.loading=!1}if(F!=null)this.history.index=F,this.history.pushState(K,Y.hash);else if(K!=this.context.path)this.history.push(K,!$&&!W,Y.hash);if(this.context=M,X.programmaticTemplates){let L=document.getElementById(X.targetID??Y.targetID??"");if(!L)throw new Error(c);let V=X.interpolate?w(X.templates,B):X.templates;_(V,L).finally(()=>this.loading=!1)}if(!X.templates)this.loading=!1}};return G.history.setRouter(G),G};var Qj=(j,J)=>{j.directive("template",(b,{expression:z,modifiers:Z},{evaluate:Q,cleanup:H,Alpine:G,effect:K})=>{U(b);let $=u(m(Z,"target"),Y.targetID),W=b._x_PineconeRouter_route,F,X=Z.includes("interpolate");if(z!=""){if(!O(z))z=`['${z}']`;let M=Q(z);if(y(M),F=M,!X&&(Y.preload||Z.includes("preload")))D(F,b);let C=J.routes.get(W);C.templates=F}let B=(M)=>{if(J.context.route===W){if(M&&X)M=w(M,J.context.params);n(G,b,z,M,$).then(()=>{J.loading=!1})}else E(b)};K(()=>B(F)),H(()=>{b._x_PineconeRouter_undoTemplate&&b._x_PineconeRouter_undoTemplate()})})},l=Qj;var Yj=(j,J)=>{j.directive("handler",(b,{expression:z,modifiers:Z},{evaluate:Q,cleanup:H})=>{if(!O(z))z=`[${z}]`;let G=Q(z);y(G);let K=G;for(let W=0;W<K.length;W++)K[W]=K[W].bind(j.$data(b));let $;if(Z.includes("global"))Y.globalHandlers=K;else{U(b);let W=b._x_PineconeRouter_route;$=J.routes.get(W),$.handlers=K}H(()=>{if(Z.includes("global"))Y.globalHandlers=[];else $.handlers=[]})}).before("template")},r=Yj;var Gj=(j,J)=>{j.directive("route",(b,{expression:z},{cleanup:Z})=>{let Q=q(z,Y.basePath);if(k(b),Q!="notfound")J.add(Q,{});b._x_PineconeRouter_route=Q,Z(()=>{J.routes.delete(Q),delete b._x_PineconeRouter_route})}).before("handler")},a=Gj;var t=(j)=>{window.document.body.addEventListener("click",(J)=>{if(J.ctrlKey||J.metaKey||J.altKey||J.shiftKey||J.button||J.defaultPrevented)return;let b=J.target.closest("a");if(!b)return;if(Y.handleClicks===!1&&!b.hasAttribute("x-link")||b.hasAttribute("data-native")||b.hasAttribute("native"))return;let z=b.getAttribute("href"),Z=b.getAttribute("target");if(z&&(!Z||/^_?self$/i.test(Z)))j.navigate(z),J.preventDefault()})};var jj="pinecone-router";var Jj="7.0.0-beta.0";var Hj=function(j){let J=j.reactive(s(jj,Jj));window.PineconeRouter=J,document.addEventListener("alpine:initialized",()=>{if(Y.hash==!1)J.navigate(location.pathname+location.search,!1,!0);else J.navigate(location.hash.substring(1),!1,!0)}),window.addEventListener("popstate",()=>{if(Y.hash){if(window.location.hash!="")J.navigate(window.location.hash.substring(1),!0)}else J.navigate(window.location.pathname,!0)}),t(J),document.addEventListener("pinecone:end",()=>j.nextTick(i),{once:!0}),l(j,J),r(j,J),a(j,J),j.$router=J,j.magic("router",()=>J),j.magic("history",()=>J.history),j.magic("params",()=>J.context.params)},b1=Hj;export{b1 as default};

//# debugId=B1FC0CE374C516E864756E2164756E21
//# sourceMappingURL=router.esm.js.map
