import { describe, expect, test } from 'bun:test'
import Alpine from 'alpinejs'

import { createPineconeRouter } from './router'

const router = createPineconeRouter(Alpine, 'pinecone-router', '7.0.0')
var output = ''

// setup routes

describe('Router', () => {
	test('Router Setup', () => {
		try {
			router.add('/', {})
			router.add('/profile', {})
			router.add('/about', {})
			router.add('/redirect', {
				handlers: [
					() => router.navigate('/'),
					() => {
						output = 'this should not have happened'
					},
				],
			})
			router.add('/halt', {
				handlers: [
					(_, ctrl) => ctrl.abort(),
					() => {
						output = 'this should not have happened'
					},
				],
			})
			Alpine.start()
		} catch (error) {
			expect(error).toBeNull()
		}
	})

	test('Navigation Stack', () => {
		expect(router).toBeDefined()

		expect(router.history.entries).toEqual([])
		expect(router.history.index).toBe(0)

		router.navigate('/')
		expect(router.history.entries).toEqual(['/'])
		expect(router.history.index).toBe(0)

		expect(router.history.canGoBack()).toBe(false)
		expect(router.history.canGoForward()).toBe(false)

		router.navigate('/profile')
		expect(router.history.entries).toEqual(['/', '/profile'])
		expect(router.history.index).toBe(1)

		router.navigate('/about')
		expect(router.history.entries).toEqual(['/', '/profile', '/about'])
		expect(router.history.index).toBe(2)

		router.navigate('/')
		expect(router.history.entries).toEqual(['/', '/profile', '/about', '/'])
		expect(router.history.index).toBe(3)

		router.history.back()
		router.history.back()
		expect(router.history.entries).toEqual(['/', '/profile', '/about', '/'])
		expect(router.history.index).toBe(1)

		router.history.forward()
		expect(router.history.entries).toEqual(['/', '/profile', '/about', '/'])
		expect(router.history.index).toBe(2)

		router.navigate('/profile')
		expect(router.history.entries).toEqual([
			'/',
			'/profile',
			'/about',
			'/profile',
		])
		expect(router.history.index).toBe(3)

		router.navigate('/redirect')
		expect(router.history.entries).toEqual([
			'/',
			'/profile',
			'/about',
			'/profile',
			'/',
		])
		expect(router.history.index).toBe(4)
	})

	test('Handler redirect & halting', () => {
		expect(router).toBeDefined()
		router.navigate('/redirect')
		expect(output).toBe('')
		output = ''
		router.navigate('/halt')
		expect(output).toBe('')
	})
})
