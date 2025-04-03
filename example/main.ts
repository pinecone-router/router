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
window.Alpine = Alpine;

Alpine.plugin(Persist);
Alpine.plugin(PineconeRouter);

Alpine.start();
