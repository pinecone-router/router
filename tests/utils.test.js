import Alpine from 'alpinejs';
import utils from '../src/utils.js';

beforeAll(() => {
	window.Alpine = Alpine;
});

test('utils > validate links', () => {
	document.body.innerHTML = `
        <a href="/" class="root">valid</a>
		<a href="/path" class="relative">valid</a>
		<a href="./path" class="relative2">valid</a>
		<a href="https://example.com/path" class="notsameorigin">invalid</a>
    `;
	expect(utils.validLink(document.querySelector('a.root'))).toBe(true);
	expect(utils.validLink(document.querySelector('a.relative'))).toBe(true);
	expect(utils.validLink(document.querySelector('a.relative2'))).toBe(true);
	expect(utils.validLink(document.querySelector('a.notsameorigin'))).toBe(false);
});
