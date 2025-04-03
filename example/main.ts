import './src/style.css';
import Alpine, { type Alpine as AlpineType } from 'alpinejs';
import NProgress from 'nprogress';
import Persist from '@alpinejs/persist';
import PineconeRouterPlugin from 'pinecone-router';
import { test } from 'pinecone-router/handler';

test('IT IS WORKING');

declare global {
	interface Window {
		NProgress: NProgress;
		PineconeRouter: PineconeRouter;
		Alpine: AlpineType;
	}
}

window.NProgress = NProgress;

Alpine.plugin(Persist);
Alpine.plugin(PineconeRouterPlugin);

window.Alpine = Alpine;

Alpine.data('dropdown', function () {
	return {
		open: this.$persist(false),
	};
});

Alpine.start();
