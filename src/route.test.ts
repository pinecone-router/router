import { describe, expect, test } from 'bun:test'

import createRoute from './route'

describe('Route', () => {
	test('createRoute("/profile/:one?/:two?")', () => {
		const route = createRoute('/profile/:one?/:two?', {})
		let result = route.match('/profile')
		expect(result.match).toBe(true)
		expect(result.params).toEqual({
			one: undefined,
			two: undefined,
		})

		result = route.match('/profile/')
		expect(result.match).toBe(true)
		expect(result.params).toEqual({
			one: undefined,
			two: undefined,
		})

		result = route.match('/profile/one')
		expect(result.match).toBe(true)
		expect(result.params).toEqual({
			one: 'one',
			two: undefined,
		})

		result = route.match('/profile/one/')
		expect(result.match).toBe(true)
		expect(result.params).toEqual({
			one: 'one',
			two: undefined,
		})

		result = route.match('/profile/one/two')
		expect(result.match).toBe(true)
		expect(result.params).toEqual({
			one: 'one',
			two: 'two',
		})

		result = route.match('/profile/one/two/')
		expect(result.match).toBe(true)
		expect(result.params).toEqual({
			one: 'one',
			two: 'two',
		})

		result = route.match('/about')
		expect(result.match).toBe(false)
		expect(result.params).toBeUndefined()
	})

	test('createRoute("/about/:inf*")', () => {
		const route = createRoute('/about/:inf*', {})
		let result = route.match('/about')
		expect(result.match).toBe(false)
		expect(result.params).toBeUndefined()

		result = route.match('/about/foo/bar')
		expect(result.match).toBe(true)
		expect(result.params).toEqual({
			inf: 'foo/bar',
		})
	})

	test('createRoute("/product/:id(\\d+)")', () => {
		const route = createRoute('/product/:id(\\d+)', {})
		let result = route.match('/product')
		expect(result.match).toBe(false)
		expect(result.params).toBeUndefined()

		result = route.match('/product/string')
		expect(result.match).toBe(false)
		expect(result.params).toBeUndefined()

		result = route.match('/product/123')
		expect(result.match).toBe(true)
		expect(result.params).toEqual({
			id: '123',
		})
	})
})
