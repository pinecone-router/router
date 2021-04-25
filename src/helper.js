const AlpineRouterHelper = {
	/**
	 * Entry point of the plugin
	 */
	start() {
		if (!window.Alpine) {
			throw new Error(
				'Alpine is required for `alpine-router-helper` to work.'
			);
		}

		if (!window.AlpineRouter) {
			throw new Error(
				'Import Alpine Router before importing this plugin.'
			);
		}

		Alpine.addMagicProperty('router', () => {
			return window.AlpineRouter.currentContext;
		});
	},
};

const alpine = window.deferLoadingAlpine || ((callback) => callback());

window.AlpineRouterHelper = AlpineRouterHelper;

window.deferLoadingAlpine = function (callback) {
	window.AlpineRouterHelper.start();

	alpine(callback);
};

export default AlpineRouterHelper;
