import { expect, test } from 'vitest'

import createRoute from './route'

test('Route("/profile/:one?/:two?")', () => {
	const route = createRoute('/profile/:one?/:two?', {})
	expect(route.match('/profile')).toBe(true)
	expect(route.params).toEqual({
		one: undefined,
		two: undefined,
	})

	expect(route.match('/profile/')).toBe(true)
	expect(route.params).toEqual({
		one: undefined,
		two: undefined,
	})

	expect(route.match('/profile/one')).toBe(true)
	expect(route.params).toEqual({
		one: 'one',
		two: undefined,
	})

	expect(route.match('/profile/one/')).toBe(true)
	expect(route.params).toEqual({
		one: 'one',
		two: undefined,
	})

	expect(route.match('/profile/one/two')).toBe(true)
	expect(route.params).toEqual({
		one: 'one',
		two: 'two',
	})

	expect(route.match('/profile/one/two/')).toBe(true)
	expect(route.params).toEqual({
		one: 'one',
		two: 'two',
	})

	expect(route.match('/about')).toBe(false)
	expect(route.params).toEqual({})
})

test('Route("/about/:inf*")', () => {
	const route = createRoute('/about/:inf*', {})
	expect(route.match('/about')).toBe(false)
	expect(route.params).toEqual({})

	expect(route.match('/about/foo/bar')).toBe(true)
	expect(route.params).toEqual({
		inf: 'foo/bar',
	})
})

test('Route("/product/:id(\\d+)")', () => {
	const route = createRoute('/product/:id(\\d+)', {})
	expect(route.match('/product')).toBe(false)

	expect(route.match('/product/string')).toBe(false)

	expect(route.match('/product/123')).toBe(true)
	expect(route.params).toEqual({
		id: '123',
	})
})
