import './src/style.css';
import Alpine from 'alpinejs';
import Persist from '@alpinejs/persist';
import PineconeRouter from './router.esm.js';

Alpine.plugin(Persist);
Alpine.plugin(PineconeRouter);
window.Alpine = Alpine;

Alpine.start();
