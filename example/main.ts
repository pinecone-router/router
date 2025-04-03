import './src/style.css';
import 'nprogress/nprogress.css';

import Alpine, { type Alpine as AlpineType } from 'alpinejs';
import NProgress from 'nprogress';
import Persist from '@alpinejs/persist';
import PineconeRouter from '../src/index';

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
