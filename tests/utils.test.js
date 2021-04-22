import Alpine from 'alpinejs';

beforeAll(() => {
	window.Alpine = Alpine;
});

test('utils > test', () => {
	expect(true).toBe(true);
});
