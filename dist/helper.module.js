const e={start(){if(!window.Alpine)throw new Error("Alpine is required for `alpine-router-helper` to work.");if(!window.AlpineRouter)throw new Error("Import Alpine Router before importing this plugin.");Alpine.addMagicProperty("router",()=>window.AlpineRouter.currentContext)}},r=window.deferLoadingAlpine||(e=>e());window.AlpineRouterHelper=e,window.deferLoadingAlpine=function(e){window.AlpineRouterHelper.start(),r(e)};export default e;
//# sourceMappingURL=helper.module.js.map
