import './src/style.css';
import Alpine, { type Alpine as AlpineType } from 'alpinejs';
import NProgress from 'nprogress';
import Persist from '@alpinejs/persist';
import PineconeRouter from 'pinecone-router';
declare global {
	interface Window {
		NProgress: typeof NProgress;
		Alpine: AlpineType;
	}
}

window.NProgress = NProgress;

Alpine.plugin(Persist);
Alpine.plugin(PineconeRouter);

window.Alpine = Alpine;

Alpine.data<{}, string[]>('dropdown', function () {
	return {
		open: this.$persist(false),
	};
});

Alpine.start();
