import './src/style.css';
import Alpine from 'alpinejs';
import PineconeRouter from './router.esm.js';

Alpine.plugin(PineconeRouter);
window.Alpine = Alpine;
Alpine.start();
