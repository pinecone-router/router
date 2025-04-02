import './src/style.css';
import Alpine from 'alpinejs';
import NProgress from 'nprogress';
import Persist from '@alpinejs/persist';
import PineconeRouter from './router.esm.js';

window.NProgress = NProgress;

Alpine.plugin(Persist);
Alpine.plugin(PineconeRouter);

window.Alpine = Alpine;

Alpine.start();
